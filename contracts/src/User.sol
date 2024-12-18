// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract User is Ownable {
    struct UserStats {
        uint256 totalBets;
        uint256 totalAmountBet;
        uint256 wins;
        uint256 losses;
        uint256 score;
    }

    // Mapping of battle IDs and user addresses to their stats
    mapping(string => mapping(address => UserStats)) public userStats;

    event UserStatsUpdated(string battleId, address indexed user, uint256 totalBets, uint256 totalAmountBet, uint256 wins, uint256 losses, uint256 score);

    constructor() Ownable(msg.sender) {}

    function updateBetStats(string memory battleId, address user, uint256 amount) external {
        userStats[battleId][user].totalBets++;
        userStats[battleId][user].totalAmountBet += amount;
        userStats[battleId][user].score = calculateScore(userStats[battleId][user]);
        
        emit UserStatsUpdated(
            battleId,
            user,
            userStats[battleId][user].totalBets,
            userStats[battleId][user].totalAmountBet,
            userStats[battleId][user].wins,
            userStats[battleId][user].losses,
            userStats[battleId][user].score
        );
    }

    function updateWinStats(string memory battleId, address user) external {
        userStats[battleId][user].wins++;
        userStats[battleId][user].score = calculateScore(userStats[battleId][user]);
        
        emit UserStatsUpdated(
            battleId,
            user,
            userStats[battleId][user].totalBets,
            userStats[battleId][user].totalAmountBet,
            userStats[battleId][user].wins,
            userStats[battleId][user].losses,
            userStats[battleId][user].score
        );
    }

    function updateLossStats(string memory battleId, address user) external {
        userStats[battleId][user].losses++;
        userStats[battleId][user].score = calculateScore(userStats[battleId][user]);
        
        emit UserStatsUpdated(
            battleId,
            user,
            userStats[battleId][user].totalBets,
            userStats[battleId][user].totalAmountBet,
            userStats[battleId][user].wins,
            userStats[battleId][user].losses,
            userStats[battleId][user].score
        );
    }

    function getUserScore(string memory battleId, address user) external view returns (uint256) {
        return userStats[battleId][user].score;
    }

    function calculateScore(UserStats memory stats) internal pure returns (uint256) {
        if (stats.totalBets == 0) return 0;
        
        uint256 winRate = (stats.wins * 100) / stats.totalBets;
        uint256 avgBet = stats.totalAmountBet / stats.totalBets;
        
        return winRate * avgBet;
    }
}
