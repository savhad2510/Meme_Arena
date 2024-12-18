"use client";

import React from "react";
import AttestationTable from "./AttestationTable";

const UserProfile = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="glass-card rounded-lg p-8 border border-[var(--neon-blue)]/10">
        <h1 className="cyber-header text-3xl font-bold text-white mb-2">
          Meme Identity Interface
          <div className="h-1 w-32 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
        </h1>
        
        <div className="mt-8">
          <div className="glass-card rounded-lg p-6 border border-[var(--neon-blue)]/10 mb-8">
            <h2 className="cyber-header text-xl font-bold text-white mb-4">
              Meme Records
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
            </h2>
            <p className="text-[var(--neon-blue)]/70 backdrop-blur-sm bg-black/20 p-4 rounded-lg border border-[var(--neon-blue)]/10">
              Quantum-secured ledger of your neural network interactions. Each attestation represents a synchronized neural bet in the system.
            </p>
          </div>
          
          <AttestationTable />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
