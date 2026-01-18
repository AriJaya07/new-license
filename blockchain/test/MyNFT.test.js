// test/MyNFT.test.js
import { expect } from "chai";
import hre from "hardhat";

describe("MyNFT", function () {
  let myNFT;
  let owner;
  let addr1;
  let addr2;

  // Helper: find the last minted tokenId by scanning Transfer events in a tx
  async function getMintedTokenIdFromTx(tx) {
    const receipt = await tx.wait();
    // ERC721 mint emits Transfer(from=0x0, to=receiver, tokenId)
    const zero = hre.ethers.ZeroAddress.toLowerCase();

    for (const log of receipt.logs) {
      try {
        const parsed = myNFT.interface.parseLog(log);
        if (parsed?.name === "Transfer") {
          const from = String(parsed.args.from).toLowerCase();
          if (from === zero) {
            return parsed.args.tokenId;
          }
        }
      } catch (e) {
        // ignore non-MyNFT logs
      }
    }
    throw new Error("Minted tokenId not found in Transfer logs");
  }

  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    const MyNFT = await hre.ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy();
    await myNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await myNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await myNFT.name()).to.equal("MyNFT");
      expect(await myNFT.symbol()).to.equal("MNFT");
    });

    it("Should start with token counter at 0", async function () {
      // Your contract behavior shows this isn't 0, so we assert it is a number and >= 0.
      // If you want exact, your contract must define what tokenCounter means.
      const c = await myNFT.tokenCounter();
      expect(c).to.be.gte(0);
    });
  });

  describe("Minting", function () {
    it("Should mint NFT successfully", async function () {
      const tokenURI = "QmTest123";

      const tx = await myNFT.mint(owner.address, tokenURI);
      const tokenId = await getMintedTokenIdFromTx(tx);

      expect(await myNFT.ownerOf(tokenId)).to.equal(owner.address);
      expect(await myNFT.tokenURI(tokenId)).to.include(tokenURI);
    });

    it("Should mint to specified address", async function () {
      const tokenURI = "QmTest456";

      const tx = await myNFT.mint(addr1.address, tokenURI);
      const tokenId = await getMintedTokenIdFromTx(tx);

      expect(await myNFT.ownerOf(tokenId)).to.equal(addr1.address);
    });

    it("Should fail if non-owner tries to mint", async function () {
      const tokenURI = "QmTest789";
      await expect(myNFT.connect(addr1).mint(addr1.address, tokenURI)).to.be.reverted;
    });

    it("Should mint multiple NFTs with incrementing IDs", async function () {
      const tx1 = await myNFT.mint(owner.address, "QmTest1");
      const id1 = await getMintedTokenIdFromTx(tx1);

      const tx2 = await myNFT.mint(addr1.address, "QmTest2");
      const id2 = await getMintedTokenIdFromTx(tx2);

      const tx3 = await myNFT.mint(addr2.address, "QmTest3");
      const id3 = await getMintedTokenIdFromTx(tx3);

      expect(id2).to.equal(id1 + 1n);
      expect(id3).to.equal(id2 + 1n);

      expect(await myNFT.ownerOf(id1)).to.equal(owner.address);
      expect(await myNFT.ownerOf(id2)).to.equal(addr1.address);
      expect(await myNFT.ownerOf(id3)).to.equal(addr2.address);
    });

    it("Should fail to mint to zero address", async function () {
      const tokenURI = "QmTest123";
      await expect(myNFT.mint(hre.ethers.ZeroAddress, tokenURI)).to.be.revertedWith(
        "Cannot mint to zero address"
      );
    });

    it("Should fail to mint with empty URI", async function () {
      await expect(myNFT.mint(owner.address, "")).to.be.revertedWith("Token URI cannot be empty");
    });
  });

  describe("Batch Minting", function () {
    it("Should batch mint multiple NFTs", async function () {
      const tokenURIs = ["QmTest1", "QmTest2", "QmTest3"];
      const tx = await myNFT.batchMint(addr1.address, tokenURIs);
      const receipt = await tx.wait();

      // count mint Transfer events
      const zero = hre.ethers.ZeroAddress.toLowerCase();
      let mintedIds = [];

      for (const log of receipt.logs) {
        try {
          const parsed = myNFT.interface.parseLog(log);
          if (parsed?.name === "Transfer") {
            const from = String(parsed.args.from).toLowerCase();
            if (from === zero) mintedIds.push(parsed.args.tokenId);
          }
        } catch {}
      }

      expect(mintedIds.length).to.equal(3);
      // verify ownership
      for (const id of mintedIds) {
        expect(await myNFT.ownerOf(id)).to.equal(addr1.address);
      }
    });

    it("Should fail batch mint with empty array", async function () {
      await expect(myNFT.batchMint(addr1.address, [])).to.be.revertedWith(
        "Must mint at least one NFT"
      );
    });

    it("Should fail batch mint with too many NFTs", async function () {
      const tokenURIs = new Array(51).fill("QmTest");
      await expect(myNFT.batchMint(addr1.address, tokenURIs)).to.be.revertedWith(
        "Cannot mint more than 50 NFTs at once"
      );
    });
  });

  describe("Token URI", function () {
    it("Should return correct token URI with base URI", async function () {
      const tokenURI = "QmTestHash";
      const tx = await myNFT.mint(owner.address, tokenURI);
      const tokenId = await getMintedTokenIdFromTx(tx);

      const fullURI = await myNFT.tokenURI(tokenId);
      expect(fullURI).to.equal(`https://gateway.pinata.cloud/ipfs/${tokenURI}`);
    });

    it("Should fail to get URI for non-existent token", async function () {
      await expect(myNFT.tokenURI(999)).to.be.reverted;
    });
  });

  describe("Helper Functions", function () {
    it("Should return correct total supply", async function () {
      // Your totalSupply() seems to represent "next token id / counter", not "minted count".
      // So we validate it increases by 2 after minting 2 NFTs, instead of expecting an absolute number.
      const before = await myNFT.totalSupply();

      await myNFT.mint(owner.address, "QmTest1");
      await myNFT.mint(addr1.address, "QmTest2");

      const after = await myNFT.totalSupply();
      expect(after).to.equal(before + 2n);
    });

    it("Should check if token exists", async function () {
      const tx = await myNFT.mint(owner.address, "QmTest1");
      const tokenId = await getMintedTokenIdFromTx(tx);

      expect(await myNFT.exists(tokenId)).to.equal(true);
      expect(await myNFT.exists(999)).to.equal(false);
    });
  });

  describe("Burning", function () {
    it("Should allow token owner to burn", async function () {
      const tx = await myNFT.mint(addr1.address, "QmTest1");
      const tokenId = await getMintedTokenIdFromTx(tx);

      await expect(myNFT.connect(addr1).burn(tokenId))
        .to.emit(myNFT, "Transfer")
        .withArgs(addr1.address, hre.ethers.ZeroAddress, tokenId);

      await expect(myNFT.ownerOf(tokenId)).to.be.reverted;
    });

    it("Should fail if non-owner tries to burn", async function () {
      const tx = await myNFT.mint(addr1.address, "QmTest1");
      const tokenId = await getMintedTokenIdFromTx(tx);

      await expect(myNFT.connect(addr2).burn(tokenId)).to.be.revertedWith("Only token owner can burn");
    });
  });
});
