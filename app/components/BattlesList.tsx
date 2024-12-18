"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

interface MemeDuel {
  id: string;
  name: string;
  description: string;
  createdAt: any;
  endTime: any;
  status: string;
  memes: Array<{ name: string; image: string; hashtag: string }>;
}

const BattlesList: React.FC = () => {
  const [memeDuels, setMemeDuels] = useState<MemeDuel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemeDuels();
  }, []);

  const fetchMemeDuels = async () => {
    try {
      setLoading(true);
      const duelsCollection = collection(db, "battles");
      const duelSnapshot = await getDocs(duelsCollection);
      const duelList = duelSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as MemeDuel)
      );
      setMemeDuels(duelList);
      console.log("Fetched meme duels:", duelList);
    } catch (error) {
      console.error("Error fetching meme duels:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-8 rounded-lg border border-[var(--neon-blue)]/20">
          <div className="text-[var(--neon-blue)] flex items-center space-x-3">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Initializing Neural Network...</span>
          </div>
        </div>
      </div>
    );
  }

  if (memeDuels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="glass-card p-8 rounded-lg border border-[var(--neon-blue)]/20 text-center mb-8">
          <div className="text-[var(--neon-blue)] mb-4 text-xl">Neural Arena Empty</div>
          <div className="text-white mb-6">
            Initialize the first duel to activate the neural network
          </div>
          <Link
            href="/battles/addMemeBattle"
            className="cyber-button inline-block rounded"
          >
            Create First Duel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="cyber-header text-3xl font-bold text-white mb-2">
            Neural Arena
            <div className="h-1 w-24 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
          </h1>
          <p className="text-[var(--neon-blue)] text-shadow">Meme Duels: {memeDuels.length}</p>
        </div>
        <Link
          href="/battles/addMemeBattle"
          className="cyber-button inline-block rounded"
        >
          Initialize New Duel
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memeDuels.map((duel) => (
          <Link
            href={`/battles/${duel.id}`}
            key={duel.id}
            className="block group"
          >
            <div className="glass-card rounded-lg p-6 h-full border border-[var(--neon-blue)]/10 hover:border-[var(--neon-blue)]/30 transition-all duration-300 relative overflow-hidden">
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--neon-blue)]/0 to-[var(--neon-blue)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="flex flex-col h-full relative">
                <h2 className="cyber-header text-xl font-semibold text-white mb-2 group-hover:text-[var(--neon-blue)] transition-all duration-300">
                  {duel.name}
                </h2>
                <p className="text-white text-sm mb-4 flex-grow description-text">
                  {duel.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--neon-blue)] font-medium">
                    {duel.memes.length} Neural Memes
                  </span>
                  <span className="flex items-center text-[var(--neon-blue)] font-medium">
                    <div className={`w-2 h-2 rounded-full ${
                      duel.status === 'completed' ? 'bg-[var(--neon-pink)]' : 'bg-[var(--neon-blue)]'
                    } mr-2`}></div>
                    {duel.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BattlesList;
