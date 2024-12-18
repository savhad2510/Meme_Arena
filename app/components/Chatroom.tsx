"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: any;
}

const Chatroom = ({ roomId }: { roomId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
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

  useEffect(() => {
    if (!account) return;

    console.log("Setting up Firestore listener for room:", roomId);
    const chatroomRef = doc(db, 'chatrooms', roomId);
    const messagesRef = collection(chatroomRef, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Received snapshot:", snapshot.docs.length, "messages");
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(messageList);
    }, (error) => {
      console.error("Error in onSnapshot:", error);
    });

    return () => unsubscribe();
  }, [roomId, account]);

  const handleMessageSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!account || !newMessage.trim()) return;

    console.log("Sending message...");
    const chatroomRef = doc(db, 'chatrooms', roomId);
    const messagesRef = collection(chatroomRef, 'messages');

    try {
      const docRef = await addDoc(messagesRef, {
        content: newMessage,
        sender: account,
        timestamp: serverTimestamp()
      });
      console.log("Message sent successfully with ID:", docRef.id);
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!account) {
    return <div>Please connect your wallet to access the chatroom.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Chatroom {roomId}</h1>
      <p>Connected address: {account}</p>
      <div className="mb-4 h-64 overflow-y-auto border border-gray-300 p-2">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <span className="font-bold">{message.sender.slice(0, 6)}...{message.sender.slice(-4)}:</span> {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleMessageSubmit} className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow border border-gray-300 p-2"
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 ml-2">Send</button>
      </form>
    </div>
  );
};

export default Chatroom;