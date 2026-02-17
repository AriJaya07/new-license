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

  const { data: allListings, isLoading, isError, refetch } = useReadContract({
    address: ADDRESSES.marketplace,
    abi: MarketplaceAbi,
    functionName: "getAllListings",
  });

  const { data: tokenIds } = useReadContract({
    address: ADDRESSES.myNFT,
    abi: MyNFTAbi,
    functionName: "tokensOfOwner",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  useEffect(() => {
    const fetchTokenURIs = async () => {
      if (!userAddress || !tokenIds || !providerContract) {
        setListings([]);
        return;
      }

      const listingMap = new Map<
        string,
        {
          listingId: bigint;
          seller: string;
          price: string;
          active: boolean;
          nftContract: string;
          tokenId: bigint;
        }
      >();

      if (allListings) {
        allListings.forEach((listing: any, index: number) => {
          const key = `${listing.nftContract.toLowerCase()}:${listing.tokenId.toString()}`;
          listingMap.set(key, {
            listingId: BigInt(index + 1),
            seller: listing.seller,
            price: listing.price.toString(),
            active: listing.active,
            nftContract: listing.nftContract,
            tokenId: listing.tokenId,
          });
        });
      }

      const provider = new ethers.JsonRpcProvider(providerContract);
      const nftContract = new ethers.Contract(ADDRESSES.myNFT, ERC721Abi, provider);

      const listingsData = await Promise.all(
        (tokenIds as readonly bigint[]).map(async (tokenId) => {
          const tokenURI = await nftContract.tokenURI(tokenId);
          const key = `${ADDRESSES.myNFT.toLowerCase()}:${tokenId.toString()}`;
          const listing = listingMap.get(key);
          const isActive = listing?.active ?? false;

          return {
            listingId: listing?.listingId ?? BigInt(0),
            nftContract: listing?.nftContract ?? ADDRESSES.myNFT,
            tokenId: tokenId.toString(),
            seller: isActive ? listing!.seller : userAddress,
            price: isActive ? listing!.price : "0",
            active: isActive,
            tokenURI,
          };
        })
      );

      setListings(listingsData);
    };

    fetchTokenURIs();
  }, [allListings, tokenIds, userAddress, providerContract]);

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
