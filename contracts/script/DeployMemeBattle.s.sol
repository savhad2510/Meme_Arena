// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MemeBattle.sol";
import "../src/User.sol";

contract DeployMemeBattle is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy User contract
        User user = new User();
        console.log("User contract deployed to:", address(user));

        // Deploy MemeBattle
        MemeBattle memeBattle = new MemeBattle(address(user));
        console.log("MemeBattle deployed to:", address(memeBattle));

        // Create a new battle
        string memory battleId = "FirstBattle";
        string[] memory memeNames = new string[](4);
        memeNames[0] = "Doge";
        memeNames[1] = "Grumpy Cat";
        memeNames[2] = "Pepe";
        memeNames[3] = "Distracted Boyfriend";

        uint256 duration = 10 minutes;

        memeBattle.createBattle(battleId, memeNames, duration);
        console.log("New battle created with ID:", battleId);

        vm.stopBroadcast();
    }
}
