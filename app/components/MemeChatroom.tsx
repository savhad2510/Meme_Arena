"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import {
  db,
  getMemeDetails,
  placeBet,
  updateUserBet,
  getBattleStatus,
  addMemeToBattle,
  addUserBet,
} from "../firebase";
import { ethers } from "ethers";
import {
  SignProtocolClient,
  SpMode,
  EvmChains,
  AttestationResult,
} from "@ethsign/sp-sdk";
import avatar from "../public/avatar.jpg";
import Image from "next/image";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: any;
}

interface Meme {
  name: string;
  image: string;
  hashtag: string;
}

interface MemeChatroomProps {
  battleId: string;
  memeIndex: number;
}

// Extend EvmChains enum with Mantle Sepolia
declare module "@ethsign/sp-sdk" {
  export enum EvmChains {
    mantleSepolia = 5003
  }
}

const MemeChatroom: React.FC<MemeChatroomProps> = ({ battleId, memeIndex }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [account, setAccount] = useState<string | null>(null);
  const [meme, setMeme] = useState<Meme | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const [isBettingClosed, setIsBettingClosed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [battleEndTime, setBattleEndTime] = useState<Date | null>(null);
  const [attestationCreated, setAttestationCreated] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const client = isClient
    ? new SignProtocolClient(SpMode.OnChain, {
        chain: EvmChains.mantleSepolia,
      })
    : null;

  const betInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isClient) {
      connectWallet();
      fetchMemeDetails();
      fetchBattleDetails();
    }
  }, [isClient, battleId, memeIndex]);

  useEffect(() => {
    const checkBattleStatus = async () => {
      const status = await getBattleStatus(battleId);
      setIsBettingClosed(status !== "open");
    };
    checkBattleStatus();
  }, [battleId]);

  const connectWallet = async () => {
    if (isClient && typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x138b" }], // 5003 in hex
        });
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      console.log("Please install MetaMask!");
    }
  };

  const fetchMemeDetails = async () => {
    const memeData = await getMemeDetails(battleId, memeIndex);
    if (memeData) {
      setMeme(memeData);
    }
  };

  const fetchBattleDetails = async () => {
    const battleDoc = await getDoc(doc(db, "battles", battleId));
    if (battleDoc.exists()) {
      const battleData = battleDoc.data();
      setBattleEndTime(battleData.endTime.toDate());
    }
  };

  useEffect(() => {
    if (battleEndTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = battleEndTime.getTime();
        const distance = endTime - now;

        if (distance < 0) {
          clearInterval(timer);
          setTimeLeft("Battle Ended");
          setIsBettingClosed(true);
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
          setIsBettingClosed(false);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [battleEndTime]);

  useEffect(() => {
    if (!account) return;

    const memeMessagesRef = collection(
      db,
      `memeBattles/${battleId}/memes/${memeIndex}/chatMessages`
    );
    const q = query(memeMessagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Message)
      );
      setMessages(messageList);
    });

    return () => unsubscribe();
  }, [battleId, memeIndex, account]);

  const handleMessageSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!account || !newMessage.trim()) return;

    try {
      const memeMessagesRef = collection(
        db,
        `memeBattles/${battleId}/memes/${memeIndex}/chatMessages`
      );
      await addDoc(memeMessagesRef, {
        content: newMessage,
        sender: account,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handlePlaceBet = async () => {
    const currentBetAmount = betInputRef.current?.value;
    console.log(currentBetAmount);

    if (!account) {
      toast.error("Wallet not connected");
      return;
    }

    const betAmountWei = ethers.parseEther(currentBetAmount || "0");
    const roomIdBigInt = BigInt(memeIndex);

    const UserAddress = account as `0x${string}`;

    if (!client) {
      console.error("SignProtocolClient is not initialized");
      toast.error("Error initializing bet. Please try again.");
      return;
    }

    const memeIdForContract = BigInt(memeIndex + 1);

    try {
      toast.info("Placing bet...", { autoClose: false });
      const createAttestationRes = await client.createAttestation(
        {
          schemaId: "0xe9",
          data: {
            user: UserAddress,
            battleId: battleId as string,
            meme_id: memeIdForContract as BigInt,
            bet_amount: betAmountWei,
            bet_timestamp: Math.floor(Date.now() / 1000),
            win_amount: BigInt(0),
            action: "USER_BET",
          },
          indexingValue: `${account.toLowerCase()}`,
        },
        {
          resolverFeesETH: betAmountWei,
          getTxHash: (txHash) => {
            console.log("Transaction hash:", txHash as `0x${string}`);
          },
        }
      );

      if (createAttestationRes) {
        setAttestationCreated(true);

        await addUserBet(UserAddress, battleId, memeIndex.toString(), Number(currentBetAmount), {
          name: String(3) || '',
          image: meme?.image || '',
          hashtag: meme?.hashtag || ''
        });

        console.log(`Bet of ${betAmount} placed successfully on meme ${memeIndex} in battle ${battleId}`);
        setBetAmount("");
        toast.success(`Bet of ${currentBetAmount} ETH placed successfully!`);
      } else {
        toast.error("Failed to place bet. Please try again.");
      }
    } catch (error) {
      console.log("Error when running createAttestation function", error);
      toast.error("Error placing bet. Please try again.");
    }
  };

  if (!isClient) {
    return null;
  }

  if (!account) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card rounded-lg p-8 border border-[var(--neon-blue)]/10">
          <h1 className="cyber-header text-3xl font-bold text-white mb-2">
            Meme Access Required
            <div className="h-1 w-32 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
          </h1>
          <button
            onClick={connectWallet}
            className="cyber-button inline-block rounded mt-4"
          >
            Initialize Meme Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="glass-card rounded-lg p-8 border border-[var(--neon-blue)]/10">
        {meme && (
          <div className="mb-8">
            <h1 className="cyber-header text-3xl font-bold text-white mb-2">
              Meme Pattern: {meme.name}
              <div className="h-1 w-32 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
            </h1>
            <div className="mt-6 relative group">
              <img
                src={meme.image}
                alt={meme.name}
                className="w-full rounded-xl border border-[var(--neon-blue)]/30 transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 rounded-xl border border-[var(--neon-blue)]/30 bg-gradient-to-r from-[var(--neon-blue)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <p className="text-[var(--neon-blue)]/70 mt-4 text-lg font-mono">#{meme.hashtag}</p>
          </div>
        )}

        <div className="glass-card rounded-lg p-6 border border-[var(--neon-blue)]/10 mb-8">
          <h2 className="cyber-header text-xl font-bold text-white mb-4">
            Meme Synchronization Status
            <div className="h-1 w-24 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
          </h2>
          <div className="flex items-center justify-between">
            <p className="text-[var(--neon-blue)] text-lg font-mono">
              {timeLeft === "Battle Ended" ? (
                <span className="text-[var(--neon-pink)]">Meme Link Terminated</span>
              ) : (
                <>Remaining Sync Time: <span className="text-white">{timeLeft}</span></>
              )}
            </p>
          </div>
        </div>

        {!isBettingClosed && (
          <div className="glass-card rounded-lg p-6 border border-[var(--neon-blue)]/10 mb-8">
            <h2 className="cyber-header text-xl font-bold text-white mb-4">
              Meme Betting Interface
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
            </h2>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={betAmount}
                ref={betInputRef}
                onChange={(e) => setBetAmount(e.target.value)}
                className="flex-1 px-4 py-3 glass-card border border-[var(--neon-blue)]/30 bg-black/20 rounded-lg text-white outline-none focus:border-[var(--neon-blue)] transition-colors duration-200"
                placeholder="Betting Amount..."
              />
              <button
                onClick={() => handlePlaceBet()}
                className="cyber-button inline-block rounded"
              >
                Initialize Bet
              </button>
            </div>
          </div>
        )}

        <div className="glass-card rounded-lg p-6 border border-[var(--neon-blue)]/10 mb-8">
          <h2 className="cyber-header text-xl font-bold text-white mb-4">
            Meme Network Communications
            <div className="h-1 w-24 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
          </h2>
          <div className="h-96 overflow-y-auto backdrop-blur-sm bg-black/20 rounded-lg border border-[var(--neon-blue)]/30 p-4 mb-4">
            {messages.map((message) => (
              <div key={message.id} className="mb-4 group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-[var(--neon-blue)]/30 relative">
                    <Image
                      src={avatar}
                      alt="Neural Avatar"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[var(--neon-blue)]">
                        {message.sender.slice(0, 6)}...{message.sender.slice(-4)}
                      </span>
                    </div>
                    <p className="chat-message mt-1">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleMessageSubmit} className="flex gap-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-3 glass-card border border-[var(--neon-blue)]/30 bg-black/20 rounded-lg text-white outline-none focus:border-[var(--neon-blue)] transition-colors duration-200"
              placeholder="Transmit your message..."
            />
            <button
              type="submit"
              className="cyber-button inline-block rounded"
            >
              Transmit
            </button>
          </form>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        theme="dark"
        toastStyle={{
          backgroundColor: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(var(--neon-blue-rgb), 0.1)',
          boxShadow: '0 0 20px rgba(var(--neon-blue-rgb), 0.1)',
          color: 'var(--neon-blue)',
          fontFamily: 'monospace'
        }}
      />
    </div>
  );
};

export default MemeChatroom;
