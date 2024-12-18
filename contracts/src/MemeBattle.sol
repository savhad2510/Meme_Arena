// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "./User.sol";

/**
 * @title MemeBattle
 * @dev A contract for managing meme battles and bets
 * @notice This contract allows users to create battles, place bets, and claim rewards
 */
contract MemeBattle is Ownable, ReentrancyGuard {
    User public userContract;

    struct Meme {
        string name;
        uint256 totalStaked;
    }

    struct Bet {
        uint256 amount;
        bool claimed;
    }

    struct Battle {
        string[] memes;
        uint256 winningMemeId;
        uint256 startTime;
        uint256 deadline;
        bool ended;
        mapping(uint256 => Meme) memeInfo;
        mapping(uint256 => mapping(address => Bet)) bets;
        mapping(uint256 => address[]) betters;
    }

    // Mapping of battle IDs to Battle structs
    mapping(string => Battle) public battles;
    // Mapping of battle IDs and user addresses to their winnings
    mapping(string => mapping(address => uint256)) public winnings;

    event BattleCreated(string battleId, string[] memes, uint256 startTime, uint256 deadline);
    event BetPlaced(string battleId, address indexed user, uint256 indexed memeId, uint256 amount);
    event WinnerDeclared(string battleId, uint256 indexed memeId);
    event RewardClaimed(string battleId, address indexed user, uint256 reward);
    event UserScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore);

    /**
     * @dev Constructor to initialize the MemeBattle contract
     * @param _userContractAddress Address of the User contract
     */
    constructor(address _userContractAddress) Ownable(msg.sender) {
        userContract = User(_userContractAddress);
    }

    /**
     * @dev Creates a new battle
     * @param battleId ID of the battle
     * @param memeNames Array of meme names
     * @param duration Duration of the battle in seconds
     */
    function createBattle(string memory battleId, string[] memory memeNames, uint256 duration) external {
        require(battles[battleId].startTime == 0, "Battle already exists");
        require(memeNames.length > 1, "At least two memes required");

        Battle storage newBattle = battles[battleId];
        newBattle.memes = memeNames;
        newBattle.startTime = block.timestamp;
        newBattle.deadline = block.timestamp + duration;

        for (uint256 i = 0; i < memeNames.length; i++) {
            newBattle.memeInfo[i + 1] = Meme(memeNames[i], 0);
        }

        emit BattleCreated(battleId, memeNames, newBattle.startTime, newBattle.deadline);
    }

    /**
     * @dev Places a bet on a meme in a battle
     * @param battleId ID of the battle
     * @param memeId ID of the meme being bet on
     */
    function placeBet(string memory battleId, uint256 memeId) external payable nonReentrant {
        Battle storage battle = battles[battleId];
        require(!battle.ended, "Battle has ended");
        require(block.timestamp < battle.deadline, "Betting period has ended");
        require(msg.value > 0, "Bet amount must be greater than 0");
        
        uint256 memeIndex = findMemeIndex(battle, memeId);
        require(memeIndex != 0, "Invalid meme ID");
        require(battle.bets[memeIndex][msg.sender].amount == 0, "User has already bet on this meme");

        battle.bets[memeIndex][msg.sender].amount = msg.value;
        battle.betters[memeIndex].push(msg.sender);
        battle.memeInfo[memeIndex].totalStaked += msg.value;

        emit BetPlaced(battleId, msg.sender, memeIndex, msg.value);

        uint256 userScoreBefore = userContract.getUserScore(battleId, msg.sender);
        userContract.updateBetStats(battleId, msg.sender, msg.value);
        uint256 userScoreAfter = userContract.getUserScore(battleId, msg.sender);

        emit UserScoreUpdated(msg.sender, userScoreBefore, userScoreAfter);
    }

    /**
     * @dev Declares the winner of a battle
     * @param battleId ID of the battle
     * @param winningMemeId ID of the winning meme
     */
    function declareWinner(string memory battleId, uint256 winningMemeId) external onlyOwner {
        Battle storage battle = battles[battleId];
        require(!battle.ended, "Battle has already ended");
        require(block.timestamp >= battle.deadline, "Betting period not over");
        require(winningMemeId <= battle.memes.length && winningMemeId > 0, "Invalid winning meme ID");

        battle.winningMemeId = winningMemeId;
        battle.ended = true;

        uint256 totalPrizePool = address(this).balance;
        uint256 winningMemeStake = battle.memeInfo[winningMemeId].totalStaked;

        for (uint256 i = 0; i < battle.betters[winningMemeId].length; i++) {
            address winner = battle.betters[winningMemeId][i];
            uint256 betAmount = battle.bets[winningMemeId][winner].amount;
            uint256 reward = (betAmount * totalPrizePool) / winningMemeStake;

            winnings[battleId][winner] = reward;
            
            uint256 userScoreBefore = userContract.getUserScore(battleId, winner);
            userContract.updateWinStats(battleId, winner);
            uint256 userScoreAfter = userContract.getUserScore(battleId, winner);

            emit UserScoreUpdated(winner, userScoreBefore, userScoreAfter);
        }

        for (uint256 i = 1; i <= battle.memes.length; i++) {
            if (i != winningMemeId) {
                for (uint256 j = 0; j < battle.betters[i].length; j++) {
                    address loser = battle.betters[i][j];
                    userContract.updateLossStats(battleId, loser);
                }
            }
        }

        emit WinnerDeclared(battleId, winningMemeId);
    }

    /**
     * @dev Claims rewards for a winner
     * @param battleId ID of the battle
     */
    function claimReward(string memory battleId) external nonReentrant {
        Battle storage battle = battles[battleId];
        require(battle.ended, "Battle has not ended yet");
        require(winnings[battleId][msg.sender] > 0, "No winnings to claim");
        
        uint256 winningMemeIndex = battle.winningMemeId;
        require(!battle.bets[winningMemeIndex][msg.sender].claimed, "Reward already claimed");

        uint256 reward = winnings[battleId][msg.sender];
        battle.bets[winningMemeIndex][msg.sender].claimed = true;
        winnings[battleId][msg.sender] = 0;

        payable(msg.sender).transfer(reward);
        emit RewardClaimed(battleId, msg.sender, reward);
    }

    /**
     * @dev Finds the index of a meme in a battle
     * @param battle The Battle struct
     * @param meme_id ID of the meme to find
     * @return The index of the meme, or 0 if not found
     */
    function findMemeIndex(Battle storage battle, uint256 meme_id) internal view returns (uint256) {
        for (uint256 i = 1; i <= battle.memes.length; i++) {
            if (i == meme_id) {
                return i;
            }
        }
        return 0; // Return 0 if meme not found
    }

    /**
     * @dev Gets the winnings for a user in a specific battle
     * @param battleId ID of the battle
     * @param user Address of the user
     * @return The amount of winnings for the user
     */
    function getWinnings(string memory battleId, address user) public view returns (uint256) {
        return winnings[battleId][user];
    }

    /**
     * @dev Fallback function to receive Ether
     */
    receive() external payable {}
}
