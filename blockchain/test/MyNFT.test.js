// test/MyNFT.test.js
import { expect } from "chai";
import hre from "hardhat";

describe("MyNFT", function () {
  let myNFT;
  let owner;
  let addr1;
  let addr2;

  // Helper: extract minted tokenId from Transfer event
  async function getMintedTokenId(tx) {
    const receipt = await tx.wait();
    const zero = hre.ethers.ZeroAddress.toLowerCase();

    for (const log of receipt.logs) {
      try {
        const parsed = myNFT.interface.parseLog(log);
        if (
          parsed.name === "Transfer" &&
          parsed.args.from.toLowerCase() === zero
        ) {
          return parsed.args.tokenId;
        }
      } catch {}
    }
    throw new Error("Minted tokenId not found");
  }

  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    const MyNFT = await hre.ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy();
    await myNFT.waitForDeployment();
  });

  /* ================= DEPLOYMENT ================= */

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await myNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await myNFT.name()).to.equal("MyNFT");
      expect(await myNFT.symbol()).to.equal("MNFT");
    });

    it("Should start tokenCounter at 0", async function () {
      expect(await myNFT.tokenCounter()).to.equal(0);
    });
  });

  /* ================= MINTING ================= */

  describe("Minting", function () {
    it("Should mint NFT successfully (first tokenId = 1)", async function () {
      const tx = await myNFT.mint(owner.address, "QmTest123");
      const tokenId = await getMintedTokenId(tx);

      expect(tokenId).to.equal(1);
      expect(await myNFT.ownerOf(tokenId)).to.equal(owner.address);
    });

    it("Should mint to specified address", async function () {
      const tx = await myNFT.mint(addr1.address, "QmTest456");
      const tokenId = await getMintedTokenId(tx);

      expect(await myNFT.ownerOf(tokenId)).to.equal(addr1.address);
    });

    it("Should fail if non-owner tries to mint", async function () {
      await expect(
        myNFT.connect(addr1).mint(addr1.address, "QmTest")
      ).to.be.reverted;
    });

    it("Should mint multiple NFTs with incrementing IDs", async function () {
      const id1 = await getMintedTokenId(await myNFT.mint(owner.address, "A"));
      const id2 = await getMintedTokenId(await myNFT.mint(addr1.address, "B"));
      const id3 = await getMintedTokenId(await myNFT.mint(addr2.address, "C"));

      expect(id1).to.equal(1);
      expect(id2).to.equal(2);
      expect(id3).to.equal(3);
    });

    it("Should fail to mint to zero address", async function () {
      await expect(
        myNFT.mint(hre.ethers.ZeroAddress, "QmTest")
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("Should fail to mint with empty URI", async function () {
      await expect(
        myNFT.mint(owner.address, "")
      ).to.be.revertedWith("Token URI cannot be empty");
    });
  });

  /* ================= BATCH MINT ================= */

  describe("Batch Minting", function () {
    it("Should batch mint multiple NFTs", async function () {
      const tx = await myNFT.batchMint(addr1.address, ["A", "B", "C"]);
      const receipt = await tx.wait();

      const minted = receipt.logs
        .map(l => {
          try {
            return myNFT.interface.parseLog(l);
          } catch {
            return null;
          }
        })
        .filter(e => e && e.name === "Transfer")
        .map(e => e.args.tokenId);

      expect(minted.length).to.equal(3);
      expect(minted[1]).to.equal(minted[0] + 1n);
      expect(minted[2]).to.equal(minted[1] + 1n);
    });

    it("Should fail batch mint with empty array", async function () {
      await expect(
        myNFT.batchMint(addr1.address, [])
      ).to.be.revertedWith("Must mint at least one NFT");
    });

    it("Should fail batch mint with too many NFTs", async function () {
      await expect(
        myNFT.batchMint(addr1.address, new Array(51).fill("X"))
      ).to.be.revertedWith("Cannot mint more than 50 NFTs at once");
    });
  });

  /* ================= TOKEN URI ================= */

  describe("Token URI", function () {
    it("Should return correct token URI", async function () {
      const tx = await myNFT.mint(owner.address, "QmHash");
      const id = await getMintedTokenId(tx);

      expect(await myNFT.tokenURI(id))
        .to.equal("https://gateway.pinata.cloud/ipfs/QmHash");
    });

    it("Should fail for non-existent token", async function () {
      await expect(myNFT.tokenURI(999)).to.be.reverted;
    });
  });

  /* ================= HELPERS ================= */

  describe("Helper Functions", function () {
    it("Should return correct total supply", async function () {
      await myNFT.mint(owner.address, "A");
      await myNFT.mint(addr1.address, "B");

      expect(await myNFT.totalSupply()).to.equal(2);
    });

    it("Should check if token exists", async function () {
      const id = await getMintedTokenId(await myNFT.mint(owner.address, "A"));

      // Check token existence using ownerOf (ERC721 standard way)
      expect(await myNFT.ownerOf(id)).to.not.equal(hre.ethers.ZeroAddress);

      // Non-existent token check
      expect(await myNFT.exists(999)).to.equal(false);
    });
  });

  /* ================= BURNING ================= */

  describe("Burning", function () {
    it("Should allow token owner to burn", async function () {
      const id = await getMintedTokenId(await myNFT.mint(addr1.address, "A"));

      await expect(myNFT.connect(addr1).burn(id))
        .to.emit(myNFT, "Transfer")
        .withArgs(addr1.address, hre.ethers.ZeroAddress, id);

      await expect(myNFT.ownerOf(id)).to.be.reverted;
    });

    it("Should fail if non-owner burns", async function () {
      const id = await getMintedTokenId(await myNFT.mint(addr1.address, "A"));

      await expect(
        myNFT.connect(addr2).burn(id)
      ).to.be.revertedWith("Only token owner can burn");
    });
  });
});
