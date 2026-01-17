import { ADDRESSES, MyNFTAbi } from "@/src/contracts";
import { useState } from "react";
import { Address, isAddress } from "viem";
import { useWriteContract } from "wagmi";
import toast, { Toaster } from "react-hot-toast";

export default function useAdmin() {
    const { writeContractAsync } = useWriteContract();
    const [to, setTo] = useState("");
    const [uri, setUri] = useState("");
    const [isMinting, setIsMinting] = useState(false);
  
    async function mint() {
      if (!isAddress(to)) return toast.error("Invalid address");
      if (!uri) return toast.error("Empty URI");
  
      const loadingToast = toast.loading("Minting on-chain...");
  
      try {
        setIsMinting(true);
  
        await writeContractAsync({
          address: ADDRESSES.myNFT,
          abi: MyNFTAbi,
          functionName: "mint",
          args: [to as Address, uri],
        });
  
        toast.success("Mint sent! Check your wallet / explorer.", {
          id: loadingToast,
        });
        setTo("");
        setUri("");
      } catch (e: any) {
        console.error(e);
        toast.error(e?.shortMessage || e?.message || "Mint failed", {
          id: loadingToast,
        });
      } finally {
        setIsMinting(false);
      }
    }

    return {
        to, 
        setTo,
        uri, 
        setUri, 
        mint, 
        isMinting 
    }
}