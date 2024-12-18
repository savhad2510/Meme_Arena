"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Link from "next/link";
import { ethers } from "ethers";
import { abi, contractAddress } from "../constant/abi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Meme {
  name: string;
  image: string;
  hashtag: string;
}

const DuelDetails: React.FC<{ battleId: string }> = ({ battleId }) => {
  const [duel, setDuel] = useState<any>(null);
  const [duelEndTime, setDuelEndTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [winningMemeIndex, setWinningMemeIndex] = useState<number | null>(null);
  const [showDeclareWinnerButton, setShowDeclareWinnerButton] = useState(false);
  const [showTestButton, setShowTestButton] = useState(true);

  useEffect(() => {
    const fetchDuelDetails = async () => {
      const duelDoc = await getDoc(doc(db, "battles", battleId));
      if (duelDoc.exists()) {
        const duelData = duelDoc.data();
        setDuel(duelData);
        if (
          duelData.endTime &&
          typeof duelData.endTime.toDate === "function"
        ) {
          setDuelEndTime(duelData.endTime.toDate());
        }
      }
    };
    fetchDuelDetails();
  }, [battleId]);

  useEffect(() => {
    if (duel && duelEndTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = duelEndTime.getTime();
        const distance = endTime - now;

        if (distance < 0) {
          clearInterval(timer);
          setTimeLeft("Duel Ended");
          if (duel.winningMeme === null) {
            setShowDeclareWinnerButton(true);
          }
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [duel, duelEndTime]);

  const declareWinner = async () => {
    if (duel.winningMeme !== null) {
      toast.error("Winner has already been declared!");
      return;
    }

    try {
      const memeResults = await Promise.all(
        duel.memes.map(async (meme: Meme) => {
          if (!meme.hashtag) {
            console.error("Meme is missing hashtag:", meme);
            return { meme, mediaCount: 0 };
          }

          const url = `https://instagram-scraper-20231.p.rapidapi.com/searchtag/${encodeURIComponent(
            meme.hashtag
          )}`;
          const options = {
            method: "GET",
            headers: {
              "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY as string,
              "x-rapidapi-host": "instagram-scraper-20231.p.rapidapi.com",
            },
          };

          try {
            const response = await fetch(url, options);
            const result = await response.json();
            return { meme, mediaCount: result.data[0]?.media_count || 0 };
          } catch (error) {
            console.error("Error fetching hashtag data:", error);
            return { meme, mediaCount: 0 };
          }
        })
      );

      const winningMeme = memeResults.reduce((prev, current) =>
        prev.mediaCount > current.mediaCount ? prev : current
      );

      const winningIndex = duel.memes.findIndex(
        (meme: Meme) => meme.hashtag === winningMeme.meme.hashtag
      );

      if (winningIndex === -1) {
        console.error("Winning meme not found in duel memes");
        toast.error("Error determining the winner. Please try again.");
        return;
      }

      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // Request network switch to Mantle Sepolia
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x138b' }], // 5003 in hex
            });
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x138b', // 5003 in hex
                  chainName: 'Mantle Sepolia',
                  nativeCurrency: {
                    name: 'MNT',
                    symbol: 'MNT',
                    decimals: 18
                  },
                  rpcUrls: ['https://rpc.sepolia.mantle.xyz'],
                  blockExplorerUrls: ['https://explorer.sepolia.mantle.xyz']
                }]
              });
            } else {
              throw switchError;
            }
          }

          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(contractAddress, abi, signer);

          toast.info("Declaring winner on the blockchain...", { autoClose: false });
          const tx = await contract.declareWinner(battleId, winningIndex + 1 as BigInt);
          await tx.wait();
          toast.success("Winner declared on the blockchain!");
        } catch (error) {
          console.error('Error declaring winner on contract:', error);
          toast.error("Error declaring winner on the blockchain. Please try again.");
          return;
        }
      } else {
        console.error('Ethereum object not found, do you have MetaMask installed?');
        toast.error("MetaMask not detected. Please install MetaMask and try again.");
        return;
      }

      const duelRef = doc(db, "battles", battleId);
      await updateDoc(duelRef, {
        winningMeme: winningIndex,
      });

      setWinningMemeIndex(winningIndex);
      setDuel({ ...duel, winningMeme: winningIndex });
      setShowDeclareWinnerButton(false);
      toast.success(`Winner declared: ${duel.memes[winningIndex].name}`);
    } catch (error) {
      console.error("Error in declareWinner:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  if (!duel) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-8 rounded-lg border border-[var(--neon-blue)]/20">
          <div className="text-[var(--neon-blue)] flex items-center space-x-3">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading Neural Duel Data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="glass-card rounded-lg p-8 mb-10 border border-[var(--neon-blue)]/10">
        <h1 className="cyber-header text-3xl font-bold text-white mb-2">
          {duel.name}
          <div className="h-1 w-32 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
        </h1>
        <p className="description-text mb-6">
          {duel.description}
        </p>
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            timeLeft === "Duel Ended" 
              ? "bg-[var(--neon-pink)]" 
              : "bg-[var(--neon-blue)]"
          }`}></div>
          <span className={`${
            timeLeft === "Duel Ended" 
              ? "text-[var(--neon-pink)]" 
              : "text-[var(--neon-blue)]"
          }`}>
            {timeLeft}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {duel.memes.map((meme: any, index: number) => (
          <Link
            href={`/battles/${battleId}/memes/${index}`}
            key={index}
            className="block group"
          >
            <div className="glass-card rounded-lg overflow-hidden h-full border border-[var(--neon-blue)]/10 hover:border-[var(--neon-blue)]/30 transition-all duration-300">
              <div className="relative aspect-w-16 aspect-h-9">
                <img
                  src={meme.image}
                  alt={meme.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-6 relative">
                <h2 className="cyber-header text-xl font-semibold text-white mb-2 group-hover:text-[var(--neon-blue)] transition-all duration-300">
                  {meme.name}
                </h2>
                <p className="text-[var(--neon-blue)]/70">#{meme.hashtag}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {showDeclareWinnerButton && (
        <div className="flex justify-center">
          <button
            onClick={declareWinner}
            className="cyber-button inline-block rounded"
          >
            Initialize Winner Declaration
          </button>
        </div>
      )}

      {duel.winningMeme !== undefined && (
        <div className="glass-card rounded-lg p-8 mt-10 border border-[var(--neon-blue)]/20">
          <h2 className="cyber-header text-2xl font-bold text-[var(--neon-blue)] mb-6">
            Neural Champion
            <div className="h-1 w-24 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/3">
              <div className="relative aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border border-[var(--neon-blue)]/30">
                <img
                  src={duel?.memes[duel.winningMeme]?.image}
                  alt={duel?.memes[duel.winningMeme]?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--neon-blue)]/20 to-transparent"></div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="cyber-header text-xl font-semibold text-white mb-2">
                {duel?.memes[duel.winningMeme]?.name}
              </h3>
              <p className="text-[var(--neon-blue)]/70">
                #{duel?.memes[duel.winningMeme]?.hashtag}
              </p>
            </div>
          </div>
        </div>
      )}

      <ToastContainer 
        position="bottom-right"
        theme="dark"
        toastStyle={{
          backgroundColor: 'rgba(10, 10, 15, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 255, 245, 0.1)',
          color: 'var(--neon-blue)'
        }}
      />
    </div>
  );
};

export default DuelDetails;
