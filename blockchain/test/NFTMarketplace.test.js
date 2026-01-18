// test/NFTMarketplace.test.js
import { expect } from "chai";
import hre from "hardhat";

describe("NFTMarketplace", function () {
  let marketplace;
  let nft;
  let owner;
  let seller;
  let buyer;
  let addr1;

  async function getMintedTokenIdFromTx(tx, contract) {
    const receipt = await tx.wait();
    const zero = hre.ethers.ZeroAddress.toLowerCase();

    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed?.name === "Transfer") {
          const from = String(parsed.args.from).toLowerCase();
          if (from === zero) return parsed.args.tokenId;
        }
      } catch {}
    }
    throw new Error("Minted tokenId not found in Transfer logs");
  }

  beforeEach(async function () {
    [owner, seller, buyer, addr1] = await hre.ethers.getSigners();

    // Deploy NFT contract
    const MyNFT = await hre.ethers.getContractFactory("MyNFT");
    nft = await MyNFT.deploy();
    await nft.waitForDeployment();

    // Deploy Marketplace contract
    const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
    marketplace = await NFTMarketplace.deploy();
    await marketplace.waitForDeployment();

    // Mint one NFT to seller and capture the real tokenId
    const mintTx = await nft.connect(owner).mint(seller.address, "QmTestHash");
    const tokenId = await getMintedTokenIdFromTx(mintTx, nft);
    // store on contract instance for tests
    nft.__tokenId = tokenId;
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await marketplace.owner()).to.equal(owner.address);
    });

    it("Should set initial marketplace fee to 2.5%", async function () {
      expect(await marketplace.marketplaceFee()).to.equal(250);
      expect(await marketplace.getMarketplaceFee()).to.equal(250);
    });

    it("Should start listing counter at 1 (first listingId = 1)", async function () {
      const price = hre.ethers.parseEther("1");
      const tokenId = nft.__tokenId;

      await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);

      await marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId, price);

      const listing = await marketplace.getListing(1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.active).to.equal(true);
    });
  });

  describe("Listing NFTs", function () {
    it("Should list NFT successfully", async function () {
      const price = hre.ethers.parseEther("1");
      const tokenId = nft.__tokenId;

      await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);

      await expect(
        marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId, price)
      )
        .to.emit(marketplace, "NFTListed")
        .withArgs(1, await nft.getAddress(), tokenId, seller.address, price);

      const listing = await marketplace.getListing(1);
      expect(listing.nftContract).to.equal(await nft.getAddress());
      expect(listing.tokenId).to.equal(tokenId);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(price);
      expect(listing.active).to.equal(true);

      const listingIdFromMap = await marketplace.nftToListing(await nft.getAddress(), tokenId);
      expect(listingIdFromMap).to.equal(1);
    });

    it("Should list successfully with setApprovalForAll instead of approve", async function () {
      const price = hre.ethers.parseEther("1");
      const tokenId = nft.__tokenId;

      await nft.connect(seller).setApprovalForAll(await marketplace.getAddress(), true);

      await expect(
        marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId, price)
      )
        .to.emit(marketplace, "NFTListed")
        .withArgs(1, await nft.getAddress(), tokenId, seller.address, price);

      expect(await marketplace.isNFTListed(await nft.getAddress(), tokenId)).to.equal(true);
    });

    it("Should fail if not the owner", async function () {
      const price = hre.ethers.parseEther("1");
      const tokenId = nft.__tokenId;

      await expect(
        marketplace.connect(buyer).listNFT(await nft.getAddress(), tokenId, price)
      ).to.be.revertedWith("Not the owner");
    });

    it("Should fail if marketplace not approved", async function () {
      const price = hre.ethers.parseEther("1");
      const tokenId = nft.__tokenId;

      await expect(
        marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId, price)
      ).to.be.revertedWith("Marketplace not approved");
    });

    it("Should fail if price is zero", async function () {
      const tokenId = nft.__tokenId;

      await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);

      await expect(
        marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId, 0)
      ).to.be.revertedWith("Price must be greater than 0");
    });

    it("Should fail if NFT already listed", async function () {
      const price = hre.ethers.parseEther("1");
      const tokenId = nft.__tokenId;

      await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId, price);

      await expect(
        marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId, price)
      ).to.be.revertedWith("NFT already listed");
    });

    it("Should clear mapping when listing is cancelled, allowing relist", async function () {
      const price = hre.ethers.parseEther("1");
      const tokenId = nft.__tokenId;

      await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId, price);

      await marketplace.connect(seller).cancelListing(1);

      expect(await marketplace.isNFTListed(await nft.getAddress(), tokenId)).to.equal(false);

      await expect(
        marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId, price)
      )
        .to.emit(marketplace, "NFTListed")
        .withArgs(2, await nft.getAddress(), tokenId, seller.address, price);
    });
  });

  describe("Buying NFTs", function () {
    beforeEach(async function () {
      const price = hre.ethers.parseEther("1");
      const tokenId = nft.__tokenId;

      await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId, price);
    });

    it("Should buy NFT successfully", async function () {
      const price = hre.ethers.parseEther("1");
      const tokenId = nft.__tokenId;

      await expect(marketplace.connect(buyer).buyNFT(1, { value: price }))
        .to.emit(marketplace, "NFTSold")
        .withArgs(1, await nft.getAddress(), tokenId, seller.address, buyer.address, price);

      expect(await nft.ownerOf(tokenId)).to.equal(buyer.address);

      const listing = await marketplace.getListing(1);
      expect(listing.active).to.equal(false);

      const listingIdFromMap = await marketplace.nftToListing(await nft.getAddress(), tokenId);
      expect(listingIdFromMap).to.equal(0);
    });

    it("Should transfer correct amounts with fees (fee remains in contract balance)", async function () {
      const price = hre.ethers.parseEther("1");
      const fee = (price * 250n) / 10000n;
      const sellerAmount = price - fee;

      const sellerBalanceBefore = await hre.ethers.provider.getBalance(seller.address);

      await marketplace.connect(buyer).buyNFT(1, { value: price });

      const sellerBalanceAfter = await hre.ethers.provider.getBalance(seller.address);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(sellerAmount);

      const marketplaceBalance = await hre.ethers.provider.getBalance(await marketplace.getAddress());
      expect(marketplaceBalance).to.equal(fee);
    });

    it("Should fail with incorrect payment", async function () {
      const wrongPrice = hre.ethers.parseEther("0.5");
      await expect(marketplace.connect(buyer).buyNFT(1, { value: wrongPrice })).to.be.revertedWith(
        "Incorrect payment amount"
      );
    });

    it("Should fail if seller tries to buy own NFT", async function () {
      const price = hre.ethers.parseEther("1");
      await expect(marketplace.connect(seller).buyNFT(1, { value: price })).to.be.revertedWith(
        "Cannot buy your own NFT"
      );
    });

    it("Should fail if listing not active", async function () {
      const price = hre.ethers.parseEther("1");

      await marketplace.connect(buyer).buyNFT(1, { value: price });

      await expect(marketplace.connect(addr1).buyNFT(1, { value: price })).to.be.revertedWith(
        "Listing not active"
      );
    });

    it("Should fail if seller no longer owns NFT", async function () {
      const tokenId = nft.__tokenId;

      await nft.connect(seller).transferFrom(seller.address, addr1.address, tokenId);

      const price = hre.ethers.parseEther("1");
      await expect(marketplace.connect(buyer).buyNFT(1, { value: price })).to.be.revertedWith(
        "Seller no longer owns NFT"
      );
    });
  });

  describe("Canceling Listings", function () {
    beforeEach(async function () {
      const price = hre.ethers.parseEther("1");
      const tokenId = nft.__tokenId;

      await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId, price);
    });

    it("Should cancel listing successfully", async function () {
      const tokenId = nft.__tokenId;

      await expect(marketplace.connect(seller).cancelListing(1))
        .to.emit(marketplace, "ListingCancelled")
        .withArgs(1, await nft.getAddress(), tokenId);

      const listing = await marketplace.getListing(1);
      expect(listing.active).to.equal(false);
    });

    it("Should fail if not seller or owner", async function () {
      await expect(marketplace.connect(buyer).cancelListing(1)).to.be.revertedWith("Not authorized");
    });

    it("Should allow marketplace owner to cancel", async function () {
      await expect(marketplace.connect(owner).cancelListing(1)).to.emit(marketplace, "ListingCancelled");
    });
  });

  describe("Updating Listing Price", function () {
    beforeEach(async function () {
      const price = hre.ethers.parseEther("1");
      const tokenId = nft.__tokenId;

      await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId, price);
    });

    it("Should update price successfully", async function () {
      const oldPrice = hre.ethers.parseEther("1");
      const newPrice = hre.ethers.parseEther("2");

      await expect(marketplace.connect(seller).updateListingPrice(1, newPrice))
        .to.emit(marketplace, "ListingPriceUpdated")
        .withArgs(1, oldPrice, newPrice);

      const listing = await marketplace.getListing(1);
      expect(listing.price).to.equal(newPrice);
    });

    it("Should fail if not the seller", async function () {
      const newPrice = hre.ethers.parseEther("2");
      await expect(marketplace.connect(buyer).updateListingPrice(1, newPrice)).to.be.revertedWith(
        "Not the seller"
      );
    });

    it("Should fail if new price is zero", async function () {
      await expect(marketplace.connect(seller).updateListingPrice(1, 0)).to.be.revertedWith(
        "Price must be greater than 0"
      );
    });
  });

  describe("Marketplace Fee Management", function () {
    it("Should update marketplace fee (only owner)", async function () {
      const newFee = 500;
      await expect(marketplace.connect(owner).updateMarketplaceFee(newFee))
        .to.emit(marketplace, "MarketplaceFeeUpdated")
        .withArgs(250, newFee);

      expect(await marketplace.marketplaceFee()).to.equal(newFee);
    });

    it("Should fail if fee too high", async function () {
      await expect(marketplace.connect(owner).updateMarketplaceFee(1500)).to.be.revertedWith("Fee too high");
    });

    it("Should fail if not owner", async function () {
      await expect(marketplace.connect(seller).updateMarketplaceFee(500)).to.be.reverted;
    });
  });

  describe("Fee Withdrawal", function () {
    it("Should withdraw accumulated fees (fees remain as contract balance)", async function () {
      const price = hre.ethers.parseEther("1");
      const tokenId = nft.__tokenId;

      await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId, price);
      await marketplace.connect(buyer).buyNFT(1, { value: price });

      const marketplaceBalanceBefore = await hre.ethers.provider.getBalance(await marketplace.getAddress());
      expect(marketplaceBalanceBefore).to.be.gt(0n);

      const ownerBalanceBefore = await hre.ethers.provider.getBalance(owner.address);

      const tx = await marketplace.connect(owner).withdrawFees();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const ownerBalanceAfter = await hre.ethers.provider.getBalance(owner.address);
      const marketplaceBalanceAfter = await hre.ethers.provider.getBalance(await marketplace.getAddress());

      expect(marketplaceBalanceAfter).to.equal(0n);
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + marketplaceBalanceBefore - gasUsed);
    });

    it("Should fail if no fees to withdraw", async function () {
      await expect(marketplace.connect(owner).withdrawFees()).to.be.revertedWith("No fees to withdraw");
    });

    it("Should fail if not owner", async function () {
      await expect(marketplace.connect(seller).withdrawFees()).to.be.reverted;
    });
  });

  describe("Helper Functions", function () {
    it("Should check if NFT is listed", async function () {
      const tokenId = nft.__tokenId;

      expect(await marketplace.isNFTListed(await nft.getAddress(), tokenId)).to.equal(false);

      const price = hre.ethers.parseEther("1");
      await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId, price);

      expect(await marketplace.isNFTListed(await nft.getAddress(), tokenId)).to.equal(true);
    });

    it("Should return listing details via getListing", async function () {
      const tokenId = nft.__tokenId;

      const price = hre.ethers.parseEther("1");
      await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId, price);

      const listing = await marketplace.getListing(1);
      expect(listing.tokenId).to.equal(tokenId);
      expect(listing.seller).to.equal(seller.address);
    });

    it("Should return all listings via getAllListings", async function () {
      const price1 = hre.ethers.parseEther("1");
      const price2 = hre.ethers.parseEther("2");

      const tokenId1 = nft.__tokenId;

      // mint second token for seller and capture real id
      const tx2 = await nft.connect(owner).mint(seller.address, "QmTestHash2");
      const tokenId2 = await getMintedTokenIdFromTx(tx2, nft);

      await nft.connect(seller).approve(await marketplace.getAddress(), tokenId1);
      await marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId1, price1);

      await nft.connect(seller).approve(await marketplace.getAddress(), tokenId2);
      await marketplace.connect(seller).listNFT(await nft.getAddress(), tokenId2, price2);

      const all = await marketplace.getAllListings();
      expect(all.length).to.equal(2);
      expect(all[0].active).to.equal(true);
      expect(all[1].active).to.equal(true);
    });
  });

  describe("receive()", function () {
    it("Should accept ETH via receive()", async function () {
      const amount = hre.ethers.parseEther("0.1");

      await buyer.sendTransaction({
        to: await marketplace.getAddress(),
        value: amount,
      });

      const bal = await hre.ethers.provider.getBalance(await marketplace.getAddress());
      expect(bal).to.equal(amount);
    });
  });
});
