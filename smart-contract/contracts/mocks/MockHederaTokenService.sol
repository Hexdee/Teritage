// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {IHederaTokenService} from "../hedera/IHederaTokenService.sol";
import {HederaResponseCodes} from "../hedera/HederaResponseCodes.sol";

/**
 * @dev Lightweight mock of the Hedera Token Service precompile for local testing.
 */
contract MockHederaTokenService is IHederaTokenService {
    int64 private constant TOKEN_NOT_ASSOCIATED_TO_ACCOUNT = 33;
    int64 private constant SPENDER_WITHOUT_ALLOWANCE = 1401;
    int64 private constant INSUFFICIENT_BALANCE = 125;

    mapping(address => bool) private _isToken;
    mapping(address => mapping(address => bool)) private _associated;
    mapping(address => mapping(address => int64)) private _balances;
    mapping(address => mapping(address => mapping(address => int64))) private _allowances;

    mapping(address => int64) private _hbarBalances;
    mapping(address => mapping(address => int64)) private _hbarAllowances;

    event MockAssociationUpdated(address indexed token, address indexed account, bool associated);
    event MockBalanceUpdated(address indexed token, address indexed account, int64 balance);
    event MockAllowanceUpdated(address indexed token, address indexed owner, address indexed spender, int64 allowance);
    event MockHbarBalanceUpdated(address indexed account, int64 balance);
    event MockHbarAllowanceUpdated(address indexed owner, address indexed spender, int64 allowance);

    function configureToken(address token, bool value) external {
        _isToken[token] = value;
    }

    function setAssociation(address token, address account, bool value) external {
        _associated[token][account] = value;
        emit MockAssociationUpdated(token, account, value);
    }

    function setBalance(address token, address account, int64 balance) external {
        _balances[token][account] = balance;
        emit MockBalanceUpdated(token, account, balance);
    }

    function setAllowance(address token, address owner, address spender, int64 allowance) external {
        _allowances[token][owner][spender] = allowance;
        emit MockAllowanceUpdated(token, owner, spender, allowance);
    }

    function setHbarBalance(address account, int64 balance) external {
        _hbarBalances[account] = balance;
        emit MockHbarBalanceUpdated(account, balance);
    }

    function setHbarAllowance(address owner, address spender, int64 allowance) external {
        _hbarAllowances[owner][spender] = allowance;
        emit MockHbarAllowanceUpdated(owner, spender, allowance);
    }

    function getTokenBalance(address token, address account) external view override returns (int64 balance) {
        return _balances[token][account];
    }

    function getAccountBalance(address account) external view override returns (int64 balance) {
        return _hbarBalances[account];
    }

    function transferFrom(address token, address sender, address recipient, int64 amount)
        external
        override
        returns (int64 responseCode)
    {
        if (!_isToken[token]) {
            return TOKEN_NOT_ASSOCIATED_TO_ACCOUNT;
        }

        if (!_associated[token][sender] || !_associated[token][recipient]) {
            return TOKEN_NOT_ASSOCIATED_TO_ACCOUNT;
        }

        if (_balances[token][sender] < amount) {
            return INSUFFICIENT_BALANCE;
        }

        int64 available = _allowances[token][sender][msg.sender];
        if (available < amount) {
            return SPENDER_WITHOUT_ALLOWANCE;
        }

        unchecked {
            _allowances[token][sender][msg.sender] = available - amount;
            _balances[token][sender] -= amount;
            _balances[token][recipient] += amount;
        }

        return HederaResponseCodes.SUCCESS;
    }

    function cryptoTransfer(AccountAmount[] calldata hbarTransfers, TokenTransferList[] calldata tokenTransfers)
        external
        override
        returns (int64 responseCode)
    {
        if (tokenTransfers.length != 0) {
            return TOKEN_NOT_ASSOCIATED_TO_ACCOUNT;
        }

        for (uint256 i = 0; i < hbarTransfers.length; i++) {
            AccountAmount calldata entry = hbarTransfers[i];
            if (entry.amount < 0) {
                int64 debit = int64(-entry.amount);
                if (_hbarBalances[entry.accountID] < debit) {
                    return INSUFFICIENT_BALANCE;
                }
                if (entry.isApproval) {
                    int64 allowance = _hbarAllowances[entry.accountID][msg.sender];
                    if (allowance < debit) {
                        return SPENDER_WITHOUT_ALLOWANCE;
                    }
                } else if (entry.accountID != msg.sender) {
                    return SPENDER_WITHOUT_ALLOWANCE;
                }
            }
        }

        for (uint256 i = 0; i < hbarTransfers.length; i++) {
            AccountAmount calldata entry = hbarTransfers[i];
            if (entry.amount < 0) {
                int64 debit = int64(-entry.amount);
                if (entry.isApproval) {
                    _hbarAllowances[entry.accountID][msg.sender] -= debit;
                }
                _hbarBalances[entry.accountID] -= debit;
            } else if (entry.amount > 0) {
                _hbarBalances[entry.accountID] += entry.amount;
            }
        }

        return HederaResponseCodes.SUCCESS;
    }

    function isToken(address token) external view override returns (bool) {
        return _isToken[token];
    }
}
