// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

interface IHederaTokenService {
    struct AccountAmount {
        address accountID;
        int64 amount;
        bool isApproval;
    }

    struct NftTransfer {
        address senderAccountID;
        address receiverAccountID;
        int64 serialNumber;
        bool isApproval;
    }

    struct TokenTransferList {
        address token;
        AccountAmount[] transfers;
        NftTransfer[] nftTransfers;
    }

    function getTokenBalance(address token, address account) external view returns (int64 balance);

    function getAccountBalance(address account) external view returns (int64 balance);

    function transferFrom(address token, address sender, address recipient, int64 amount) external returns (int64 responseCode);

    function cryptoTransfer(AccountAmount[] calldata hbarTransfers, TokenTransferList[] calldata tokenTransfers)
        external
        returns (int64 responseCode);

    function isToken(address token) external view returns (bool);
}
