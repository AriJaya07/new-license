import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useMyNFTRead } from "./useReadContract";
import { useCallback, useEffect, useState } from "react";

export const useHomepage = () => {
    const { totalSupply } = useMyNFTRead();
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect(); 
    const { disconnect } = useDisconnect(); 
    const [isRolePopupOpen, setIsRolePopupOpen] = useState(false);
    const [isMetaMaskAlertOpen, setIsMetaMaskAlertOpen] = useState(false);
  
    const openRolePopup = useCallback(() => {
      if (!isConnected || !address) return;
      setIsRolePopupOpen(true);
    }, [isConnected, address]);
  
    const closeRolePopup = useCallback(() => {
      setIsRolePopupOpen(false);
    }, []);
  
    // Close the role popup if user disconnects
    useEffect(() => {
      if (!isConnected) setIsRolePopupOpen(false);
    }, [isConnected]);
  
    // MetaMask detection and connection logic
    useEffect(() => {
      if (!isConnected) {
        if (window.ethereum) {
          // MetaMask is installed, try to connect
          const connectWallet = async () => {
            try {
              await connect({ connector: connectors[0] }); // Attempt connection
            } catch (error: unknown) {
              // TypeScript now knows that 'error' is an unknown type
              if (error instanceof Error) {
                console.error("MetaMask connection failed", error.message);
              } else {
                console.error("Unknown error occurred during connection");
              }
              setIsMetaMaskAlertOpen(true); // Show alert if failed to connect
            }
          };
          connectWallet();
        } else {
          // Show alert if MetaMask is not installed
          setIsMetaMaskAlertOpen(true);
        }
      }
    }, [isConnected, connect, connectors]);
  
    // Handle MetaMask installation
    const handleInstallMetaMask = () => {
      window.open("https://metamask.io/download.html", "_blank");
      setIsMetaMaskAlertOpen(false); // Close the alert after action
    };
  
    const handleConnectMetaMask = () => {
      if (window.ethereum) {
        window.ethereum
          .request({ method: "eth_requestAccounts" })
          .then(() => {
            setIsMetaMaskAlertOpen(false); // Close the alert if connected
          })
          .catch((error: unknown) => {
            // Handle error if the user denies the connection
            if (error instanceof Error) {
              console.error("MetaMask connection failed", error.message);
            } else {
              console.error("Unknown error occurred during MetaMask connection");
            }
          });
      }
    };

    return {
      address, 
      totalSupply,
      disconnect,
      openRolePopup,
      closeRolePopup,
      isRolePopupOpen,
      isMetaMaskAlertOpen,
      handleInstallMetaMask,
      handleConnectMetaMask,
    };
}
