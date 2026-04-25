# AgriTrace - Secure Source Agri-Traceability Protocol

A decentralized application for agricultural supply chain traceability on the Base network, ensuring farmer sovereignty through immutable 18% margin protection.

## Features

- **Blockchain-Verified Batches**: Create harvest batches with cryptographic seals on Base network
- **Immutable Farmer Margins**: 18% margin mathematically locked in smart contracts
- **IPFS Metadata Storage**: Batch metadata stored on Pinata IPFS
- **Role-Based Access**: Farmer, Logistics, and Retailer roles with controlled permissions
- **QR Code Verification**: Consumer verification through blockchain-anchored QR codes
- **Real-time Status Tracking**: Monitor batch status from harvest to delivery

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Blockchain**: Solidity smart contracts on Base network
- **IPFS**: Pinata for decentralized metadata storage
- **Database**: Supabase for off-chain data
- **Styling**: Tailwind CSS with custom design system

## Setup

### Prerequisites
- Node.js (v18+)
- MetaMask wallet
- Base network configured in MetaMask

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   
   Copy `.env.example` to `.env` and configure:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Blockchain Configuration
   VITE_ALCHEMY_BASE_URL=https://base-mainnet.g.alchemy.com/v2/your_api_key
   
   # IPFS Configuration (Pinata)
   VITE_PINATA_FILE_ID=your_pinata_file_id
   VITE_PINATA_CID=your_pinata_cid
   ```

3. **Smart Contract Deployment:**
   
   Deploy the `AgriTraceability.sol` contract to Base network:
   ```bash
   # Update deploy.js with your private key and contract details
   node deploy.js
   ```
   
   Update `CONTRACT_ADDRESS` in `src/lib/blockchain.ts` with the deployed address.

4. **Partner Setup:**
   
   As contract owner, add authorized partners:
   - Farmers: Can create batches
   - Logistics: Can start transit
   - Retailers: Can confirm delivery and release payments

### Running the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## Usage

### For Farmers
1. Connect MetaMask wallet
2. Navigate to Dashboard
3. Click "Blockchain Seal" to create a batch
4. Enter crop details and base price
5. Confirm transaction to seal batch on-chain

### For Logistics
1. Connect wallet with logistics role
2. Start transit for batches in "Harvested" status

### For Retailers
1. Connect wallet with retailer role
2. Confirm delivery and pay the calculated amount
3. Payment automatically releases to farmer

### For Consumers
1. Scan QR code on product
2. Verify batch authenticity and supply chain history

## Smart Contract Architecture

- **AgriTraceability.sol**: Main contract handling batch lifecycle
- **Role-based access control** with OpenZeppelin's Ownable
- **Escrow mechanism** for secure payment handling
- **Event emission** for The Graph indexing
- **Mathematical margin locking** preventing manipulation

## API Endpoints

- **Alchemy Base RPC**: `https://base-mainnet.g.alchemy.com/v2/{API_KEY}`
- **Pinata IPFS**: File ID and CID configured in environment

## Security Features

- **Immutable margins**: 18% farmer protection mathematically enforced
- **Role whitelisting**: Only authorized addresses can perform actions
- **Escrow payments**: Funds held until delivery confirmation
- **Blockchain verification**: All transactions cryptographically sealed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test locally
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
