import { Card } from "@/src/common/UI/Card";
import { NFT } from "@/src/common/UI/NFTCard";
import { Wallet, X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

type ModalProfileDetailProps = {
  selectedNFT: NFT;
  setSelectedNFT: Dispatch<SetStateAction<NFT | null>>;
};

export const AddressNotConnect = () => {
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
};
export const ModalProfileDetail = ({ selectedNFT, setSelectedNFT }: ModalProfileDetailProps) => {
  if (!selectedNFT) return null; // safety check

  return (
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
            e.currentTarget.src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23ddd" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="sans-serif">No Image</text></svg>';
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
            <span
              className={`font-semibold ${selectedNFT.active ? "text-green-600" : "text-gray-500"}`}
            >
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
  );
};
