import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    const network = hre.network.name;

    console.log(`Verifying contracts on ${network}`);

    // Read deployment info
    const deploymentsPath = path.join(
        __dirname, 
        "...",
         "deployments", 
         `all-contracts-${network}.json`
    );

    if (!fs.existsSync(deploymentsPath)) {
        console.error(`Deployment info not found for ${network}`);
        process.exit(1);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));

    // Verify MyNFT
    console.log("Verifying MyNFT...");
    try {
        await hre.run("verift:verify", {
            address: deployment.contract.MyNFT,
            constructorArguments: [],
        });
        console.log("MyNFT verified successfully");
    } catch (error) {
        console.error("MyNFT verification failed:", error.message, "\n");
    }

    // Verify NFTMarketplace
    console.log("Verifying NFTMarketplace...");
    try {
        await hre.run("verift:verify", {
            address: deployment.contract.NFTMarketplace,
            constructorArguments: [],
        });
        console.log("NFTMarketplace verified");
    } catch (error) {
        console.error("NFTMarketplace verification failed:", error.message, "\n");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });