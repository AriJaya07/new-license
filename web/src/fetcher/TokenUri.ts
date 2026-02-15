import axios from "axios";
import { normalizeIpfs } from "../utils/common";
import { Listing } from "@/src/contracts";

export async function fetchTokenImage(listing: Listing): Promise<string | null> {
  try {
    const tokenId = listing.tokenId.toString();

    // 1. Fetch tokenURI
    const { data: result } = await axios.post("/api/get-token-uri", {
      nftContract: listing.nftContract,
      tokenId,
    });

    if (!result?.tokenURI) return null;

    const tokenURI = normalizeIpfs(result.tokenURI);

    // 2. If metadata JSON, fetch metadata
    if (tokenURI.includes(".json")) {
      const { data: metadata } = await axios.get(tokenURI);

      if (!metadata?.image) return null;
      return normalizeIpfs(String(metadata.image));
    }

    // 3. Direct image
    return tokenURI;
  } catch (err) {
    console.error("fetchTokenImage error:", err);
    return null;
  }
}
