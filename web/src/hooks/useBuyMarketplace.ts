import { useWriteContract } from "wagmi";
import { Address, ADDRESSES, MarketplaceAbi } from "../contracts";

export function useBuyMarketplace() {
  const { writeContractAsync, isPending } = useWriteContract();

  const buyMarketplace = async (listingId: bigint, price: bigint) => {
    return writeContractAsync({
      address: ADDRESSES.marketplace as Address,
      abi: MarketplaceAbi,
      functionName: "buyNFT",
      args: [listingId],
      value: price,
    });
  };

  return {
    buyMarketplace,
    isPending,
  };
}
