require('dotenv').config();
const { ethers } = require('ethers');

// Update this value only if you want a hardcoded deploy key.
// In production, prefer using `DEPLOYER_PRIVATE_KEY` in your .env file.
const DEFAULT_PRIVATE_KEY = '0x834a81e1943fd68b9673b98e3c97eb6300b0ede3952feb332f17ac155dd794bd';

const ALCHEMY_URL = process.env.VITE_ALCHEMY_BASE_URL;
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || DEFAULT_PRIVATE_KEY;

async function deployContract() {
  if (!ALCHEMY_URL) {
    throw new Error('Missing VITE_ALCHEMY_BASE_URL in environment');
  }
  if (!DEPLOYER_PRIVATE_KEY) {
    throw new Error('Missing deployer private key');
  }

  console.log('Deploying AgriTraceability contract to Base network...');
  const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);
  const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);

  // TODO: Replace with compiled contract ABI and bytecode.
  const contractAbi = [
    'function addPartner(address partner, uint8 role) external',
  ];
  const contractBytecode = '0x';

  if (contractBytecode === '0x') {
    console.warn('Contract bytecode is still placeholder. Update deploy.js with compiled bytecode before deploying.');
    return;
  }

  const factory = new ethers.ContractFactory(contractAbi, contractBytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log('Contract deployed at:', contract.target);
  console.log('Update CONTRACT_ADDRESS in src/lib/blockchain.ts');
}

deployContract().catch((error) => {
  console.error('Deployment failed:', error);
  process.exit(1);
});