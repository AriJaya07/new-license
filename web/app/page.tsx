"use client";

import Homepage from "@/src/components/Homepage";
import { RolePopup } from "@/src/components/RolePopup";
import { ADMIN_WALLET } from "@/src/contracts";
import { useHomepage } from "@/src/hooks/useHomepage";

export default function GuestHomePage() {
  const {
    totalSupply,
    openRolePopup,
    isMetaMaskAlertOpen,
    handleInstallMetaMask,
    handleConnectMetaMask,
    address,
    isRolePopupOpen,
    closeRolePopup,
  } = useHomepage();

  return (
    <main>
      <Homepage totalSupply={totalSupply} setIsCreateNFT={openRolePopup} />

      {/* MetaMask installation or connection alert */}
      {isMetaMaskAlertOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center">
            <h2 className="text-xl font-semibold text-zinc-900">MetaMask Required</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Please install MetaMask to proceed with the application.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                onClick={handleInstallMetaMask}
              >
                Install MetaMask
              </button>
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                onClick={handleConnectMetaMask}
              >
                Connect MetaMask
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Popup */}
      <RolePopup
        walletAddress={address}
        adminAddress={ADMIN_WALLET}
        isOpen={isRolePopupOpen}
        onClose={closeRolePopup}
      />
    </main>
  );
}
