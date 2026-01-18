"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { ADDRESSES, ERC721Abi, Listing, MarketplaceAbi, MyNFTAbi } from "../contracts";
import { ethers } from "ethers";

export const useMyNFTRead = () => {
  const { data } = useReadContract({
    address: ADDRESSES.myNFT,
    abi: MyNFTAbi,
    functionName: "totalSupply",
  });

  return {
    data,
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
          data.map(async (listing: any) => {
            const provider = new ethers.JsonRpcProvider(providerContract); // Use local Ethereum node
            const nftContract = new ethers.Contract(listing.nftContract, ERC721Abi, provider);
            const tokenURI = await nftContract.tokenURI(listing.tokenId);

            return {
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