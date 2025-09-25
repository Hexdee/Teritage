// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {IHederaTokenService} from "./hedera/IHederaTokenService.sol";
import {HederaResponseCodes} from "./hedera/HederaResponseCodes.sol";

/**
 * @title TeritageInheritance
 * @notice Manages decentralized inheritance plans with inactivity-based claiming across ERC-20, HTS and HBAR assets.
 * @dev Estate owners configure inheritors, token lists, and check-in cadence. When the owner fails to
 *      check in before the configured interval elapses, inheritors can trigger a claim that distributes
 *      assets using ERC-20 allowances, HTS allowances, or HBAR allowances (via the crypto transfer precompile).
 */
contract TeritageInheritance is ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint96 private constant BASIS_POINTS = 10_000;
    IHederaTokenService private constant HEDERA = IHederaTokenService(address(0x167));

    enum TokenType {
        ERC20,
        HTS,
        HBAR
    }

    struct TokenConfig {
        address token;
        TokenType tokenType;
    }

    struct Plan {
        address[] inheritors;
        uint96[] shares;
        TokenConfig[] tokens;
        uint64 checkInInterval;
        uint64 lastCheckIn;
        bool isClaimed;
        bool exists;
    }

    mapping(address => Plan) private plans;

    event PlanCreated(
        address indexed owner,
        address[] inheritors,
        uint96[] shares,
        address[] tokens,
        uint8[] tokenTypes,
        uint64 checkInInterval
    );
    event InheritorsUpdated(address indexed owner, address[] inheritors, uint96[] shares);
    event TokensUpdated(address indexed owner, address[] tokens, uint8[] tokenTypes);
    event CheckInIntervalUpdated(address indexed owner, uint64 newInterval);
    event OwnerCheckedIn(address indexed owner, uint64 timestamp);
    event InheritanceClaimInitiated(address indexed owner, address indexed triggeredBy, uint64 timestamp);
    event InheritanceDistributed(
        address indexed owner,
        address indexed inheritor,
        address indexed token,
        uint256 amount,
        address triggeredBy
    );
    event PlanCleared(address indexed owner);

    error PlanAlreadyExists();
    error PlanInactive();
    error PlanNotFound();
    error PlanAlreadyClaimed();
    error InvalidConfiguration();
    error NotInheritor();
    error ClaimNotAvailable();
    error NothingToDistribute();
    error InsufficientAllowance(address token, uint256 currentAllowance, uint256 requiredAllowance);
    error HederaTokenTransferFailed(address token, int64 responseCode);
    error HederaTransferAmountOverflow(address token, int256 requestedAmount);

    /**
     * @notice Create a new inheritance plan for the caller.
     * @param inheritors Addresses that will receive distributions.
     * @param shares Percentage share for each inheritor, expressed in basis points.
     * @param tokens Token addresses that will be distributed when claimed (use address(0) for HBAR entries).
     * @param tokenTypes Encoded token types aligned with `tokens` (0 = ERC20, 1 = HTS, 2 = HBAR).
     * @param checkInInterval Maximum seconds allowed between check-ins before inheritors can claim.
     */
    function createPlan(
        address[] calldata inheritors,
        uint96[] calldata shares,
        address[] calldata tokens,
        uint8[] calldata tokenTypes,
        uint64 checkInInterval
    ) external {
        Plan storage existing = plans[msg.sender];
        if (existing.exists) {
            if (!existing.isClaimed) revert PlanAlreadyExists();
            delete plans[msg.sender];
        }

        _validateConfiguration(inheritors, shares, tokens, tokenTypes, checkInInterval);

        Plan storage plan = plans[msg.sender];
        plan.exists = true;
        plan.isClaimed = false;
        plan.checkInInterval = checkInInterval;
        plan.lastCheckIn = uint64(block.timestamp);

        _setInheritors(plan, inheritors, shares);
        _setTokens(plan, tokens, tokenTypes);

        emit PlanCreated(msg.sender, inheritors, shares, tokens, tokenTypes, checkInInterval);
    }

    /**
     * @notice Update inheritors and their percentage allocations.
     * @param inheritors Updated inheritor addresses.
     * @param shares Updated shares that must sum to 10,000 basis points (100%).
     */
    function updateInheritors(address[] calldata inheritors, uint96[] calldata shares) external {
        Plan storage plan = _requireActivePlan(msg.sender);
        _validateShares(inheritors, shares);
        _setInheritors(plan, inheritors, shares);

        emit InheritorsUpdated(msg.sender, inheritors, shares);
    }

    /**
     * @notice Update the list of tokens managed by the plan.
     * @param tokens Updated token addresses (use address(0) for HBAR entries).
     * @param tokenTypes Updated encoded token types aligned with `tokens`.
     */
    function updateTokens(address[] calldata tokens, uint8[] calldata tokenTypes) external {
        Plan storage plan = _requireActivePlan(msg.sender);
        _validateTokens(tokens, tokenTypes);
        _setTokens(plan, tokens, tokenTypes);
        emit TokensUpdated(msg.sender, tokens, tokenTypes);
    }

    /**
     * @notice Update the maximum check-in interval in seconds.
     * @param newInterval New maximum duration between check-ins before claims unlock.
     */
    function updateCheckInInterval(uint64 newInterval) external {
        Plan storage plan = _requireActivePlan(msg.sender);
        if (newInterval == 0) revert InvalidConfiguration();
        plan.checkInInterval = newInterval;
        emit CheckInIntervalUpdated(msg.sender, newInterval);
    }

    /**
     * @notice Record a heartbeat from the plan owner to keep the plan active.
     */
    function checkIn() external {
        Plan storage plan = _requirePlan(msg.sender);
        if (plan.isClaimed) revert PlanAlreadyClaimed();
        plan.lastCheckIn = uint64(block.timestamp);
        emit OwnerCheckedIn(msg.sender, plan.lastCheckIn);
    }

    /**
     * @notice Permanently remove an existing plan (only callable before a claim happens).
     */
    function clearPlan() external {
        Plan storage plan = _requirePlan(msg.sender);
        if (plan.isClaimed) revert PlanAlreadyClaimed();

        delete plans[msg.sender];
        emit PlanCleared(msg.sender);
    }

    /**
     * @notice Trigger distribution to inheritors once the owner misses the check-in deadline.
     * @param owner Address of the plan owner whose assets are being claimed.
     */
    function claimInheritance(address owner) external nonReentrant {
        Plan storage plan = _requirePlan(owner);
        if (plan.isClaimed) revert PlanAlreadyClaimed();

        if (_indexOfInheritor(plan, msg.sender) == type(uint256).max) revert NotInheritor();
        if (!_isClaimable(plan)) revert ClaimNotAvailable();
        if (plan.tokens.length == 0) revert InvalidConfiguration();

        emit InheritanceClaimInitiated(owner, msg.sender, uint64(block.timestamp));

        uint256 totalDistributed;

        for (uint256 t = 0; t < plan.tokens.length; t++) {
            TokenConfig storage tokenConfig = plan.tokens[t];
            if (tokenConfig.tokenType == TokenType.ERC20) {
                totalDistributed += _distributeErc20Token(plan, tokenConfig.token, owner);
            } else if (tokenConfig.tokenType == TokenType.HTS) {
                totalDistributed += _distributeHtsToken(plan, tokenConfig.token, owner);
            } else {
                totalDistributed += _distributeHbar(plan, owner);
            }
        }

        if (totalDistributed == 0) revert NothingToDistribute();

        plan.isClaimed = true;
    }

    /**
     * @notice Check whether a plan is claimable based on the check-in schedule.
     * @param owner Address of the estate owner.
     * @return claimable True if the plan can be claimed.
     * @return nextDeadline Timestamp when the next check-in would be due.
     */
    function getClaimStatus(address owner) external view returns (bool claimable, uint256 nextDeadline) {
        Plan storage plan = plans[owner];
        if (!plan.exists) return (false, 0);
        nextDeadline = uint256(plan.lastCheckIn) + uint256(plan.checkInInterval);
        claimable = plan.checkInInterval > 0 && block.timestamp > nextDeadline && !plan.isClaimed;
    }

    /**
     * @notice Retrieve the full plan details for an owner.
     */
    function getPlan(address owner)
        external
        view
        returns (
            address[] memory inheritors,
            uint96[] memory shares,
            address[] memory tokens,
            uint8[] memory tokenTypes,
            uint64 checkInInterval,
            uint64 lastCheckIn,
            bool isClaimed,
            bool exists
        )
    {
        Plan storage plan = plans[owner];
        inheritors = plan.inheritors;
        shares = plan.shares;
        tokens = new address[](plan.tokens.length);
        tokenTypes = new uint8[](plan.tokens.length);
        for (uint256 i = 0; i < plan.tokens.length; i++) {
            tokens[i] = plan.tokens[i].token;
            tokenTypes[i] = uint8(plan.tokens[i].tokenType);
        }
        checkInInterval = plan.checkInInterval;
        lastCheckIn = plan.lastCheckIn;
        isClaimed = plan.isClaimed;
        exists = plan.exists;
    }

    function _distributeErc20Token(Plan storage plan, address tokenAddr, address owner) private returns (uint256 distributed) {
        IERC20 token = IERC20(tokenAddr);
        uint256 balance = token.balanceOf(owner);
        if (balance == 0) {
            return 0;
        }

        uint256 allowance = token.allowance(owner, address(this));
        if (allowance < balance) {
            revert InsufficientAllowance(tokenAddr, allowance, balance);
        }

        uint256 remaining = balance;

        for (uint256 i = 0; i < plan.inheritors.length; i++) {
            address beneficiary = plan.inheritors[i];
            uint256 shareAmount;
            if (i + 1 == plan.inheritors.length) {
                shareAmount = remaining;
            } else {
                shareAmount = (balance * plan.shares[i]) / BASIS_POINTS;
                if (shareAmount > remaining) {
                    shareAmount = remaining;
                }
            }

            if (shareAmount == 0) {
                continue;
            }

            remaining -= shareAmount;
            distributed += shareAmount;
            token.safeTransferFrom(owner, beneficiary, shareAmount);
            emit InheritanceDistributed(owner, beneficiary, tokenAddr, shareAmount, msg.sender);
        }

        if (distributed == 0) revert NothingToDistribute();
    }

    function _distributeHtsToken(Plan storage plan, address tokenAddr, address owner) private returns (uint256 distributed) {
        int64 balance = HEDERA.getTokenBalance(tokenAddr, owner);
        if (balance <= 0) {
            return 0;
        }

        int256 total = int256(balance);
        int256 remaining = total;
        bool distributedForToken;

        for (uint256 i = 0; i < plan.inheritors.length; i++) {
            address beneficiary = plan.inheritors[i];
            int256 shareAmount;
            if (i + 1 == plan.inheritors.length) {
                shareAmount = remaining;
            } else {
                shareAmount = (total * int256(uint256(plan.shares[i]))) / int256(uint256(BASIS_POINTS));
                if (shareAmount > remaining) {
                    shareAmount = remaining;
                }
            }

            if (shareAmount <= 0) {
                continue;
            }

            if (shareAmount > int256(type(int64).max)) {
                revert HederaTransferAmountOverflow(tokenAddr, shareAmount);
            }

            int64 amount64 = int64(shareAmount);
            int64 response = HEDERA.transferFrom(tokenAddr, owner, beneficiary, amount64);
            if (response != HederaResponseCodes.SUCCESS) {
                revert HederaTokenTransferFailed(tokenAddr, response);
            }

            uint256 shareUint = uint256(shareAmount);
            distributed += shareUint;
            distributedForToken = true;
            remaining -= shareAmount;

            emit InheritanceDistributed(owner, beneficiary, tokenAddr, shareUint, msg.sender);
        }

        if (!distributedForToken) revert NothingToDistribute();
    }

    function _distributeHbar(Plan storage plan, address owner) private returns (uint256 distributed) {
        int64 balance = HEDERA.getAccountBalance(owner);
        if (balance <= 0) {
            return 0;
        }

        int256 total = int256(balance);
        int256 remaining = total;
        bool distributedForToken;

        for (uint256 i = 0; i < plan.inheritors.length; i++) {
            address beneficiary = plan.inheritors[i];
            int256 shareAmount;
            if (i + 1 == plan.inheritors.length) {
                shareAmount = remaining;
            } else {
                shareAmount = (total * int256(uint256(plan.shares[i]))) / int256(uint256(BASIS_POINTS));
                if (shareAmount > remaining) {
                    shareAmount = remaining;
                }
            }

            if (shareAmount <= 0) {
                continue;
            }

            if (shareAmount > int256(type(int64).max)) {
                revert HederaTransferAmountOverflow(address(0), shareAmount);
            }

            int64 amount64 = int64(shareAmount);

            IHederaTokenService.AccountAmount[] memory hbarTransfers = new IHederaTokenService.AccountAmount[](2);
            hbarTransfers[0] = IHederaTokenService.AccountAmount({accountID: owner, amount: -amount64, isApproval: true});
            hbarTransfers[1] = IHederaTokenService.AccountAmount({accountID: beneficiary, amount: amount64, isApproval: false});

            int64 response = HEDERA.cryptoTransfer(hbarTransfers, new IHederaTokenService.TokenTransferList[](0));
            if (response != HederaResponseCodes.SUCCESS) {
                revert HederaTokenTransferFailed(address(0), response);
            }

            uint256 shareUint = uint256(shareAmount);
            distributed += shareUint;
            distributedForToken = true;
            remaining -= shareAmount;

            emit InheritanceDistributed(owner, beneficiary, address(0), shareUint, msg.sender);
        }

        if (!distributedForToken) revert NothingToDistribute();
    }

    function _requirePlan(address owner) private view returns (Plan storage plan) {
        plan = plans[owner];
        if (!plan.exists) revert PlanNotFound();
    }

    function _requireActivePlan(address owner) private view returns (Plan storage plan) {
        plan = plans[owner];
        if (!plan.exists) revert PlanNotFound();
        if (plan.isClaimed) revert PlanInactive();
    }

    function _setInheritors(Plan storage plan, address[] calldata inheritors, uint96[] calldata shares) private {
        delete plan.inheritors;
        delete plan.shares;
        for (uint256 i = 0; i < inheritors.length; i++) {
            plan.inheritors.push(inheritors[i]);
            plan.shares.push(shares[i]);
        }
    }

    function _setTokens(Plan storage plan, address[] calldata tokens, uint8[] calldata tokenTypes) private {
        delete plan.tokens;
        for (uint256 i = 0; i < tokens.length; i++) {
            plan.tokens.push(TokenConfig({token: tokens[i], tokenType: _decodeTokenType(tokenTypes[i])}));
        }
    }

    function _validateConfiguration(
        address[] calldata inheritors,
        uint96[] calldata shares,
        address[] calldata tokens,
        uint8[] calldata tokenTypes,
        uint64 checkInInterval
    ) private view {
        if (checkInInterval == 0) revert InvalidConfiguration();
        _validateShares(inheritors, shares);
        _validateTokens(tokens, tokenTypes);
    }

    function _validateShares(address[] calldata inheritors, uint96[] calldata shares) private pure {
        if (inheritors.length == 0 || inheritors.length != shares.length) revert InvalidConfiguration();
        uint256 total;
        for (uint256 i = 0; i < inheritors.length; i++) {
            if (inheritors[i] == address(0)) revert InvalidConfiguration();
            if (shares[i] == 0) revert InvalidConfiguration();
            total += shares[i];
            for (uint256 j = i + 1; j < inheritors.length; j++) {
                if (inheritors[i] == inheritors[j]) revert InvalidConfiguration();
            }
        }
        if (total != BASIS_POINTS) revert InvalidConfiguration();
    }

    function _validateTokens(address[] calldata tokens, uint8[] calldata tokenTypes) private view {
        if (tokens.length == 0 || tokens.length != tokenTypes.length) revert InvalidConfiguration();

        bool seenHbar;

        for (uint256 i = 0; i < tokens.length; i++) {
            TokenType tokenType = _decodeTokenType(tokenTypes[i]);

            if (tokenType == TokenType.HBAR) {
                if (tokens[i] != address(0)) revert InvalidConfiguration();
                if (seenHbar) revert InvalidConfiguration();
                seenHbar = true;
                continue;
            }

            if (tokens[i] == address(0)) revert InvalidConfiguration();

            for (uint256 j = i + 1; j < tokens.length; j++) {
                TokenType otherType = _decodeTokenType(tokenTypes[j]);
                if (otherType == TokenType.HBAR) continue;
                if (tokens[i] == tokens[j]) revert InvalidConfiguration();
            }

            if (tokenType == TokenType.HTS && !HEDERA.isToken(tokens[i])) revert InvalidConfiguration();
        }
    }

    function _decodeTokenType(uint8 raw) private pure returns (TokenType) {
        if (raw > uint8(TokenType.HBAR)) revert InvalidConfiguration();
        return TokenType(raw);
    }

    function _indexOfInheritor(Plan storage plan, address account) private view returns (uint256) {
        for (uint256 i = 0; i < plan.inheritors.length; i++) {
            if (plan.inheritors[i] == account) {
                return i;
            }
        }
        return type(uint256).max;
    }

    function _isClaimable(Plan storage plan) private view returns (bool) {
        if (plan.checkInInterval == 0) return false;
        return block.timestamp > uint256(plan.lastCheckIn) + uint256(plan.checkInInterval);
    }
}
