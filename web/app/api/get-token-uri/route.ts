import { NextResponse } from "next/server";
import { ethers } from "ethers";
import axios from "axios";

const ABI = [
  "function tokenURI(uint256 tokenId) view returns (string)"
];

const RPC_URL = process.env.NEXT_PUBLIC_LOCAL_RPC_URL || "http://127.0.0.1:8545";
const METADATA_TIMEOUT = parseInt(process.env.METADATA_TIMEOUT || "15000");

interface TokenResponse {
  tokenURI?: string;
  image?: string | null;
  error?: string;
}

function normalizeIpfs(uri: string): string {
  if (!uri) return uri;
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  }
  return uri;
}

export async function POST(req: Request): Promise<NextResponse<TokenResponse>> {
  try {
    const body = await req.json();

    if (!body?.nftContract || !body?.tokenId) {
      console.error("Missing required fields:", { nftContract: body?.nftContract, tokenId: body?.tokenId });
      return NextResponse.json(
        { error: "Missing nftContract or tokenId" },
        { status: 400 }
      );
    }

    const { nftContract, tokenId } = body;

    // Validate contract address
    if (!ethers.isAddress(nftContract)) {
      console.error("Invalid contract address:", nftContract);
      return NextResponse.json(
        { error: "Invalid contract address" },
        { status: 400 }
      );
    }

    // Initialize provider
    let provider;
    try {
      provider = new ethers.JsonRpcProvider(RPC_URL);
    } catch (err) {
      console.error("Failed to initialize provider:", err);
      return NextResponse.json(
        { error: "Provider initialization failed" },
        { status: 500 }
      );
    }

    const contract = new ethers.Contract(nftContract, ABI, provider);

    // Fetch tokenURI from contract
    let rawTokenURI: string;
    try {
      rawTokenURI = await contract.tokenURI(tokenId);
      console.log("Raw token URI:", rawTokenURI);
    } catch (err) {
      console.error("Contract call failed for tokenId:", tokenId, "Error:", err);
      return NextResponse.json(
        { error: "tokenURI() failed — token probably does not exist" },
        { status: 404 }
      );
    }

    const tokenURI = normalizeIpfs(rawTokenURI);
    console.log("Normalized token URI:", tokenURI);

    // Fetch metadata from tokenURI
    let metadata;
    try {
      console.log(`Fetching metadata from: ${tokenURI}`);
      const res = await axios.get(tokenURI, { timeout: METADATA_TIMEOUT });
      metadata = res.data;
      console.log("Successfully fetched metadata:", metadata);
    } catch (err: any) {
      console.error("Metadata fetch failed:", {
        tokenURI,
        error: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });
      return NextResponse.json(
        { error: `Metadata fetch failed: ${err.message}` },
        { status: 502 }
      );
    }

    // Validate metadata structure
    if (!metadata || typeof metadata !== "object") {
      console.error("Invalid metadata format:", metadata);
      return NextResponse.json(
        { error: "Invalid metadata format" },
        { status: 502 }
      );
    }

    const image = metadata?.image ? normalizeIpfs(metadata.image) : null;

    if (!image) {
      console.warn("No image found in metadata for tokenId:", tokenId);
    }

    return NextResponse.json({
      tokenURI,
      image,
    });
  } catch (err: any) {
    console.error("API fatal error:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
