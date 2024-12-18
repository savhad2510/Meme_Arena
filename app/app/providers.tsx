// app/providers.tsx
'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { NextUIProvider } from '@nextui-org/react';
import { initializeApp } from 'firebase/app';
import { useEffect, useState } from 'react';
import { WagmiConfig, createConfig, http } from 'wagmi';
import { mantleTestnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Mantle Sepolia testnet configuration
const mantleSepolia = {
  id: 5003,
  name: 'Mantle Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: { 
      http: [
        'https://rpc.sepolia.mantle.xyz',
        'https://endpoints.omniatech.io/v1/mantle/sepolia/public',
        'https://node.histori.xyz/mantle-sepolia/8ry9f6t9dct1se2hlagxnd9n2a'
      ] 
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.sepolia.mantle.xyz' },
  },
  testnet: true,
} as const;

const config = createConfig({
  chains: [mantleSepolia],
  connectors: [injected()],
  transports: {
    [mantleSepolia.id]: http(mantleSepolia.rpcUrls.default.http[0]),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);

  useEffect(() => {
    try {
      initializeApp(firebaseConfig);
      setIsFirebaseInitialized(true);
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }, []);

  if (!isFirebaseInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <WagmiConfig config={config}>
      <CacheProvider>
        <ChakraProvider>
          <NextUIProvider>{children}</NextUIProvider>
        </ChakraProvider>
      </CacheProvider>
    </WagmiConfig>
  );
}
