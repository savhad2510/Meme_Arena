import { ethers } from 'ethers';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { abi } from '../constant/abi';
import { toast } from 'react-toastify';

interface BettingSystemProps {
  duelId: string;
  memeIndex: number;
}

const BettingSystem: React.FC<BettingSystemProps> = ({ duelId, memeIndex }) => {
  const [betAmount, setBetAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { address } = useAccount();

  const validateBet = async (contract: ethers.Contract) => {
    try {
      // Get battle details
      const battle = await contract.battles(duelId);
      
      if (battle.ended) {
        throw new Error('This battle has already ended');
      }

      if (battle.deadline < Math.floor(Date.now() / 1000)) {
        throw new Error('Betting period has ended for this battle');
      }

      // Validate bet amount
      if (!betAmount || parseFloat(betAmount) <= 0) {
        throw new Error('Please enter a valid bet amount greater than 0');
      }

      return true;
    } catch (error: any) {
      throw error;
    }
  };

  const placeBet = async () => {
    if (!window.ethereum || !address) {
      toast.error('Please connect your neural wallet to place bets!');
      return;
    }

    setIsProcessing(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('Neural contract not configured');
      }

      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      // Validate before sending transaction
      await validateBet(contract);

      const betAmountWei = ethers.parseEther(betAmount);

      toast.info('Initializing neural transaction...', { autoClose: false });
      const tx = await contract.placeBet(duelId, memeIndex, {
        value: betAmountWei
      });

      toast.info('Processing neural bet...', { autoClose: false });
      await tx.wait();
      toast.success('Neural bet confirmed!');
      setBetAmount('');
    } catch (error: any) {
      console.error('Error placing bet:', error);
      // Handle specific error messages
      let errorMessage = 'Neural transaction failed. Please try again.';
      
      if (error.message) {
        // Check for common error patterns
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds in your wallet for this bet';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected';
        } else if (error.message.includes('User has already bet')) {
          errorMessage = 'You have already placed a bet on this meme';
        } else if (error.message.includes('Battle has ended')) {
          errorMessage = 'This battle has already ended';
        } else if (error.message.includes('Betting period has ended')) {
          errorMessage = 'Betting period has ended for this battle';
        } else if (error.message.includes('Invalid meme')) {
          errorMessage = 'Invalid meme selection';
        } else if (error.message.includes('valid bet amount')) {
          errorMessage = 'Please enter a valid bet amount greater than 0';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-card rounded-lg p-8 border border-[var(--neon-blue)]/10">
      <h2 className="cyber-header text-xl font-bold text-white mb-6">
        Neural Betting Interface
        <div className="h-1 w-24 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
      </h2>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="betAmount" className="block text-[var(--neon-blue)] text-sm font-medium">
            Neural Stake (ETH)
          </label>
          <div className="relative group">
            <input
              id="betAmount"
              type="number"
              step="0.01"
              min="0"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="0.1"
              className="w-full px-4 py-3 bg-black/20 border border-[var(--neon-blue)]/20 rounded-lg 
                        text-white placeholder-[var(--neon-blue)]/50 focus:outline-none focus:border-[var(--neon-blue)] 
                        focus:ring-1 focus:ring-[var(--neon-blue)]/50 transition-all duration-300
                        backdrop-blur-sm"
              disabled={isProcessing}
            />
            {/* Glow effect on focus */}
            <div className="absolute inset-0 rounded-lg bg-[var(--neon-blue)]/0 group-hover:bg-[var(--neon-blue)]/5 
                          transition-all duration-300 pointer-events-none"></div>
          </div>
        </div>

        <button
          onClick={placeBet}
          disabled={isProcessing || !betAmount || !address}
          className={`cyber-button w-full rounded ${
            isProcessing || !betAmount || !address
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-[var(--neon-blue)] hover:text-[var(--neon-blue)]'
          }`}
        >
          <span className="relative z-10 flex items-center justify-center space-x-2">
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing Neural Transaction...</span>
              </>
            ) : (
              'Initialize Neural Bet'
            )}
          </span>
        </button>

        {!address && (
          <div className="text-center p-4 border border-[var(--neon-blue)]/10 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-[var(--neon-blue)]/70">
              Neural wallet connection required for betting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingSystem;
