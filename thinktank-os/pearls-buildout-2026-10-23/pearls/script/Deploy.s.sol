// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";

import {DistributionFactory} from "../src/DistributionFactory.sol";
import {HookCertificateFactory} from "../src/HookCertificateFactory.sol";

/// @title Deploy
/// @notice Deploys the two Pearls launch factories (Part 1
///         DistributionFactory, then Part 2 HookCertificateFactory,
///         which deploys the LaunchCertificate in its constructor).
///         That is the whole platform deployment: launches deploy
///         everything else, in two transactions per launch.
///
/// @dev TARGET: Base Sepolia testnet (chain ID 84532) or local Anvil
///      (31337) ONLY. The script REVERTS on any other chain id — including
///      Base mainnet (8453). Pearls contracts are unaudited prototypes;
///      mainnet deployment is a separate, gated decision (spec §11) and
///      this script will not perform it.
///
///      Environment variables:
///        DEPLOYER_KEY  Private key of the deployer (TESTNET key only).
///        TREASURY      Address of the platform treasury. On Sepolia this
///                      MUST be a throwaway test Safe/EOA, never the real
///                      treasury — both factories' treasury is immutable.
///
///      Example (dry run first; add --broadcast only on D'Vaughn's word):
///        source .env
///        forge script script/Deploy.s.sol:Deploy \
///          --rpc-url $BASE_SEPOLIA_RPC_URL
contract Deploy is Script {
    function run() external {
        require(
            block.chainid == 84532 || block.chainid == 31337,
            "Pearls Deploy: Base Sepolia (84532) or Anvil (31337) only"
        );
        uint256 deployerKey = vm.envUint("DEPLOYER_KEY");
        address treasury = vm.envAddress("TREASURY");

        vm.startBroadcast(deployerKey);
        DistributionFactory part1 = new DistributionFactory(treasury);
        HookCertificateFactory part2 = new HookCertificateFactory(treasury);
        vm.stopBroadcast();

        console.log("DistributionFactory (Part 1) deployed at:", address(part1));
        console.log("HookCertificateFactory (Part 2) deployed at:", address(part2));
        console.log("LaunchCertificate deployed at:", address(part2.certificate()));
        console.log("Treasury (immutable):", treasury);
        console.log("Chain ID:", block.chainid);
        console.log("---");
        console.log("NEXT: dummy launch on Sepolia (spec step 4) is a");
        console.log("separate, gated step. Nothing here launches a token.");
        console.log("A launch is now TWO transactions: Part 1 deploy,");
        console.log("then Part 2 launch against the Part 1 address.");
    }
}
