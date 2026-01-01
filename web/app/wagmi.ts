import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!projectId) throw new Error("Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID");

export const wagmiConfig = getDefaultConfig({
  appName: "Digital License Marketplace",
  projectId,
  chains: [hardhat, sepolia],
  ssr: true,
  transports: {
    [hardhat.id]: http(process.env.NEXT_PUBLIC_LOCAL_RPC_URL),
    ...(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL
      ? { [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL) }
      : { [sepolia.id]: http() }),
  },
});
