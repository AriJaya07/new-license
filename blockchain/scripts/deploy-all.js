import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Starting full deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy MyNFT
  console.log("1. Deploying MyNFT...");
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment();
  const nftAddress = await myNFT.getAddress();
  console.log("✓ MyNFT deployed to:", nftAddress, "\n");

  // Deploy NFTMarketplace
  console.log("2. Deploying NFTMarketplace...");
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✓ NFTMarketplace deployed to:", marketplaceAddress, "\n");

  // Save all deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contracts: {
      MyNFT: nftAddress,
      NFTMarketplace: marketplaceAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `all-contracts-${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Save ABIs
  const abisDir = path.join(__dirname, "..", "abis");
  if (!fs.existsSync(abisDir)) {
    fs.mkdirSync(abisDir);
  }

  const nftArtifact = await hre.artifacts.readArtifact("MyNFT");
  fs.writeFileSync(
    path.join(abisDir, "MyNFT.json"),
    JSON.stringify(nftArtifact.abi, null, 2)
  );

  const marketplaceArtifact = await hre.artifacts.readArtifact("NFTMarketplace");
  fs.writeFileSync(
    path.join(abisDir, "NFTMarketplace.json"),
    JSON.stringify(marketplaceArtifact.abi, null, 2)
  );

  console.log("=".repeat(50));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(50));
  console.log("Network:", hre.network.name);
  console.log("MyNFT:", nftAddress);
  console.log("NFTMarketplace:", marketplaceAddress);
  console.log("Deployer:", deployer.address);
  console.log("=".repeat(50));

  // Wait for confirmations on testnet/mainnet
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await myNFT.deploymentTransaction().wait(6);
    await marketplace.deploymentTransaction().wait(6);
    console.log("✓ Confirmed!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });