"use client";
import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { EvmChains, IndexService, SignProtocolClient, SpMode } from '@ethsign/sp-sdk';
import { decodeAbiParameters } from "viem";
import { getBattleStatus, getWinningMeme } from '@/firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Attestation {
  id: string;
  attester: string;
  data: string;
  schema: {
    data: { name: string; type: string }[];
  };
}

const AttestationTable: React.FC = () => {
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [decodedData, setDecodedData] = useState<any[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [claimableAttestations, setClaimableAttestations] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setAddress(address);
        } catch (error) {
          console.error('Error connecting to wallet:', error);
        }
      }
    };

    connectWallet();
  }, []);

  useEffect(() => {
    const fetchAttestations = async () => {
      if (address) {
        const indexService = new IndexService("testnet");
        const res = await indexService.queryAttestationList({
          id: "",
          schemaId: "onchain_evm_421614_0xe9",
          attester: "",
          page: 1,
          mode: "onchain",
          indexingValue: ""
        });

        if (res?.rows) {
          const filteredAttestations = res.rows.filter(
            (attestation: Attestation) => 
              attestation.attester.toLowerCase() === address.toLowerCase()
          );
          setAttestations(filteredAttestations);
          decodeAttestationData(filteredAttestations);
        }
      }
    };

    fetchAttestations();
  }, [address]);

  useEffect(() => {
    const checkClaimableAttestations = async () => {
      const claimable: {[key: string]: boolean} = {};
      for (const att of attestations) {
        const decoded = decodedData.find(d => d?.battleId === att.id);
        if (decoded) {
          claimable[att.id] = await canUserClaim(decoded.battleId, decoded.meme_id);
        }
      }
      setClaimableAttestations(claimable);
    };

    if (attestations.length > 0 && decodedData.length > 0) {
      checkClaimableAttestations();
    }
  }, [attestations, decodedData]);

  const decodeAttestationData = (attestations: Attestation[]) => {
    const decodedDataObjects = attestations.map(att => {
      if (!att.data) return null;

      try {
        const hexData = att.data.startsWith('0x') ? att.data : `0x${att.data}`;
        const decodedData = decodeAbiParameters(
          att.schema.data,
          hexData as `0x${string}`
        ) as [string ,string ,bigint, bigint, bigint, bigint, string]; // Add this type assertion

        return {
          battleId : decodedData[1].toString(),
          meme_id: decodedData[2].toString(),
          bet_amount: ethers.formatEther(decodedData[3].toString()),
          bet_timestamp: new Date(Number(decodedData[4]) * 1000).toLocaleString(),
          action: decodedData[6].toString()
        };
      } catch (error) {
        console.error('Error decoding attestation data:', error);
        return null;
      }
    }).filter(Boolean);

    setDecodedData(decodedDataObjects);
  };

  const canUserClaim = async (battleId: string, memeId: string) => {
    const battleStatus = await getBattleStatus(battleId);
    if (battleStatus !== 'ended') return false;

    const winningMeme = await getWinningMeme(battleId);
    return winningMeme === memeId;
  };

  const handleClaim = async (battleId: string, memeId: string) => {
    if (!address) {
      console.error('No wallet connected');
      toast.error('No wallet connected. Please connect your wallet and try again.');
      return;
    }

    const client = new SignProtocolClient(SpMode.OnChain, {
      chain: EvmChains.mantleSepolia,
    });

    try {
      toast.info('Creating claim attestation...', { autoClose: false });
      const createAttestationRes = await client.createAttestation(
        {
          schemaId: "0xe9",
          data: {
            user: address,
            battleId: battleId,
            meme_id: BigInt(memeId),
            bet_amount: BigInt(0),
            bet_timestamp: BigInt(Math.floor(Date.now() / 1000)),
            win_amount: BigInt(0),
            action: "CLAIM",
          },
          indexingValue: `${address.toLowerCase()}`,
        },
        {
          resolverFeesETH: ethers.parseEther("0"),
          getTxHash: (txHash) => {
            console.log("Transaction hash:", txHash as `0x${string}`);
          },
        }
      );

      if (createAttestationRes) {
        console.log('Claim attestation created successfully');
        toast.success('Claim attestation created successfully!');
        // Update the UI or state as needed
      }
    } catch (error) {
      console.error('Error creating claim attestation:', error);
      toast.error('Error creating claim attestation. Please try again.');
    }
  };

  return (
    <div className="bg-gray-900 bg-opacity-60 rounded-3xl shadow-2xl p-8 backdrop-blur-lg">
      {/* <h2 className="text-3xl font-bold text-[#5A08C0] mb-6">Your Attestations</h2> */}
      {attestations.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No attestations found. Start betting to see your activity!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800 bg-opacity-50">
              <th className="p-4 text-sm font-semibold text-[#410DEF] uppercase tracking-wider">Battle Id</th>
                <th className="p-4 text-sm font-semibold text-[#410DEF] uppercase tracking-wider">Meme Id</th>
                <th className="p-4 text-sm font-semibold text-[#410DEF] uppercase tracking-wider">Bet Amount (ETH)</th>
                <th className="p-4 text-sm font-semibold text-[#410DEF] uppercase tracking-wider">Bet Timestamp</th>
                <th className="p-4 text-sm font-semibold text-[#410DEF] uppercase tracking-wider">Action</th>
                <th className="p-4 text-sm font-semibold text-[#410DEF] uppercase tracking-wider">Claim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {attestations.map((attestation, index) => (
                <tr key={attestation.id} className="hover:bg-gray-800 hover:bg-opacity-30 transition-colors duration-200">
                  <td className="p-4 text-gray-300">{decodedData[index]?.battleId}</td>
                  <td className="p-4 text-gray-300">{decodedData[index]?.meme_id}</td>
                  <td className="p-4 text-gray-300">{decodedData[index]?.bet_amount}</td>
                  <td className="p-4 text-gray-300">{decodedData[index]?.bet_timestamp}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      decodedData[index]?.action === 'USER_BET' ? 'bg-[#5A08C0] text-blue-100' : 'bg-[#5A08C0] text-green-100'
                    }`}>
                      {decodedData[index]?.action}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      className={claimableAttestations[attestation.id] ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-600'}
                      onClick={() => handleClaim(decodedData[index]?.battleId, decodedData[index]?.meme_id)}
                    >
                      Claim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AttestationTable;