// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SmartWallet} from "./SmartWallet.sol";

/**
 * @title SmartWalletFactory
 * @notice Deploys a deterministic (CREATE2) SmartWallet per owner address.
 *
 * Because the address only depends on `factory address + owner address`,
 * ARC Pilot can compute a user's Smart Wallet address the instant they
 * connect a signer — before any transaction is sent — and use it as the
 * dashboard address for Deposit/Receive right away. `deploy()` is only
 * required once, before the wallet can originate outgoing Send/Withdraw
 * transactions.
 */
contract SmartWalletFactory {
    event WalletDeployed(address indexed owner, address indexed wallet);

    /// @notice Deterministic address for `owner`, whether or not it's deployed yet.
    function computeAddress(address owner) public view returns (address) {
        bytes32 salt = _salt(owner);
        bytes memory bytecode = _creationCode(owner);
        bytes32 hash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(bytecode))
        );
        return address(uint160(uint256(hash)));
    }

    /// @notice Deploys the SmartWallet for `msg.sender` if it doesn't exist yet.
    function deploy() external returns (address wallet) {
        return deployFor(msg.sender);
    }

    /// @notice Deploys the SmartWallet for an explicit owner (idempotent).
    function deployFor(address owner) public returns (address wallet) {
        address predicted = computeAddress(owner);
        if (predicted.code.length > 0) {
            return predicted;
        }
        bytes32 salt = _salt(owner);
        bytes memory bytecode = _creationCode(owner);
        assembly {
            wallet := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        require(wallet != address(0), "SmartWalletFactory: deploy failed");
        emit WalletDeployed(owner, wallet);
    }

    function isDeployed(address owner) external view returns (bool) {
        return computeAddress(owner).code.length > 0;
    }

    function _salt(address owner) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("arc-pilot.smart-wallet.v1", owner));
    }

    function _creationCode(address owner) internal pure returns (bytes memory) {
        return abi.encodePacked(type(SmartWallet).creationCode, abi.encode(owner));
    }
}
