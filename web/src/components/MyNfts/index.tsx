import NFTCard from "@/src/common/UI/NFTCard";
import { User, Copy, CheckCircle, X } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { formatAddress } from "@/src/utils/common";
import { Card } from "@/src/common/UI/Card";
import { useProfile } from "@/src/hooks/useProfile";
import { AddressNotConnect, ModalProfileDetail } from "./common";
import { normalizeIpfs } from "@/src/utils/common";

export default function MyNfts() {
    const { 
        address,
        isConnected,
        activeTab,
        setActiveTab,
        stats,
        filteredListings,
        selectedNFT,
        setSelectedNFT,
        copied,
        handleCopy,
        profileData,
      } = useProfile()

      if (!isConnected) {
        return (
            <AddressNotConnect />
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
                        onClick={() => handleCopy(address)}
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
          items={filteredListings.map((item) => ({
            ...item,
            tokenURI: normalizeIpfs(item.tokenURI),
          }))}
          showOnlyListed={false} // Filter is handled by the hook now
          onSelect={(nft) => setSelectedNFT(nft)}
        />

        {/* Modal Popup */}
        {selectedNFT && (
            <ModalProfileDetail selectedNFT={selectedNFT} setSelectedNFT={setSelectedNFT} />
        )}
      </div>
    </div>
    )
}
