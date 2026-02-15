"use client";

import { useAccount } from "wagmi";
import { useState, useMemo, useEffect } from "react";
import NFTCard from "@/src/common/UI/NFTCard";
import { User, Wallet, Copy, CheckCircle, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useMyNFTs } from "@/src/hooks/useReadContract";
import { formatAddress } from "@/src/utils/common";
import { Card } from "@/src/common/UI/Card";
import { useListingsView } from "@/src/hooks/useListingMarketplace";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"owned" | "listed">("owned");
  const { listings: profileData } = useMyNFTs();

  // Use the filter hook
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

  // State to track selected NFT for popup
  const [selectedNFT, setSelectedNFT] = useState<any>(null);

  // Sync tab with showActiveOnly
  useEffect(() => {
    setShowActiveOnly(activeTab === "listed");
  }, [activeTab, setShowActiveOnly]);

  // Calculate stats from original data (not filtered)
  const stats = useMemo(() => {
    const owned = profileData.length;
    const listed = profileData.filter((item) => item.active).length;
    const totalValue = profileData
      .filter((item) => item.active)
      .reduce((sum, item) => sum + Number(item.price) / 1e18, 0);
    const listedPrices = profileData
      .filter((item) => item.active)
      .map((item) => Number(item.price) / 1e18);
    const floorPrice = listedPrices.length > 0 
      ? Math.min(...listedPrices) 
      : 0;

    return {
      owned,
      listed,
      totalValue: totalValue.toFixed(4),
      floorPrice: floorPrice > 0 ? floorPrice.toFixed(4) : "--",
    };
  }, [profileData]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="p-12 text-center max-w-md">
          <Wallet size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Please connect your wallet to view your profile and NFT collection.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
              <div className="flex items-end gap-6">
                <div className="bg-gradient-to-br from-primary-500 to-purple-600 w-32 h-32 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center">
                  <User className="text-white" size={64} />
                </div>
                <div className="pb-2">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-mono">
                      {formatAddress(address)}
                    </code>
                    <button
                      onClick={copyAddress}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <CheckCircle size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} className="text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">NFTs Owned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.owned}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">NFTs Listed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.listed}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Total Listed Value</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalValue} ETH</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Floor Price</p>
                <p className="text-2xl font-bold text-gray-900">{stats.floorPrice} ETH</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("owned")}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === "owned" ? "text-primary-600" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Owned ({stats.owned})
            {activeTab === "owned" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>}
          </button>
          <button
            onClick={() => setActiveTab("listed")}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === "listed" ? "text-primary-600" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Listed ({stats.listed})
            {activeTab === "listed" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>}
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredListings.length} of {profileData.length} NFTs
        </div>

        {/* NFT Grid - Now using filtered data */}
        <NFTCard
          items={filteredListings}
          showOnlyListed={false} // Filter is handled by the hook now
          onSelect={(nft) => setSelectedNFT(nft)}
        />

        {/* Modal Popup */}
        {selectedNFT && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
              <button
                onClick={() => setSelectedNFT(null)}
                className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} />
              </button>

              <img
                src={selectedNFT.tokenURI}
                alt={`NFT #${selectedNFT.tokenId}`}
                className="w-full h-64 object-cover rounded-xl mb-4"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23ddd" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="sans-serif">No Image</text></svg>';
                }}
              />

              <h2 className="text-xl font-bold mb-2">NFT #{selectedNFT.tokenId}</h2>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">Contract:</span>{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {selectedNFT.nftContract.slice(0, 6)}...{selectedNFT.nftContract.slice(-4)}
                  </code>
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Token ID:</span> {selectedNFT.tokenId}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Price:</span>{" "}
                  <span className="text-lg font-bold text-primary-600">
                    {(Number(selectedNFT.price) / 1e18).toFixed(4)} ETH
                  </span>
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Status:</span>{" "}
                  <span className={`font-semibold ${selectedNFT.active ? "text-green-600" : "text-gray-500"}`}>
                    {selectedNFT.active ? "Listed" : "Unlisted"}
                  </span>
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Seller:</span>{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {selectedNFT.seller.slice(0, 6)}...{selectedNFT.seller.slice(-4)}
                  </code>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}