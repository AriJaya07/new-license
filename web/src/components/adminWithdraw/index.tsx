"use client";

import { ADMIN_WALLET, ADDRESSES } from "@/src/contracts";
import { Card } from "@/src/common/UI/Card";
import NotAdmin from "@/src/components/AdminSubmit/NotAdmin";
import { Toaster } from "react-hot-toast";
import {
  Shield,
  Wallet,
  Banknote,
  RefreshCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAdminBalance } from "@/src/hooks/useAdminBalance";

export default function AdminWithdraw() {
  const {
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
    balanceData,
  } = useAdminBalance();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 px-4">
        <Card className="max-w-md w-full p-8 text-center shadow-xl border border-gray-200">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <Shield className="text-white" size={26} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Only</h1>
          <p className="mt-2 text-gray-600">Please connect your wallet to check admin access.</p>
          <div className="mt-6 text-xs text-gray-500">
            ADMIN_WALLET: <span className="break-all">{ADMIN_WALLET}</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <NotAdmin
        showBlocked={showBlocked}
        address={address}
        setShowBlocked={setShowBlocked}
        adminWallet={ADMIN_WALLET}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
      <Toaster position="top-right" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 shadow-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-primary-500 to-purple-600 p-3 rounded-2xl">
              <Banknote className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketplace Fees</h1>
              <p className="text-gray-600 text-sm">
                View contract balance and withdraw accumulated fees.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Contract</p>
              <p className="font-semibold text-gray-900 break-all">{ADDRESSES.marketplace}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Admin Wallet</p>
              <p className="font-semibold text-gray-900 break-all">{address?.toLowerCase()}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Status</p>
              <div className="flex items-center gap-2">
                {hasBalance ? (
                  <>
                    <CheckCircle2 className="text-green-600" size={18} />
                    <span className="font-semibold text-green-700">Fees available</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="text-amber-600" size={18} />
                    <span className="font-semibold text-amber-700">No fees yet</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm text-gray-600">Contract Balance</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isBalanceLoading ? (
                    <span className="inline-flex items-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      Loading...
                    </span>
                  ) : (
                    <>
                      {balanceData?.formatted ?? "0"} {balanceData?.symbol ?? "ETH"}
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  This is the accumulated marketplace fee held by the contract.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => refetchBalance()}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  <RefreshCcw size={16} />
                  Refresh
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || !hasBalance}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition
                    ${
                      isWithdrawing || !hasBalance
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                        : "bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
                    }`}
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Withdrawing...
                    </>
                  ) : (
                    <>
                      <Wallet size={16} />
                      Withdraw Fees
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
