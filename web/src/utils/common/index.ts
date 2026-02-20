import { clsx, type ClassValue } from "clsx";
import { FormatPriceOptions } from "../type";

export function formatAddress(
  address?: string | null,
  options?: {
    start?: number;
    end?: number;
    separator?: string;
  }
): string {
  if (!address || typeof address !== "string") return "";

  const { start = 4, end = 4, separator = "…" } = options ?? {};

  const trimmed = address.trim();

  // If address is already short or malformed, return as-is
  if (trimmed.length <= start + end) {
    return trimmed;
  }

  return `${trimmed.slice(0, start)}${separator}${trimmed.slice(-end)}`;
}

export function formatPrice(
  value?: number | string | bigint | null,
  options?: FormatPriceOptions
): string {
  const { decimals = 4, symbol = "ETH", fallback = "—" } = options ?? {};

  if (value === null || value === undefined) return fallback;

  const num =
    typeof value === "bigint" ? Number(value) : typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(num)) return fallback;

  // Trim trailing zeros (e.g. 1.5000 → 1.5)
  const formatted = num.toFixed(decimals).replace(/\.?0+$/, "");

  return `${formatted} ${symbol}`;
}

export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

export const normalizeIpfs = (uri: string) => {
  if (!uri) return uri;

  let trimmed = uri.trim();

  // unwrap: /ipfs/https:/example.com
  const ipfsHttpMatch = trimmed.match(/\/ipfs\/(https?:.*)$/);
  if (ipfsHttpMatch?.[1]) {
    trimmed = ipfsHttpMatch[1];
  }

  // fix broken protocols like https:/ or https:///
  trimmed = trimmed.replace(/^https?:\/+/, (m) => (m.startsWith("https") ? "https://" : "http://"));

  // already valid http(s)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // ipfs://CID
  if (trimmed.startsWith("ipfs://")) {
    return IPFS_GATEWAY + trimmed.replace("ipfs://", "");
  }

  // raw CID
  return IPFS_GATEWAY + trimmed;
};

export const truncateAddress = (address: string) => {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
};

export const copyAddress = async (walletAddress: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(walletAddress);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
};

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function toBigIntSafe(v: string): bigint {
  const n = v.trim();
  if (!n) return 0n;
  return BigInt(n);
}
