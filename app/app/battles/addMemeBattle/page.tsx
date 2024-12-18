"use client";

import React, { useState } from 'react';
import { addMemeBattle, addMemeToBattle } from '../../../firebase';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";
import { ethers } from "ethers";
import { abi, contractAddress } from "../../../constant/abi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddMemeDuel: React.FC = () => {
  const [duelName, setDuelName] = useState('');
  const [duelDescription, setDuelDescription] = useState('');
  const [memes, setMemes] = useState<Array<{ name: string; image: string; hashtag: string }>>([]);
  const [currentMeme, setCurrentMeme] = useState({ name: '', image: '', hashtag: '' });
  const [errors, setErrors] = useState({ duelName: '', duelDescription: '', memeName: '', memeImage: '', memeHashtag: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const validateMemeFields = () => {
    const newErrors = {
      memeName: currentMeme.name ? '' : 'Enter this field',
      memeImage: currentMeme.image ? '' : 'Enter this field',
      memeHashtag: currentMeme.hashtag ? '' : 'Enter this field',
    };
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return newErrors.memeName === '' && newErrors.memeImage === '' && newErrors.memeHashtag === '';
  };

  const validateDuelFields = () => {
    const newErrors = {
      duelName: duelName ? '' : 'Enter this field',
      duelDescription: duelDescription ? '' : 'Enter this field',
    };
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return newErrors.duelName === '' && newErrors.duelDescription === '';
  };

  const handleAddMeme = () => {
    if (validateMemeFields()) {
      setMemes([...memes, currentMeme]);
      setCurrentMeme({ name: '', image: '', hashtag: '' });
      setErrors({ ...errors, memeName: '', memeImage: '', memeHashtag: '' });
    }
  };

  const createDuelOnContract = async (duelId: string, memeNames: string[]) => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      console.log('Requesting account access...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No authorized accounts found. Please connect your MetaMask wallet.');
      }
      console.log('Connected account:', accounts[0]);

      console.log('Getting provider and network...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      console.log('Current chainId:', chainId);

      if (chainId !== 5003) {
        console.log('Wrong network detected. Requesting network switch...');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x138B' }], // 5003 in hex
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x138B',
                  chainName: 'Mantle Testnet',
                  nativeCurrency: {
                    name: 'MNT',
                    symbol: 'MNT',
                    decimals: 18
                  },
                  rpcUrls: ['https://rpc.testnet.mantle.xyz'],
                  blockExplorerUrls: ['https://explorer.testnet.mantle.xyz']
                }]
              });
            } catch (addError) {
              throw new Error('Failed to add Mantle Testnet to MetaMask. Please add it manually.');
            }
          } else {
            throw new Error('Failed to switch to Mantle Testnet. Please switch manually in MetaMask.');
          }
        }
      }

      console.log('Getting signer...');
      const signer = await provider.getSigner();
      console.log('Signer address:', await signer.getAddress());

      console.log('Creating contract instance...');
      const contract = new ethers.Contract(contractAddress, abi, signer);
      console.log('Contract address:', contractAddress);

      console.log('Preparing transaction...');
      const gasLimit = await contract.createBattle.estimateGas(duelId, memeNames, 240);
      console.log('Estimated gas limit:', gasLimit.toString());

      // Calculate gas limit with 20% buffer
      const adjustedGasLimit = gasLimit * 120n / 100n;
      console.log('Adjusted gas limit:', adjustedGasLimit.toString());

      console.log('Sending transaction...');
      const tx = await contract.createBattle(duelId, memeNames, 240, {
        gasLimit: adjustedGasLimit
      });
      
      toast.info('Transaction submitted. Please wait for confirmation...', {
        position: "bottom-right",
        autoClose: false,
        hideProgressBar: false,
      });

      console.log('Transaction hash:', tx.hash);
      console.log('Waiting for confirmation...');
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      if (receipt.status === 1) {
        console.log('Duel created successfully');
        return true;
      } else {
        throw new Error('Transaction failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Detailed error:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction was rejected. Please try again.');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient MNT to complete the transaction. Please get some MNT from the Mantle Testnet faucet.');
      } else if (error.message.includes('gas')) {
        throw new Error('Gas estimation failed. Please try again or adjust gas settings in MetaMask.');
      } else if (error.message.includes('nonce')) {
        throw new Error('Transaction nonce error. Please reset your MetaMask account.');
      } else {
        throw new Error(`Transaction failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateDuelFields()) {
      return;
    }

    if (memes.length < 2) {
      toast.error('At least two memes are required for a duel.', {
        position: "bottom-right",
        autoClose: 5000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Attempting to add meme duel...');
      const duelId = await addMemeBattle({ name: duelName, description: duelDescription, memes });
      console.log('Meme duel added, ID:', duelId);
      
      if (duelId) {
        const memeNames = memes.map(meme => meme.name);
        await createDuelOnContract(duelId, memeNames);
        
        toast.success('Meme Duel initialized successfully!', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        router.push('/battles');
      } else {
        throw new Error('Failed to create meme duel');
      }
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast.error(error.message || 'An error occurred during initialization.', {
        position: "bottom-right",
        autoClose: false,
        closeOnClick: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="glass-card rounded-lg p-8 border border-[var(--neon-blue)]/10">
        <h1 className="cyber-header text-3xl font-bold text-white mb-2">
          Initialize Meme Duel
          <div className="h-1 w-32 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="duelName" className="block mb-2 text-lg font-semibold text-[var(--neon-blue)]">MEME Duel Name:</label>
            <input
              type="text"
              id="duelName"
              value={duelName}
              onChange={(e) => setDuelName(e.target.value)}
              className={`w-full px-4 py-3 glass-card border ${errors.duelName ? 'border-[var(--neon-pink)]' : 'border-[var(--neon-blue)]/30'} bg-black/20 rounded-lg text-white outline-none focus:border-[var(--neon-blue)] transition-colors duration-200`}
            />
            {errors.duelName && <p className="text-[var(--neon-pink)] text-sm mt-1">{errors.duelName}</p>}
          </div>
          
          <div>
            <label htmlFor="duelDescription" className="block mb-2 text-lg font-semibold text-[var(--neon-blue)]">Meme Parameter  :</label>
            <textarea
              id="duelDescription"
              value={duelDescription}
              onChange={(e) => setDuelDescription(e.target.value)}
              className={`w-full p-4 glass-card border ${errors.duelDescription ? 'border-[var(--neon-pink)]' : 'border-[var(--neon-blue)]/30'} bg-black/20 rounded-lg text-white outline-none focus:border-[var(--neon-blue)] transition-colors duration-200 h-32 resize-none`}
            ></textarea>
            {errors.duelDescription && <p className="text-[var(--neon-pink)] text-sm mt-1">{errors.duelDescription}</p>}
          </div>

          <div className="glass-card rounded-lg p-6 border border-[var(--neon-blue)]/10">
            <h2 className="cyber-header text-xl font-bold text-white mb-4">
              Meme Details
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Meme Name"
                value={currentMeme.name}
                onChange={(e) => setCurrentMeme({ ...currentMeme, name: e.target.value })}
                className={`w-full px-4 py-3 glass-card border ${errors.memeName ? 'border-[var(--neon-pink)]' : 'border-[var(--neon-blue)]/30'} bg-black/20 rounded-lg text-white outline-none focus:border-[var(--neon-blue)] transition-colors duration-200`}
              />
              {errors.memeName && <p className="text-[var(--neon-pink)] text-sm mt-1">{errors.memeName}</p>}
              
              <input
                type="url"
                placeholder="Meme Image URL"
                value={currentMeme.image}
                onChange={(e) => setCurrentMeme({ ...currentMeme, image: e.target.value })}
                className={`w-full px-4 py-3 glass-card border ${errors.memeImage ? 'border-[var(--neon-pink)]' : 'border-[var(--neon-blue)]/30'} bg-black/20 rounded-lg text-white outline-none focus:border-[var(--neon-blue)] transition-colors duration-200`}
              />
              {errors.memeImage && <p className="text-[var(--neon-pink)] text-sm mt-1">{errors.memeImage}</p>}
              
              <input
                type="text"
                placeholder="Meme Tag"
                value={currentMeme.hashtag}
                onChange={(e) => setCurrentMeme({ ...currentMeme, hashtag: e.target.value })}
                className={`w-full px-4 py-3 glass-card border ${errors.memeHashtag ? 'border-[var(--neon-pink)]' : 'border-[var(--neon-blue)]/30'} bg-black/20 rounded-lg text-white outline-none focus:border-[var(--neon-blue)] transition-colors duration-200`}
              />
              {errors.memeHashtag && <p className="text-[var(--neon-pink)] text-sm mt-1">{errors.memeHashtag}</p>}
              
              <button
                type="button"
                onClick={handleAddMeme}
                className="cyber-button inline-block rounded"
              >
                Add Neural Pattern
              </button>
            </div>

            {memes.length > 0 && (
              <div className="mt-6 glass-card rounded-lg p-4 border border-[var(--neon-blue)]/10">
                <h3 className="cyber-header text-lg font-semibold text-white mb-4">
                  Configured Meme Patterns ({memes.length}/2 minimum):
                  <div className="h-1 w-20 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mt-2"></div>
                </h3>
                <ul className="space-y-2">
                  {memes.map((meme, index) => (
                    <li key={index} className="flex items-center space-x-2 text-[var(--neon-blue)]/70">
                      <span className="font-bold text-[var(--neon-blue)]">{meme.name}</span>
                      <span>-</span>
                      <span>#{meme.hashtag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {memes.length > 0 && (
            <div className="glass-card rounded-lg p-6 border border-[var(--neon-blue)]/10">
              <Card className="border-none bg-transparent">
                <CardHeader className="pb-0 pt-0 px-0 flex-col items-start">
                  <p className="text-sm uppercase font-bold text-[var(--neon-blue)]">Neural Preview</p>
                  <h4 className="font-bold text-2xl text-white">{memes[0].name}</h4>
                  <small className="text-[var(--neon-blue)]/70">#{memes[0].hashtag}</small>
                </CardHeader>
                <CardBody className="overflow-visible py-4 px-0">
                  <Image
                    alt="Neural pattern preview"
                    className="object-cover rounded-xl border border-[var(--neon-blue)]/30"
                    src={memes[0].image}
                    width="100%"
                    height={300}
                  />
                </CardBody>
              </Card>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`cyber-button w-full inline-block rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Initializing...' : 'Initialize Meme Duel'}
          </button>
        </form>
      </div>

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

export default AddMemeDuel;
