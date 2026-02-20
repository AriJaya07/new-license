
import { useEffect, useMemo, useState } from "react";
import { useAccount, useBalance, useWriteContract } from "wagmi";
import { ADMIN_WALLET, ADDRESSES, MarketplaceAbi } from "@/src/contracts";
import toast from "react-hot-toast";

export const useAdminBalance = () => {
    const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const isAdmin = useMemo(() => {
    if (!address) return false;
    return address === ADMIN_WALLET;
  }, [address]);

  const [showBlocked, setShowBlocked] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useBalance({
    address: ADDRESSES.marketplace,
  });

  const hasBalance =
    balanceData && typeof balanceData.value === "bigint"
      ? balanceData.value > 0n
      : false;

  useEffect(() => {
    if (isConnected && !isAdmin) {
      setShowBlocked(true);
    } else {
      setShowBlocked(false);
    }
  }, [isConnected, isAdmin]);

  async function handleWithdraw() {
    const loadingToast = toast.loading("Withdrawing fees...");
    try {
      setIsWithdrawing(true);
      await writeContractAsync({
        address: ADDRESSES.marketplace,
        abi: MarketplaceAbi,
        functionName: "withdrawFees",
        args: [],
      });
      toast.success("Withdrawal sent. Check your wallet.", {
        id: loadingToast,
      });
      await refetchBalance();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.shortMessage || e?.message || "Withdrawal failed", {
        id: loadingToast,
      });
    } finally {
      setIsWithdrawing(false);
    }
  }

  return {
    hasBalance,
    isBalanceLoading,
    refetchBalance,
    handleWithdraw,
    isWithdrawing,
    isConnected,
    isAdmin,
    showBlocked,
    address,
    setShowBlocked,
    balanceData 
  }
}

export const useAdminSubmit = () => {
    const { address, isConnected } = useAccount();

    const isAdmin = useMemo(() => {
      if (!address) return false;
      return address === ADMIN_WALLET;
    }, [address]);
  
    const [showBlocked, setShowBlocked] = useState(false);
  
    useEffect(() => {
      if (isConnected && !isAdmin) {
        setShowBlocked(true);
      } else {
        setShowBlocked(false);
      }
    }, [isConnected, isAdmin]);

    return {
        isAdmin,
        showBlocked,
        setShowBlocked,
        address,
        isConnected,
    }
}