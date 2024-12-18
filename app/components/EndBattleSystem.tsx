// import { ethers } from 'ethers';
// import { useState } from 'react';

// interface EndBattleSystemProps {
//   battleId: string;
// }

// const EndBattleSystem: React.FC<EndBattleSystemProps> = ({ battleId }) => {
//   const [isEnding, setIsEnding] = useState(false);

//   const endBattle = async () => {
//     if (!window.ethereum) {
//       alert('Please install MetaMask to end battles!');
//       return;
//     }

//     setIsEnding(true);

//     try {
//       await window.ethereum.request({ method: 'eth_requestAccounts' });
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();

//       // Replace with your actual smart contract address and ABI
//       const contractAddress = 'YOUR_CONTRACT_ADDRESS';
//       const contractABI = []; // Your contract ABI goes here
//       const contract = new ethers.Contract(contractAddress, contractABI, signer);

//       const tx = await contract.endBattle(battleId);
//       await tx.wait();
//       alert('Battle ended successfully!');
//     } catch (error) {
//       console.error('Error ending battle:', error);
//       alert('Error ending battle. Please try again.');
//     } finally {
//       setIsEnding(false);
//     }
//   };

//   return (
//     <button onClick={endBattle} disabled={isEnding}>
//       {isEnding ? 'Ending Battle...' : 'End Battle'}
//     </button>
//   );
// };

// export default EndBattleSystem;