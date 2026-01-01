import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Deploying NFTMarketplace contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy NFTMarketplace
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.deploy();
  await marketplace.waitForDeployment();

  const marketplaceAddress = await marketplace.getAddress();
  console.log("NFTMarketplace deployed to:", marketplaceAddress);

  // Save contract address and ABI
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: marketplaceAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info
  const deploymentPath = path.join(
    deploymentsDir,
    `NFTMarketplace-${hre.network.name}.json`
  );
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to:", deploymentPath);

  // Save ABI
  const artifact = await hre.artifacts.readArtifact("NFTMarketplace");
  const abisDir = path.join(__dirname, "..", "abis");
  if (!fs.existsSync(abisDir)) {
    fs.mkdirSync(abisDir);
  }
  fs.writeFileSync(
    path.join(abisDir, "NFTMarketplace.json"),
    JSON.stringify(artifact.abi, null, 2)
  );

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("NFTMarketplace Address:", marketplaceAddress);
  console.log("Marketplace Fee:", "2.5%");
  console.log("Deployer:", deployer.address);
  console.log("========================\n");

  // Wait for block confirmations on non-local networks
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await marketplace.deploymentTransaction().wait(6);
    console.log("Confirmed!");
  }

  return marketplaceAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });