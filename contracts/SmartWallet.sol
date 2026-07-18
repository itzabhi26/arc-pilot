// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SmartWallet
 * @notice A minimal, non-custodial smart-contract wallet for ARC Pilot.
 *
 * The connected injected wallet (MetaMask / Rabby / OKX / WalletConnect)
 * is ONLY ever used as the `owner` — the key that is allowed to *sign*
 * instructions. It never holds the user's funds directly. Funds live in
 * this contract instead, at a stable address that is separate from the
 * signer's own EOA. Deposit / Receive simply means "send USDC to this
 * contract's address" — that works even before the contract is deployed,
 * since a plain native transfer to any address always succeeds.
 * Send / Withdraw call `execute()`, which is owner-gated and moves funds
 * *from this contract*, signed by the owner's private key.
 */
contract SmartWallet {
    address public owner;

    event Executed(address indexed to, uint256 value, bytes data, bytes result);
    event OwnerChanged(address indexed previousOwner, address indexed newOwner);
    event Received(address indexed from, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "SmartWallet: not owner");
        _;
    }

    constructor(address _owner) {
        require(_owner != address(0), "SmartWallet: zero owner");
        owner = _owner;
    }

    /// @notice Accept plain native-token transfers (Deposit / Receive).
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /// @notice Move funds or call another contract, signed by the owner.
    /// Used for Send / Withdraw from the ARC Pilot dashboard.
    function execute(address to, uint256 value, bytes calldata data)
        external
        onlyOwner
        returns (bytes memory)
    {
        require(to != address(0), "SmartWallet: zero recipient");
        (bool ok, bytes memory result) = to.call{value: value}(data);
        require(ok, "SmartWallet: call failed");
        emit Executed(to, value, data, result);
        return result;
    }

    /// @notice Batch multiple calls in a single owner-signed transaction.
    function executeBatch(address[] calldata to, uint256[] calldata value, bytes[] calldata data)
        external
        onlyOwner
    {
        require(to.length == value.length && to.length == data.length, "SmartWallet: length mismatch");
        for (uint256 i = 0; i < to.length; i++) {
            (bool ok, bytes memory result) = to[i].call{value: value[i]}(data[i]);
            require(ok, "SmartWallet: call failed");
            emit Executed(to[i], value[i], data[i], result);
        }
    }

    /// @notice Rotate the signer that controls this wallet (e.g. new device).
    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SmartWallet: zero owner");
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }
}
