const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ID = 1,
  NAME = "iPhone 13",
  CATEGORY = "Apple",
  IMAGE =
    "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg",
  COST = tokens(1),
  RATING = 4,
  STOCK = 5;

describe("Dappazon", () => {
  let dappazon, deployer, buyer;

  //deploy the contract
  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners();
    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await Dappazon.deploy();
  });

  describe("Deployment", async () => {
    it("should set the owner", async () => {
      const owner = await dappazon.owner();
      expect(owner).to.equal(deployer.address);
    });
  });

  describe("Listing", async () => {
    let transaction;

    beforeEach(async () => {
      transaction = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();
    });

    it("should return item attributes", async () => {
      const item = await dappazon.items(1);
      expect(item.id).to.equal(ID);
      expect(item.name).to.equal(NAME);
      expect(item.category).to.equal(CATEGORY);
      expect(item.image).to.equal(IMAGE);
      expect(item.cost).to.equal(COST);
      expect(item.rating).to.equal(RATING);
      expect(item.stock).to.equal(STOCK);
    });

    it("should emits a List event", async () => {
      expect(transaction).to.emit(dappazon, "List").withArgs(NAME, COST, STOCK);
    });
  });

  describe("Buying", async () => {
    let transaction;
    beforeEach(async () => {
      transaction = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();
      transaction = await dappazon.connect(buyer).buy(ID, { value: COST });
    });

    it("should updates the contract balance", async () => {
      const balance = await ethers.provider.getBalance(dappazon.address);
      expect(balance).to.equal(COST);
    });

    it("should update buyers order count", async () => {
      const orderCount = await dappazon.orderCount(buyer.address);
      expect(orderCount).to.equal(1);
    });

    it("should update the stock count", async () => {
      const item = await dappazon.items(ID);
      expect(item.stock).to.equal(STOCK - 1);
    });

    it("should update the order", async () => {
      const order = await dappazon.orders(buyer.address, 1);
      expect(order.item.cost).to.equal(COST);
      expect(order.time).to.be.greaterThan(0);
      expect(order.item.name).to.equal(NAME);
    });

    it("should emit a Buy event", async () => {
      const orderCount = await dappazon.orderCount(buyer.address);
      const order = await dappazon.orders(buyer.address, 1);
      expect(transaction)
        .to.emit(dappazon, "Buy")
        .withArgs(buyer.address, orderCount, order.item.ID);
    });
  });

  describe("Withdrawing", async () => {
    let beforeBalance;

    beforeEach(async () => {
      let transaction = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();
      transaction = await dappazon.connect(buyer).buy(ID, { value: COST });
      await transaction.wait();

      beforeBalance = await ethers.provider.getBalance(deployer.address);

      transaction = await dappazon.connect(deployer).withdraw();
      await transaction.wait();
    });

    it("should update the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(beforeBalance);
    });

    it("should update contract balance", async () => {
      const balance = await ethers.provider.getBalance(dappazon.address);
      expect(balance).to.equal(0);
    });
  });
});
