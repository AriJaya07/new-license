"use client";

import { Check, CheckCircle2, Copy, Globe, Loader2, Wallet } from "lucide-react";
import { Badge, Input } from "@/src/common/UI/Form";
import { Tooltip } from "@/src/common/UI/Tooltip";
import { Card } from "@/src/common/UI/Card";
import { Button } from "@/src/common/UI/Button";
import { copyAddress, normalizeIpfs, truncateAddress } from "@/src/utils/common";
import { useState } from "react";

type UserNFTProps = {
  isWalletConnected: boolean;
  walletAddress: string;
  network: string;
  isConnecting: boolean;
  tokenId: string;
  setTokenId: (value: string) => void;
  isVerifying: boolean;
  nftVerified: boolean;
  nftData: any;
  price: string;
  setPrice: (value: string) => void;
  marketplaceFee: string;
  sellerReceives: string;
  connectWallet: () => void;
  disconnectWallet: () => void;
  verifyNFT: () => void;
  listTokenId: string;
  setListTokenId: (value: string) => void;
  listNFT: () => void;
};

export default function UserNFT({
  isWalletConnected,
  walletAddress,
  network,
  isConnecting,
  tokenId,
  setTokenId,
  isVerifying,
  nftVerified,
  nftData,
  price,
  setPrice,
  marketplaceFee,
  sellerReceives,
  connectWallet,
  disconnectWallet,
  verifyNFT,
  listTokenId,
  setListTokenId,
  listNFT,
}: UserNFTProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (address: string) => {
    const ok: any = copyAddress(address);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="space-y-10">
      {/* ================= WALLET ================= */}
      <Card className="border-2 shadow-lg p-6 space-y-6">
        <header className="flex justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <Wallet className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold">Wallet</h2>
              <p className="text-sm text-muted-foreground">Step 1</p>
            </div>
          </div>

          {isWalletConnected && (
            <Badge className="bg-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
        </header>

        {!isWalletConnected ? (
          <Button onClick={connectWallet} disabled={isConnecting} className="w-full">
            {isConnecting ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Connecting
              </>
            ) : (
              "Connect Wallet"
            )}
          </Button>
        ) : (
          <div className="bg-muted/40 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center">
            <span className="font-mono">{truncateAddress(walletAddress)}</span>

            <Tooltip content="Copy">
              <button onClick={() => handleCopy(walletAddress)}>
                {copied ? <Check className="text-emerald-500" /> : <Copy />}
              </button>
            </Tooltip>

            <div className="flex-1" />

            <span className="flex items-center gap-1 text-sm">
              <Globe className="w-3 h-3" /> {network}
            </span>

            <Button variant="outline" onClick={disconnectWallet}>
              Disconnect
            </Button>
          </div>
        )}
      </Card>

      {/* ================= VERIFY ================= */}
      <Card
        className={`border-2 shadow-lg p-6 space-y-6 ${
          !isWalletConnected && "opacity-50 pointer-events-none"
        }`}
      >
        <header>
          <h2 className="font-semibold">Verify NFT</h2>
          <p className="text-sm text-muted-foreground">Step 2</p>
        </header>

        <Input
          placeholder="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          disabled={nftVerified}
        />

        {!nftVerified && (
          <Button onClick={verifyNFT} disabled={!tokenId || isVerifying} className="w-full">
            {isVerifying ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Verifying
              </>
            ) : (
              "Verify Ownership"
            )}
          </Button>
        )}

        {nftVerified && nftData && (
          <div className="flex flex-col items-center gap-4">
            <img src={normalizeIpfs(nftData.image)} className="w-40 h-40 rounded-xl shadow" />
            <p className="font-semibold">{nftData.name}</p>
          </div>
        )}
      </Card>

      {/* ================= LIST ================= */}
      {nftVerified && (
        <Card className="border-2 shadow-lg p-6 space-y-6">
          <header>
            <h2 className="font-semibold">List NFT</h2>
            <p className="text-sm text-muted-foreground">Step 3</p>
          </header>

          <Input
            placeholder="Token ID"
            value={listTokenId}
            onChange={(e) => setListTokenId(e.target.value)}
          />

          <Input
            placeholder="Price (ETH)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <div className="bg-muted/40 rounded-xl p-4">
            <div className="flex justify-between text-sm">
              <span>Marketplace Fee</span>
              <span>-{marketplaceFee} ETH</span>
            </div>

            <div className="flex justify-between font-semibold mt-2">
              <span>You Receive</span>
              <span className="text-emerald-500">{sellerReceives} ETH</span>
            </div>
          </div>

          <Button
            onClick={listNFT}
            disabled={!price || !listTokenId}
            className="w-full bg-indigo-600 text-white"
          >
            List NFT
          </Button>
        </Card>
      )}
    </div>
  );
}
