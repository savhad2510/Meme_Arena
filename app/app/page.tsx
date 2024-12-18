import React from "react";
import Link from "next/link";
import Image from "next/image";

function Home() {
  return (
    <div className="h-screen relative overflow-hidden bg-black/90">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black/95 to-[var(--neon-blue)]/5 z-0"></div>
      
      <div className="relative z-10 h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
            {/* Left Content */}
            <div className="space-y-6 relative">
              {/* Glowing accent */}
              <div className="absolute -left-20 -top-20 w-64 h-64 bg-[var(--neon-blue)]/20 rounded-full blur-3xl"></div>
              
              <div className="space-y-4 relative">
                <div className="inline-block">
                  <h1 className="cyber-header text-5xl lg:text-6xl font-bold tracking-tight text-white mb-2">
                    MEME ARENA
                    <div className="h-1 w-40 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
                  </h1>
                  <div className="text-sm text-[var(--neon-blue)] tracking-widest font-medium uppercase">
                    Battle • Bet • Win
                  </div>
                </div>
                
                <p className="text-lg text-white/90 leading-relaxed backdrop-blur-sm bg-black/30 p-4 rounded-lg border border-[var(--neon-blue)]/20 shadow-lg shadow-[var(--neon-blue)]/5">
                  A sophisticated platform where digital strategists compete in the{" "}
                  <span className="text-[var(--neon-blue)] font-semibold">Mantle network</span>, leveraging memes as digital assets in a{" "}
                  <span className="text-[var(--neon-pink)] font-semibold">next-generation marketplace</span>.
                </p>
              </div>

              <Link
                href="/battles"
                className="cyber-button inline-block rounded-lg text-lg px-6 py-3 hover:scale-105 transform transition-all duration-300 hover:shadow-lg hover:shadow-[var(--neon-blue)]/20"
              >
                Enter the Arena
              </Link>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card p-4 rounded-lg border border-[var(--neon-blue)]/20 hover:border-[var(--neon-blue)]/40 transition-all duration-300 backdrop-blur-md bg-black/40 hover:transform hover:scale-105">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 text-[var(--neon-blue)]">
                      <svg xmlns="http://www.w3.org/2000/svg"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1 text-white">MEME Betting</h3>
                      <p className="text-sm text-[var(--neon-blue)]/80">Advanced real-time trading system</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4 rounded-lg border border-[var(--neon-blue)]/20 hover:border-[var(--neon-blue)]/40 transition-all duration-300 backdrop-blur-md bg-black/40 hover:transform hover:scale-105">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 text-[var(--neon-blue)]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1 text-white">Decentralized</h3>
                      <p className="text-sm text-[var(--neon-blue)]/80">Secure blockchain network</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative lg:block order-first lg:order-last h-full max-h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-pink)] opacity-10 blur-3xl"></div>
              <div className="relative h-full">
                {/* Cyberpunk frame effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-pink)] rounded-lg blur"></div>
                <div className="relative glass-card rounded-lg border border-[var(--neon-blue)]/30 overflow-hidden group h-full">
                  <div className="relative w-full h-full">
                    <Image
                      src="/hero.jpg"
                      alt="Meme Arena Hero"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-lg transform transition-transform duration-700 group-hover:scale-110"
                      priority
                    />
                    {/* Overlay gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--neon-blue)]/20 to-transparent mix-blend-overlay"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--neon-blue)] to-transparent opacity-30"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--neon-blue)] to-transparent opacity-30"></div>
      
      {/* Enhanced corner accents */}
      <div className="absolute top-0 right-0 w-32 h-32">
        <div className="absolute top-0 right-0 w-full h-full border-t-2 border-r-2 border-[var(--neon-blue)]/30 rounded-bl-3xl"></div>
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[var(--neon-blue)]/40"></div>
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32">
        <div className="absolute bottom-0 left-0 w-full h-full border-b-2 border-l-2 border-[var(--neon-blue)]/30 rounded-tr-3xl"></div>
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[var(--neon-blue)]/40"></div>
      </div>
    </div>
  );
}

export default Home;
