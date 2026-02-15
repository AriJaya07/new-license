"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { ADDRESSES, ERC721Abi, Listing, MarketplaceAbi, MyNFTAbi } from "../contracts";
import { ethers } from "ethers";

export const useMyNFTRead = () => {
  const { data: totalSupply } = useReadContract({
    address: ADDRESSES.myNFT,
    abi: MyNFTAbi,
    functionName: "totalSupply",
  });

  return {
    totalSupply,
  };
};

export const useMyNFTs = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const { address: userAddress } = useAccount(); // get connected wallet address
  const providerContract = process.env.NEXT_PUBLIC_PROVIDER_CONTRACT;

  const { data, isLoading, isError, refetch } = useReadContract({
    address: ADDRESSES.marketplace,
    abi: MarketplaceAbi,
    functionName: "getAllListings",
  });

  useEffect(() => {
    const fetchTokenURIs = async () => {
      if (data && userAddress) {
        // Filter first by seller = userAddress
        const userListings = data.filter(
          (listing: any) =>
            listing.seller.toLowerCase() === userAddress.toLowerCase()
        );

        const listingsData = await Promise.all(
          userListings.map(async (listing: any, index: number) => {
            const provider = new ethers.JsonRpcProvider(providerContract);
            const nftContract = new ethers.Contract(listing.nftContract, ERC721Abi, provider);
            const tokenURI = await nftContract.tokenURI(listing.tokenId);

            return {
              listingId: BigInt(index + 1),
              nftContract: listing.nftContract,
              tokenId: listing.tokenId.toString(),
              seller: listing.seller,
              price: listing.price,
              active: listing.active,
              tokenURI,
            };
          })
        );

        setListings(listingsData);
      }
    };

    fetchTokenURIs();
  }, [data, userAddress]);

  return {
    listings,
    isLoading,
    isError,
    refetch,
  };
};

export const useListMarketplaceRead = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const providerContract = process.env.NEXT_PUBLIC_PROVIDER_CONTRACT

  // Read contract: getAllListings
  const { data, isLoading, isError, refetch } = useReadContract({
    address: ADDRESSES.marketplace, // Replace with the correct contract address
    abi: MarketplaceAbi,
    functionName: "getAllListings",
  });

  useEffect(() => {
    const fetchTokenURIs = async () => {
      if (data) {
        // Use Promise.all to fetch tokenURI for each listing in parallel
        const listingsData = await Promise.all(
          data.map(async (listing: any, index: number) => {
            const provider = new ethers.JsonRpcProvider(providerContract); // Use local Ethereum node
            const nftContract = new ethers.Contract(listing.nftContract, ERC721Abi, provider);
            const tokenURI = await nftContract.tokenURI(listing.tokenId);

            return {
              listingId: BigInt(index + 1),
              nftContract: listing.nftContract,
              tokenId: listing.tokenId.toString(),
              seller: listing.seller,
              // price: ethers.utils.formatEther(listing.price.toString()), // Format price in ETH
              price: listing.price.toString(), // Format price in ETH
              active: listing.active,
              tokenURI, // Store token URI
            };
          })
        );

        setListings(listingsData);
      }
    };

    fetchTokenURIs();
  }, [data]);

  return {
    listings,
    isLoading,
    isError,
    refetch,
  };
};

export const useDetailMarketplaceRead = ({ listingId }: { listingId: any }) => {
  const { data, isLoading, isError } = useReadContract({
    address: ADDRESSES.marketplace,
    abi: MarketplaceAbi,
    functionName: "getListing",
    args: [listingId],
  });

  return {
    data,
    isLoading,
    isError,
  };
};

export const useMarketplaceFee = () => {
  const { data, isLoading, isError, refetch } = useReadContract({
    address: ADDRESSES.marketplace,
    abi: MarketplaceAbi,
    // functionName: "getMarketplaceFee",
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

// NEW HOOK: Fetch tokenURI from the NFT contract
export const useNFTTokenURI = ({
  nftContract,
  tokenId,
}: {
  nftContract: `0x${string}`;
  tokenId: bigint;
}) => {
  const { data, isLoading, isError } = useReadContract({
    address: nftContract,
    abi: MyNFTAbi,
    functionName: "tokenURI",
    args: [tokenId],
  });

  return {
    tokenURI: data as string | undefined,
    isLoading,
    isError,
  };
};