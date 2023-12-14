import { expect } from "chai";
import { ethers, getChainId } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Rubyscore_Achievement } from "@contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractTransaction, utils } from "ethers";
import { sign } from "@test-utils";

describe("Method: withdraw", () => {
  const price = utils.parseUnits("1", 18);

  async function deployAchievementsContract() {
    const [deployer, admin, operator, minter, user] = await ethers.getSigners();

    const BASE_URI = "https://";

    const AchievementsInstance = await ethers.getContractFactory("Rubyscore_Achievement");
    const achievementsContract = await AchievementsInstance.deploy(
      admin.address,
      operator.address,
      minter.address,
      BASE_URI,
      "name",
      "symbol"
    );

    expect(await achievementsContract.getPrice()).to.be.equal(0);

    await achievementsContract.connect(operator).setPrice(price);

    expect(await achievementsContract.getPrice()).to.be.equal(price);

    const domain = {
      name: "Rubyscore_Achievement",
      version: "0.0.1",
      chainId: await getChainId(),
      verifyingContract: achievementsContract.address,
    };

    const types = {
      MintParams: [
        { name: "userAddress", type: "address" },
        { name: "userNonce", type: "uint256" },
        { name: "nftIds", type: "uint256[]" },
      ],
    };

    const mintParams = {
      userAddress: user.address,
      userNonce: 0,
      nftIds: [1],
    };

    const operatorSignature = await sign(domain, types, mintParams, minter);
    await achievementsContract.connect(user).safeMint(mintParams, operatorSignature, { value: price });

    return { achievementsContract, deployer, admin, operator, user };
  }

  describe("When one of parameters is incorrect", () => {
    it("When not operator try to set price", async () => {
      const { achievementsContract, user } = await loadFixture(deployAchievementsContract);
      const OPERATOR_ROLE = await achievementsContract.OPERATOR_ROLE();

      await expect(achievementsContract.connect(user).setPrice(100)).to.be.revertedWith(
        `AccessControl: account ${user.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`
      );
    });

    it("When not owner try to withdraw", async () => {
      const { achievementsContract, user } = await loadFixture(deployAchievementsContract);
      const DEFAULT_ADMIN_ROLE = await achievementsContract.DEFAULT_ADMIN_ROLE();

      await expect(achievementsContract.connect(user).withdraw()).to.be.revertedWith(
        `AccessControl: account ${user.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });

    it("When try to withdraw zero amount", async () => {
      const { achievementsContract, admin } = await loadFixture(deployAchievementsContract);
      await achievementsContract.connect(admin).withdraw();

      await expect(achievementsContract.connect(admin).withdraw()).to.be.revertedWith(
        "Zero amount to withdraw"
      );
    });
  });

  describe("When all parameters correct: Claim premium name, without name before", () => {
    let result: ContractTransaction;
    let achievementsContract: Rubyscore_Achievement;
    let admin: SignerWithAddress;

    before(async () => {
      const deploy = await loadFixture(deployAchievementsContract);
      achievementsContract = deploy.achievementsContract;
      admin = deploy.admin;
    });

    it("should not reverted", async () => {
      result = await achievementsContract.connect(admin).withdraw();

      await expect(result).to.be.not.reverted;
    });

    it("should withdraw tokens to admin wallet", async () => {
      await expect(result).to.changeEtherBalances(
        [admin.address, achievementsContract.address],
        [price, price.mul(-1)]
      );
    });

    it("should contract balance be equal to zero", async () => {
      const contractBalance = await ethers.provider.getBalance(achievementsContract.address);

      expect(contractBalance).to.be.equal(0);
    });

    it("should emit Withdrawed event", async () => {
      await expect(result).to.emit(achievementsContract, "Withdrawed").withArgs(price);
    });
  });
});
