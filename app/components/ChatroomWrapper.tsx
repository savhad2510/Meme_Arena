"use client";

import React , {useState , useEffect} from 'react';
import Chatroom from './Chatroom';


declare global {
  interface Window {
    ethereum?: any;
  }
}



const ChatroomWrapper = ({ roomId }: { roomId: string }) => {

  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access`
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        // Switch to mantle Sepolia
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x66eee' }], // Chain ID for mantle Sepolia
        });
      } catch (error) {
        console.error('Error connecting to MetaMask', error);
      }
    } else {
      console.log('Please install MetaMask!');
    }
  };



  if (!account) {
    return (
      <div>
        <p>Please connect your wallet to access the chatroom.</p>
        <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2 mt-4">
          Connect Wallet
        </button>
      </div>
    );
  }

  return <Chatroom roomId={roomId} />;
};

export default ChatroomWrapper;
