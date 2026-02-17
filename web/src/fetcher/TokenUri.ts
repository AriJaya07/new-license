import axios from "axios";
import { normalizeIpfs } from "../utils/common";
import { Listing } from "@/src/contracts";

function isDataJson(uri: string) {
  return uri.startsWith("data:application/json");
}

function parseDataJson(uri: string): any | null {
  try {
    if (uri.includes(";base64,")) {
      const base64 = uri.split(";base64,")[1] || "";
      const json = atob(base64);
      return JSON.parse(json);
    }
    const raw = uri.split(",")[1] || "";
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export async function resolveImageFromTokenURI(tokenURI: string): Promise<string | null> {
  try {
    if (!tokenURI) return null;
    const normalized = normalizeIpfs(String(tokenURI));

    // 1. Data URI JSON
    if (isDataJson(normalized)) {
      const metadata = parseDataJson(normalized);
      if (metadata?.image) return normalizeIpfs(String(metadata.image));
      return null;
    }

    // 2. Try metadata JSON at URL (handles no .json extension)
    try {
      const { data: metadata } = await axios.get(normalized);
      if (metadata?.image) return normalizeIpfs(String(metadata.image));
    } catch {
      // ignore - tokenURI might be an image URL
    }

    // 3. Direct image
    return normalized;
  } catch (err) {
    console.error("resolveImageFromTokenURI error:", err);
    return null;
  }
}

export async function fetchTokenImage(listing: Listing): Promise<string | null> {
  try {
    if (!listing?.tokenURI) return null;
    return resolveImageFromTokenURI(listing.tokenURI);
  } catch (err) {
    console.error("fetchTokenImage error:", err);
    return null;
  }
}
