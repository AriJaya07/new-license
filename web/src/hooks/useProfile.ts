import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useMyNFTs } from "./useReadContract";
import { useListingsView } from "./useListingMarketplace";
import { copyAddress } from "../utils/common";

export const useProfile = () => {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"owned" | "listed">("owned");
  const { listings: profileData } = useMyNFTs();
  const [copied, setCopied] = useState(false);

  // Use the filtering/sorting hook
  const {
    listings: filteredListings,
    images,
    query,
    showActiveOnly,
    sort,
    setQuery,
    setShowActiveOnly,
    setSort,
  } = useListingsView(profileData);

  // Track selected NFT for popup/modal
  const [selectedNFT, setSelectedNFT] = useState<any>(null);

  // Sync the active tab with showActiveOnly (listed tab shows only active listings)
  useEffect(() => {
    setShowActiveOnly(activeTab === "listed");
  }, [activeTab, setShowActiveOnly]);

  // Calculate stats based on all NFTs
  const stats = useMemo(() => {
    const owned = profileData.length;
    const listed = profileData.filter((item) => item.active).length;
    const totalValue = profileData
      .filter((item) => item.active)
      .reduce((sum, item) => sum + Number(item.price) / 1e18, 0);
    const listedPrices = profileData
      .filter((item) => item.active)
      .map((item) => Number(item.price) / 1e18);
    const floorPrice = listedPrices.length > 0 ? Math.min(...listedPrices) : 0;

    return {
      owned,
      listed,
      totalValue: totalValue.toFixed(4),
      floorPrice: floorPrice > 0 ? floorPrice.toFixed(4) : "--",
    };
  }, [profileData]);

  const handleCopy = (address?: string) => {
    if (!address) return;
    copyAddress(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    address,
    isConnected,
    activeTab,
    setActiveTab,
    stats,
    filteredListings,
    query,
    setQuery,
    sort,
    setSort,
    showActiveOnly,
    setShowActiveOnly,
    selectedNFT,
    setSelectedNFT,
    images,
    copied,
    handleCopy,
    profileData,
  };
};
