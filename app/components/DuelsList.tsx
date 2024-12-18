"use client";
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Link from "next/link";

const BattlesList = () => {
  const [duels, setDuels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDuels = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "battles"));
        const duelsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDuels(duelsData);
      } catch (error) {
        console.error("Error fetching duels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDuels();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-8 rounded-lg border border-[var(--neon-blue)]/20">
          <div className="text-[var(--neon-blue)] flex items-center space-x-3">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading Neural Duels...</span>
          </div>
        </div>
      </div>
    );
  }

  if (duels.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-8 rounded-lg border border-[var(--neon-blue)]/20">
          <p className="text-[var(--neon-blue)]">No active duels found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="glass-card rounded-lg p-8 mb-10 border border-[var(--neon-blue)]/10">
        <h1 className="cyber-header text-3xl font-bold text-white mb-2">
          Neural Duels
          <div className="h-1 w-32 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
        </h1>
        <p className="description-text mb-6">
          Witness epic meme battles in the digital arena
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {duels.map((duel) => (
          <Link
            href={`/duels/${duel.id}`}
            key={duel.id}
            className="block group"
          >
            <div className="glass-card rounded-lg overflow-hidden h-full border border-[var(--neon-blue)]/10 hover:border-[var(--neon-blue)]/30 transition-all duration-300">
              {duel.memes && duel.memes[0] && (
                <div className="relative aspect-w-16 aspect-h-9">
                  <img
                    src={duel.memes[0].image}
                    alt={duel.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              )}
              <div className="p-6">
                <h2 className="cyber-header text-xl font-semibold text-white mb-2 group-hover:text-[var(--neon-blue)] transition-all duration-300">
                  {duel.name}
                </h2>
                <p className="text-[var(--neon-blue)]/70 line-clamp-2">
                  {duel.description}
                </p>
                {duel.endTime && (
                  <div className="mt-4 text-sm text-[var(--neon-blue)]/60">
                    Ends: {new Date(duel.endTime.toDate()).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BattlesList;
