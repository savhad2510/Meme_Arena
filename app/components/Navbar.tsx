import React, { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/" 
                className="cyber-header text-lg font-bold"
              >
                MEME ARENA
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <NavLink href="/battles">Duels</NavLink>
                <NavLink href="/profile">Profile</NavLink>
                <NavLink href="/chatroom">Cyber Chat</NavLink>
                <NavLink href="/regulator">System Control</NavLink>
              </div>
            </div>

            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="cyber-nav-item p-2"
                aria-label="Toggle menu"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div 
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}
        >
          <div className="px-4 pt-2 pb-4 space-y-2">
            <MobileNavLink href="/battles" onClick={() => setIsMenuOpen(false)}>
              Duels
            </MobileNavLink>
            <MobileNavLink href="/profile" onClick={() => setIsMenuOpen(false)}>
              Neural Profile
            </MobileNavLink>
            <MobileNavLink href="/chatroom" onClick={() => setIsMenuOpen(false)}>
              Cyber Chat
            </MobileNavLink>
            <MobileNavLink href="/regulator" onClick={() => setIsMenuOpen(false)}>
              System Control
            </MobileNavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link 
    href={href} 
    className="cyber-nav-item text-sm rounded"
  >
    {children}
  </Link>
);

const MobileNavLink = ({ 
  href, 
  children,
  onClick
}: { 
  href: string; 
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <Link 
    href={href} 
    className="cyber-nav-item block text-base rounded"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navbar;
