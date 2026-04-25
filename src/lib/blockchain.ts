import { ethers } from 'ethers';

// Contract ABI (from the AgriTraceability contract)
const CONTRACT_ABI = [
  "function addPartner(address partner, uint8 role) external",
  "function createBatch(string memory ipfsCID, uint256 basePrice) external",
  "function startTransit(uint256 batchId) external",
  "function confirmDelivery(uint256 batchId) external payable",
  "function getBatch(uint256 batchId) external view returns (tuple(string, address, uint256, uint256, bool, uint8))",
  "function getPartnerRole(address partner) external view returns (uint8)",
  "function calculatePayment(uint256 basePrice) external pure returns (uint256)",
  "event HarvestLogged(uint256 indexed batchId, string ipfsCID, address indexed farmer)",
  "event TransitStarted(uint256 indexed batchId)",
  "event PaymentReleased(uint256 indexed batchId, uint256 amount)"
];

// Contract address (placeholder - replace with deployed address)
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with actual deployed address

// Initialize provider and contract
const getProvider = () => {
  const alchemyUrl = import.meta.env.VITE_ALCHEMY_BASE_URL;
  if (!alchemyUrl) throw new Error('Alchemy URL not configured');
  return new ethers.JsonRpcProvider(alchemyUrl);
};

const getContract = (signer?: ethers.Signer) => {
  const provider = getProvider();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer || provider);
  return contract;
};

// Connect wallet (MetaMask)
export const connectWallet = async () => {
  if (!window.ethereum) throw new Error('MetaMask not installed');

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  return { provider, signer };
};

// Contract interaction functions
export const addPartner = async (partnerAddress: string, role: number, signer: ethers.Signer) => {
  const contract = getContract(signer);
  const tx = await contract.addPartner(partnerAddress, role);
  await tx.wait();
  return tx;
};

export const createBatch = async (ipfsCID: string, basePrice: string, signer: ethers.Signer) => {
  const contract = getContract(signer);
  const priceInWei = ethers.parseEther(basePrice);
  const tx = await contract.createBatch(ipfsCID, priceInWei);
  await tx.wait();
  return tx;
};

export const startTransit = async (batchId: number, signer: ethers.Signer) => {
  const contract = getContract(signer);
  const tx = await contract.startTransit(batchId);
  await tx.wait();
  return tx;
};

export const confirmDelivery = async (batchId: number, paymentAmount: string, signer: ethers.Signer) => {
  const contract = getContract(signer);
  const amountInWei = ethers.parseEther(paymentAmount);
  const tx = await contract.confirmDelivery(batchId, { value: amountInWei });
  await tx.wait();
  return tx;
};

export const getBatch = async (batchId: number) => {
  const contract = getContract();
  const batch = await contract.getBatch(batchId);
  return {
    ipfsCID: batch[0],
    farmer: batch[1],
    basePrice: ethers.formatEther(batch[2]),
    farmerMargin: ethers.formatEther(batch[3]),
    isDelivered: batch[4],
    status: batch[5]
  };
};

export const getPartnerRole = async (address: string) => {
  const contract = getContract();
  return await contract.getPartnerRole(address);
};

export const calculatePayment = async (basePrice: string) => {
  const contract = getContract();
  const priceInWei = ethers.parseEther(basePrice);
  const totalPayment = await contract.calculatePayment(priceInWei);
  return ethers.formatEther(totalPayment);
};

// IPFS utilities using Pinata
export const uploadToIPFS = async (data: any) => {
  // Note: This is a placeholder. In a real implementation, you'd use Pinata SDK
  // For now, we'll use the provided CID
  const pinataCID = import.meta.env.VITE_PINATA_CID;
  if (!pinataCID) throw new Error('Pinata CID not configured');
  return pinataCID;
};

// Declare window.ethereum for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}