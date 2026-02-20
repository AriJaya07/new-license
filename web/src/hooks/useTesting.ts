import { useState, useEffect } from "react";
import { ethers } from "ethers";

// Your NFTMarketplace ABI
const NFTMarketplaceABI = [
  "function getAllListings() external view returns (tuple(address nftContract, uint256 tokenId, address seller, uint256 price, bool active)[])",
];

// MyNFT ABI
const MyNFTABI = ["function tokenURI(uint256 tokenId) external view returns (string memory)"];

const useNFTMarketplace = (contractAddress: string) => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Get the provider
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Use local Ethereum node
        const contract = new ethers.Contract(contractAddress, NFTMarketplaceABI, provider);

        // Fetch the listings
        const allListings = await contract.getAllListings();

        // Fetch tokenURI for each listing
        const formattedListings = await Promise.all(
          allListings.map(async (listing: any) => {
            const nftContract = new ethers.Contract(listing[0], MyNFTABI, provider);
            const tokenURI = await nftContract.tokenURI(listing[1]); // Get token URI using tokenId

            return {
              nftContract: listing[0], // NFT contract address
              tokenId: listing[1].toString(), // Convert BigInt to string
              seller: listing[2], // Seller address
              //   price: ethers.utils.formatEther(listing[3].toString()), // Convert Wei to ETH
              price: listing[3].toString(), // Convert Wei to ETH
              active: listing[4], // Active status
              tokenURI: tokenURI, // The token URI for each token
            };
          })
        );

        setListings(formattedListings);
      } catch (err) {
        setError("Failed to fetch listings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [contractAddress]);

  return { listings, loading, error };
};

export default useNFTMarketplace;
