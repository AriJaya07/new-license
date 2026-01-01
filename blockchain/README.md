# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

🎨 NFT Marketplace - Complete ERC-721 Project
A full-stack decentralized NFT marketplace built with Solidity, Hardhat, React, and ethers.js.
📋 Table of Contents

Features
Tech Stack
Project Structure
Prerequisites
Installation
Configuration
Smart Contract Development
Frontend Setup
Backend Setup
Deployment
Testing
Usage
Troubleshooting

✨ Features
Smart Contracts

✅ ERC-721 NFT Contract with metadata storage
✅ NFT Marketplace with listing/buying functionality
✅ Marketplace fee system (2.5% default)
✅ Price update functionality
✅ Listing cancellation
✅ Fee withdrawal for marketplace owner
✅ Reentrancy protection
✅ OpenZeppelin security standards

Frontend (Coming Soon)

🎨 Browse and explore NFTs
🖼️ Mint new NFTs with IPFS storage
💰 List NFTs for sale
🛒 Buy NFTs from marketplace
👤 User profile with owned NFTs
🔍 Search and filter functionality
🌐 Web3 wallet integration (MetaMask, WalletConnect)

Backend (Optional)

📊 Blockchain event indexing
🗃️ NFT metadata caching
👥 User profile management
📈 Analytics and statistics

🛠️ Tech Stack
Blockchain

Solidity ^0.8.28 - Smart contract language
Hardhat - Development environment
OpenZeppelin - Secure smart contract library
ethers.js - Ethereum library

Frontend

React - UI framework
Vite - Build tool
wagmi - React hooks for Ethereum
RainbowKit - Wallet connection
TailwindCSS - Styling

Backend

Node.js - Runtime
Express - Web framework
MongoDB - Database
Mongoose - ODM

Storage

IPFS - Decentralized file storage
Pinata - IPFS pinning service

📁 Project Structure
nft-marketplace/
├── contracts/              # Smart contracts
│   ├── MyNFT.sol
│   └── NFTMarketplace.sol
├── scripts/               # Deployment scripts
│   ├── deploy-nft.js
│   ├── deploy-marketplace.js
│   ├── deploy-all.js
│   └── verify.js
├── test/                  # Contract tests
│   ├── MyNFT.test.js
│   └── NFTMarketplace.test.js
├── frontend/              # React frontend
│   └── src/
├── backend/               # Express backend (optional)
│   └── src/
├── abis/                  # Contract ABIs
├── deployments/           # Deployment info
├── hardhat.config.js      # Hardhat configuration
├── package.json
└── .env
📦 Prerequisites

Node.js >= 16.x
npm or yarn
Git
MetaMask or another Web3 wallet
Testnet ETH (for deployment)

🚀 Installation
1. Clone the Repository
bashgit clone https://github.com/yourusername/nft-marketplace.git
cd nft-marketplace
2. Install Dependencies
bashnpm install
3. Install Hardhat and OpenZeppelin
bashnpm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts dotenv
⚙️ Configuration
1. Create Environment File
bashcp .env.example .env
2. Configure .env File
env# Private Keys (NEVER commit real keys!)
PRIVATE_KEY=your_wallet_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR-API-KEY
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR-API-KEY

# API Keys for Verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# IPFS/Pinata
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
3. Get Required API Keys
Alchemy (RPC Provider)

Go to Alchemy
Create account and new app
Copy API key and create RPC URL

Etherscan (Contract Verification)

Go to Etherscan
Create account
Go to API Keys section
Create new API key

Pinata (IPFS)

Go to Pinata
Create account
Go to API Keys
Create new key with admin access

📝 Smart Contract Development
1. Compile Contracts
bashnpx hardhat compile
2. Run Tests
bash# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/MyNFT.test.js

# Run with gas report
REPORT_GAS=true npx hardhat test
3. Test Coverage
bashnpx hardhat coverage
4. Deploy to Local Network
Terminal 1: Start local node
bashnpx hardhat node
Terminal 2: Deploy contracts
bash# Deploy all contracts
npx hardhat run scripts/deploy-all.js --network localhost

# Or deploy individually
npx hardhat run scripts/deploy-nft.js --network localhost
npx hardhat run scripts/deploy-marketplace.js --network localhost
5. Deploy to Testnet (Sepolia)
bashnpx hardhat run scripts/deploy-all.js --network sepolia
6. Verify Contracts on Etherscan
bashnpx hardhat run scripts/verify.js --network sepolia
🎨 Frontend Setup
1. Navigate to Frontend
bashcd frontend
2. Create React App with Vite
bashnpm create vite@latest . -- --template react
3. Install Frontend Dependencies
bashnpm install ethers wagmi viem @rainbow-me/rainbowkit
npm install @tanstack/react-query
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
4. Configure Tailwind
Edit tailwind.config.js:
javascriptexport default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
5. Start Development Server
bashnpm run dev
🔧 Backend Setup (Optional)
1. Navigate to Backend
bashcd backend
2. Initialize Node.js Project
bashnpm init -y
3. Install Backend Dependencies
bashnpm install express mongoose dotenv cors
npm install ethers
npm install --save-dev nodemon
4. Configure Backend .env
envPORT=5000
MONGODB_URI=mongodb://localhost:27017/nft-marketplace
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
5. Start Backend Server
bashnpm run dev
🌐 Deployment
Deploy to Sepolia Testnet

