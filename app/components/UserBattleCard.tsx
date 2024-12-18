"use client";
import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@nextui-org/react';
import { ModalBody, ModalFooter, ModalHeader } from '@chakra-ui/react';
import { ethers } from "ethers";
import { SignProtocolClient, SpMode, EvmChains } from "@ethsign/sp-sdk";

interface Battle {
  id: string;
  name: string;
  description: string;
  winningMeme: string;
  claimed: boolean;
  memes: Array<{
    name: string;
    participants: string[];
  }>;
}

const UserBattleCard = ({ battle, userBetMemeId, onClaimSuccess }: { battle: Battle; userBetMemeId: string | null; onClaimSuccess: (id: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [client, setClient] = useState<SignProtocolClient | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [winnings, setWinnings] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function fetchWinnings() {
      if (account && battle.id) {
        // const amount = await getWinnings(battle.id, account);
        let amount = 0;
        setWinnings(amount);
      }
    }
    fetchWinnings();
  }, [account, battle.id]);

//   async function getWinnings(battleAddress: string, userAddress: string) {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const contract = new ethers.Contract(battleAddress, MemeBattleABI, provider);
//     const winnings = await contract.getWinnings(userAddress);
//     return ethers.utils.formatEther(winnings);
//   }

  useEffect(() => {
    if (isClient) {
      setClient(new SignProtocolClient(SpMode.OnChain, {
        chain: EvmChains.mantleSepolia,
      }));
      connectWallet();
    }
  }, [isClient]);

  const connectWallet = async () => {
    if (isClient && typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x66eee' }],
        });
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      console.log("Please install MetaMask!");
    }
  };

  const handleClaim = async () => {
    if (!account || !client) return;
    setIsClaiming(true);
    try {
      const userMeme = battle.memes.find(meme => meme.participants.includes(account));
      if (!userMeme) throw new Error("User meme not found");

      const createAttestationRes = await client.createAttestation(
        {
          schemaId: "0xda",
          data: {
            user: account as `0x${string}`,
            // battleId : battleId as string ,
            meme_id: BigInt(battle.memes.indexOf(userMeme)),
            bet_amount: BigInt(0),
            bet_timestamp: Math.floor(Date.now() / 1000),
            result: true,
            win_amount: BigInt(Number(winnings)),
            action: "CLAIM"
          },
          indexingValue: `${account.toLowerCase()}_${battle.id}`,
        },
        {
          resolverFeesETH: ethers.parseEther("0"),
          getTxHash: (txHash) => {
            console.log("Claim transaction hash:", txHash as `0x${string}`);
          }
        }
      );

      if (createAttestationRes) {
        onClaimSuccess(battle.id);
        setIsOpen(false);
      } else {
        throw new Error("Failed to create attestation");
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      // Show error message to user
    } finally {
      setIsClaiming(false);
    }
  };

  const userMeme = battle.memes.find(meme => meme.participants.includes(account ?? ''));
  const isWinner = userMeme && userMeme.name === battle.winningMeme;

  if (!isClient) {
    return null; // or a loading indicator
  }

  if (!account) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <button
          onClick={connectWallet}
          className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-5 py-3 rounded-lg shadow-md"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className="bg-gray-800 p-4 rounded-lg shadow-lg cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <h2 className="text-2xl font-bold text-white mb-2">{battle.name}</h2>
        <p className="text-gray-400 mb-4">{battle.description}</p>
        <p className="text-green-400">Your Meme: {userMeme ? userMeme.name : 'N/A'}</p>
        {winnings && <p className="text-yellow-400">Winnings: {winnings} ETH</p>}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalHeader>
          <h3 className="text-xl font-semibold">{battle.name} Details</h3>
        </ModalHeader>
        <ModalBody>
          <p>Winning Meme: {battle.winningMeme}</p>
          <p>Your Meme: {userMeme ? userMeme.name : 'N/A'}</p>
          <p>Status: {isWinner ? 'Won' : 'Lost'}</p>
          {winnings && <p>Winnings: {winnings} ETH</p>}
        </ModalBody>
        <ModalFooter>
          {isWinner && !battle.claimed && (
            <Button 
              color="success" 
              onClick={handleClaim} 
              disabled={isClaiming}
            >
              {isClaiming ? 'Claiming...' : 'Claim Reward'}
            </Button>
          )}
          <Button color="danger" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default UserBattleCard;