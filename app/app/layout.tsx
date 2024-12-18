"use client";

import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";

const inter = Inter({ subsets: ["latin"] });
const orbitron = Orbitron({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <div className="relative">
          {/* Background with grid overlay */}
          <div className="fixed inset-0 bg-[var(--dark-bg)]">
            <div className="absolute inset-0 cyber-grid"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,255,245,0.03)] to-[rgba(176,38,255,0.03)]"></div>
          </div>
          
          {/* Main content */}
          <div className="relative z-10">
            <style jsx global>{`
              .cyber-header {
                font-family: ${orbitron.style.fontFamily};
              }
            `}</style>
            <Navbar />
            <main className="pt-16 px-4">
              <Providers>
                {children}
              </Providers>
            </main>
          </div>

          {/* Enhanced corner decorations */}
          <div className="fixed top-0 left-0 w-24 h-24">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--neon-blue)] to-transparent"></div>
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[var(--neon-blue)] to-transparent"></div>
          </div>
          <div className="fixed top-0 right-0 w-24 h-24">
            <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-l from-[var(--neon-blue)] to-transparent"></div>
            <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-[var(--neon-blue)] to-transparent"></div>
          </div>
          <div className="fixed bottom-0 left-0 w-24 h-24">
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--neon-blue)] to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-2 h-full bg-gradient-to-t from-[var(--neon-blue)] to-transparent"></div>
          </div>
          <div className="fixed bottom-0 right-0 w-24 h-24">
            <div className="absolute bottom-0 right-0 w-full h-2 bg-gradient-to-l from-[var(--neon-blue)] to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-2 h-full bg-gradient-to-t from-[var(--neon-blue)] to-transparent"></div>
          </div>
        </div>
      </body>
    </html>
  );
}