Get Test ETH

Visit Sepolia Faucet
Enter your wallet address
Receive test ETH


Deploy Contracts

bashnpx hardhat run scripts/deploy-all.js --network sepolia

Verify Contracts

bashnpx hardhat run scripts/verify.js --network sepolia

Save Contract Addresses

Check deployments/all-contracts-sepolia.json
Update frontend config with contract addresses



Deploy Frontend
Vercel
bashcd frontend
npm run build
npx vercel
Netlify
bashcd frontend
npm run build
netlify deploy --prod --dir=dist
Deploy Backend
Heroku
bashcd backend
heroku create your-app-name
git push heroku main
Railway
bashcd backend
railway login
railway init
railway up
🧪 Testing
Run All Tests
bashnpm test
Test Individual Components
Smart Contracts
bashnpx hardhat test test/MyNFT.test.js
npx hardhat test test/NFTMarketplace.test.js
Frontend (once set up)
bashcd frontend
npm test
Gas Reporting
bashREPORT_GAS=true npx hardhat test
📖 Usage
Minting an NFT

Upload image to IPFS

javascript// Using Pinata
const formData = new FormData();
formData.append('file', file);

const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
  method: 'POST',
  headers: {
    'pinata_api_key': YOUR_PINATA_KEY,
    'pinata_secret_api_key': YOUR_PINATA_SECRET
  },
  body: formData
});

const { IpfsHash } = await response.json();

Mint NFT

javascriptconst tx = await nftContract.mint(
  userAddress, 
  IpfsHash
);
await tx.wait();
Listing an NFT

Approve marketplace

javascriptconst approveTx = await nftContract.approve(
  marketplaceAddress, 
  tokenId
);
await approveTx.wait();

List NFT

javascriptconst price = ethers.parseEther("1.0"); // 1 ETH
const listTx = await marketplaceContract.listNFT(
  nftContractAddress,
  tokenId,
  price
);
await listTx.wait();
Buying an NFT
javascriptconst listing = await marketplaceContract.getListing(listingId);
const buyTx = await marketplaceContract.buyNFT(
  listingId,
  { value: listing.price }
);
await buyTx.wait();
Canceling a Listing
javascriptconst cancelTx = await marketplaceContract.cancelListing(listingId);
await cancelTx.wait();
Updating Listing Price
javascriptconst newPrice = ethers.parseEther("2.0"); // 2 ETH
const updateTx = await marketplaceContract.updateListingPrice(
  listingId,
  newPrice
);
await updateTx.wait();
🐛 Troubleshooting
Common Issues
1. "Marketplace not approved" error

Solution: Call approve() or setApprovalForAll() on NFT contract before listing

2. "Insufficient funds" error

Solution: Ensure your wallet has enough ETH for gas fees and purchase price

3. "Nonce too high" error

Solution: Reset your MetaMask account (Settings > Advanced > Reset Account)

4. Contract verification fails

Solution: Wait a few minutes after deployment, ensure correct constructor arguments

5. IPFS upload fails

Solution: Check Pinata API keys, ensure file size is within limits

Reset Local Blockchain
bashnpx hardhat clean
npx hardhat node --reset
Clear Hardhat Cache
bashnpx hardhat clean
rm -rf cache artifacts
npx hardhat compile
📚 Additional Resources

Hardhat Documentation
OpenZeppelin Contracts
ethers.js Documentation
IPFS Documentation
Pinata Documentation
Solidity Documentation

🔐 Security Best Practices

Never commit private keys to Git
Always use .gitignore for sensitive files
Audit contracts before mainnet deployment
Use testnet first before deploying to mainnet
Keep dependencies updated for security patches
Implement rate limiting on backend APIs
Validate all user inputs on frontend and backend
Use HTTPS for production deployments

🤝 Contributing

Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
👥 Support
For support, email support@example.com or join our Discord channel.
🙏 Acknowledgments

OpenZeppelin for secure smart contract libraries
Hardhat team for excellent development tools
IPFS/Pinata for decentralized storage
Ethereum community for documentation and support


Built with ❤️ by [Your Name]
Happy Building! 🚀
