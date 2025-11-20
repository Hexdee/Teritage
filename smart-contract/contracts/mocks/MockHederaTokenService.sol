// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHederaTokenService} from "../hedera/IHederaTokenService.sol";
import {HederaResponseCodes} from "../hedera/HederaResponseCodes.sol";

/**
 * @dev Lightweight in-memory mock of the Hedera token/account precompiles.
 *      Only the methods exercised by the tests and local scripts are modelled.
 */
contract MockHederaTokenService {
    struct TokenConfig {
        bool exists;
    }

    int64 private constant RESPONSE_SUCCESS = int64(HederaResponseCodes.SUCCESS);
    int64 private constant RESPONSE_INVALID_TOKEN = int64(HederaResponseCodes.INVALID_TOKEN_ID);
    int64 private constant RESPONSE_NOT_SUPPORTED = int64(HederaResponseCodes.NOT_SUPPORTED);
    int64 private constant RESPONSE_INSUFFICIENT_TOKEN_BALANCE = int64(HederaResponseCodes.INSUFFICIENT_TOKEN_BALANCE);
    int64 private constant RESPONSE_INSUFFICIENT_ACCOUNT_BALANCE = int64(HederaResponseCodes.INSUFFICIENT_ACCOUNT_BALANCE);
    int64 private constant RESPONSE_ZERO_SUM_MISMATCH = int64(HederaResponseCodes.TRANSFER_LIST_SIZE_LIMIT_EXCEEDED);
    int64 private constant RESPONSE_NOT_ASSOCIATED = 33;
    int64 private constant RESPONSE_SPENDER_WITHOUT_ALLOWANCE = 1401;

    mapping(address => TokenConfig) private _tokens;
    mapping(address => mapping(address => bool)) private _associations;
    mapping(address => mapping(address => uint256)) private _tokenBalances;
    mapping(address => mapping(address => mapping(address => uint256))) private _tokenAllowances;

    mapping(address => uint256) private _hbarBalances;
    mapping(address => mapping(address => uint256)) private _hbarAllowances;

    event TokenConfigured(address indexed token, bool isToken);
    event TokenBalanceUpdated(address indexed token, address indexed account, uint256 balance);
    event TokenAllowanceUpdated(address indexed token, address indexed owner, address indexed spender, uint256 amount);
    event HbarBalanceUpdated(address indexed account, uint256 balance);
    event HbarAllowanceUpdated(address indexed owner, address indexed spender, uint256 amount);

    // --- helpers used by tests/scripts ---------------------------------------------------------

    function configureToken(address token, bool status) external {
        _tokens[token].exists = status;
        emit TokenConfigured(token, status);
    }

    function setAssociation(address token, address account, bool associated) external {
        _associations[token][account] = associated;
    }

    function setBalance(address token, address account, uint256 amount) external {
        _tokenBalances[token][account] = amount;
        emit TokenBalanceUpdated(token, account, amount);
    }

    function getTokenBalance(address token, address account) external view returns (uint256) {
        return _tokenBalances[token][account];
    }

    function setAllowance(address token, address owner, address spender, uint256 amount) external {
        _tokenAllowances[token][owner][spender] = amount;
        emit TokenAllowanceUpdated(token, owner, spender, amount);
    }

    function setHbarBalance(address account, uint256 amount) external {
        _hbarBalances[account] = amount;
        emit HbarBalanceUpdated(account, amount);
    }

    function getAccountBalance(address account) external view returns (uint256) {
        return _hbarBalances[account];
    }

    function setHbarAllowance(address owner, address spender, uint256 amount) external {
        _hbarAllowances[owner][spender] = amount;
        emit HbarAllowanceUpdated(owner, spender, amount);
    }

    // --- Precompile shims ----------------------------------------------------------------------

    function isToken(address token) external view returns (int64 responseCode, bool isTokenFlag) {
        bool exists = _tokens[token].exists;
        return (RESPONSE_SUCCESS, exists);
    }

    function transferFrom(address token, address from, address to, uint256 amount) external returns (int64) {
        if (!_tokens[token].exists) {
            return RESPONSE_INVALID_TOKEN;
        }
        if (!_associations[token][from] || !_associations[token][to]) {
            return RESPONSE_NOT_ASSOCIATED;
        }

        uint256 allowance = _tokenAllowances[token][from][msg.sender];
        if (allowance < amount) {
            return RESPONSE_SPENDER_WITHOUT_ALLOWANCE;
        }

        uint256 ownerBalance = _tokenBalances[token][from];
        if (ownerBalance < amount) {
            return RESPONSE_INSUFFICIENT_TOKEN_BALANCE;
        }

        _tokenAllowances[token][from][msg.sender] = allowance - amount;
        _tokenBalances[token][from] = ownerBalance - amount;
        _tokenBalances[token][to] += amount;

        return RESPONSE_SUCCESS;
    }

    function cryptoTransfer(
        IHederaTokenService.TransferList memory transferList,
        IHederaTokenService.TokenTransferList[] memory tokenTransfers
    ) external returns (int64) {
        if (tokenTransfers.length > 0) {
            return RESPONSE_NOT_SUPPORTED;
        }

        uint256 positiveTotal;
        uint256 negativeTotal;

        for (uint256 i = 0; i < transferList.transfers.length; i++) {
            IHederaTokenService.AccountAmount memory entry = transferList.transfers[i];
            if (entry.amount == 0) continue;

            if (entry.amount < 0) {
                uint256 value = uint256(int256(-entry.amount));
                if (_hbarBalances[entry.accountID] < value) {
                    return RESPONSE_INSUFFICIENT_ACCOUNT_BALANCE;
                }

                if (entry.isApproval) {
                    uint256 allowance = _hbarAllowances[entry.accountID][msg.sender];
                    if (allowance < value) {
                        return RESPONSE_SPENDER_WITHOUT_ALLOWANCE;
                    }
                    _hbarAllowances[entry.accountID][msg.sender] = allowance - value;
                } else if (entry.accountID != msg.sender) {
                    return RESPONSE_SPENDER_WITHOUT_ALLOWANCE;
                }

                _hbarBalances[entry.accountID] -= value;
                negativeTotal += value;
            } else {
                uint256 credit = uint256(uint64(entry.amount));
                _hbarBalances[entry.accountID] += credit;
                positiveTotal += credit;
            }
        }

        if (positiveTotal != negativeTotal) {
            return RESPONSE_ZERO_SUM_MISMATCH;
        }

        return RESPONSE_SUCCESS;
    }

    function redirectForToken(address token, bytes calldata encodedFunctionSelector)
        external
        view
        returns (int64, bytes memory)
    {
        if (!_tokens[token].exists) {
            return (int64(HederaResponseCodes.INVALID_TOKEN_ID), bytes(""));
        }
        bytes memory data = encodedFunctionSelector;
        if (data.length < 24) {
            return (int64(HederaResponseCodes.BAD_ENCODING), bytes(""));
        }

        // Assume balanceOf(address) payload
        uint160 acc;
        for (uint256 i = data.length - 20; i < data.length; i++) {
            acc = (acc << 8) | uint8(data[i]);
        }
        address account = address(acc);
        uint256 balance = _tokenBalances[token][account];
        return (RESPONSE_SUCCESS, abi.encode(balance));
    }
}
