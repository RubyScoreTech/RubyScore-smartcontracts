import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Rubyscore_Profile } from "@contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractTransaction, utils } from "ethers";

describe("Method: withdraw", () => {
  const premiumPrice = utils.parseUnits("1", 18);

  async function deploySoulBoundTokenContract() {
    const [deployer, admin, operator, user] = await ethers.getSigners();

    const XProjectSBTInstance = await ethers.getContractFactory("Rubyscore_Profile");
    const soulBoundTokenContract = await XProjectSBTInstance.connect(deployer).deploy(
      admin.address,
      operator.address
    );

    await soulBoundTokenContract.connect(operator).updatePremiumPrice(premiumPrice);

    const premiumName = "Ali";
    await soulBoundTokenContract.connect(user).claimName(premiumName, { value: premiumPrice });

    return { soulBoundTokenContract, deployer, admin, operator, user };
  }

  describe("When one of parameters is incorrect", () => {
    it("When not operator try to withdraw", async () => {
      const { soulBoundTokenContract, user } = await loadFixture(deploySoulBoundTokenContract);
      const OPERATOR_ROLE = await soulBoundTokenContract.OPERATOR_ROLE();

      await expect(soulBoundTokenContract.connect(user).updatePremiumPrice(100)).to.be.revertedWith(
        `AccessControl: account ${user.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`
      );
    });

    it("When not owner try to withdraw", async () => {
      const { soulBoundTokenContract, user } = await loadFixture(deploySoulBoundTokenContract);
      const DEFAULT_ADMIN_ROLE = await soulBoundTokenContract.DEFAULT_ADMIN_ROLE();

      await expect(soulBoundTokenContract.connect(user).withdraw()).to.be.revertedWith(
        `AccessControl: account ${user.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });

    it("When try to withdraw zero amount", async () => {
      const { soulBoundTokenContract, admin } = await loadFixture(deploySoulBoundTokenContract);
      await soulBoundTokenContract.connect(admin).withdraw();

      await expect(soulBoundTokenContract.connect(admin).withdraw()).to.be.revertedWith(
        "Zero amount to withdraw"
      );
    });
  });

  describe("When all parameters correct: Claim premium name, without name before", () => {
    let result: ContractTransaction;
    let soulBoundTokenContract: Rubyscore_Profile;
    let admin: SignerWithAddress;

    before(async () => {
      const deploy = await loadFixture(deploySoulBoundTokenContract);
      soulBoundTokenContract = deploy.soulBoundTokenContract;
      admin = deploy.admin;
    });

    it("should not reverted", async () => {
      result = await soulBoundTokenContract.connect(admin).withdraw();

      await expect(result).to.be.not.reverted;
    });

    it("should withdraw tokens to admin wallet", async () => {
      await expect(result).to.changeEtherBalances(
        [admin.address, soulBoundTokenContract.address],
        [premiumPrice, premiumPrice.mul(-1)]
      );
    });

    it("should contract balance be equal to zero", async () => {
      const contractBalance = await ethers.provider.getBalance(soulBoundTokenContract.address);

      expect(contractBalance).to.be.equal(0);
    });

    it("should emit Withdrawed event", async () => {
      await expect(result).to.emit(soulBoundTokenContract, "Withdrawed").withArgs(premiumPrice);
    });
  });
});
