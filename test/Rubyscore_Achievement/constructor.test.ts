import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Rubyscore_Achievement, Rubyscore_Achievement__factory } from "@contracts";
import { ZERO_ADDRESS } from "@test-utils";

describe("Method: constructor", () => {
  const BASE_URI = "https://xproject.api/achivments/";

  let deployer: SignerWithAddress,
    admin: SignerWithAddress,
    operator: SignerWithAddress,
    minter: SignerWithAddress;
  let AchievementsInstance: Rubyscore_Achievement__factory;
  let achievementsContract: Rubyscore_Achievement;

  before(async () => {
    [deployer, admin, operator, minter] = await ethers.getSigners();
    AchievementsInstance = await ethers.getContractFactory("Rubyscore_Achievement");
  });

  describe("When one of parameters is incorrect", () => {
    it("When admin is zero address", async () => {
      await expect(
        AchievementsInstance.deploy(
          ZERO_ADDRESS,
          operator.address,
          minter.address,
          BASE_URI,
          "name",
          "symbol"
        )
      ).to.be.revertedWith("Zero address check");
    });

    it("When operator is zero address", async () => {
      await expect(
        AchievementsInstance.connect(deployer).deploy(
          admin.address,
          ZERO_ADDRESS,
          minter.address,
          BASE_URI,
          "name",
          "symbol"
        )
      ).to.be.revertedWith("Zero address check");
    });

    it("When minter is zero address", async () => {
      await expect(
        AchievementsInstance.connect(deployer).deploy(
          admin.address,
          minter.address,
          ZERO_ADDRESS,
          BASE_URI,
          "name",
          "symbol"
        )
      ).to.be.revertedWith("Zero address check");
    });
  });

  describe("When all parameters correct", () => {
    before(async () => {
      achievementsContract = await AchievementsInstance.connect(deployer).deploy(
        admin.address,
        operator.address,
        minter.address,
        BASE_URI,
        "name",
        "symbol"
      );
    });

    it("should admin have DEFAULT_ADMIN_ROLE", async () => {
      const DEFAULT_ADMIN_ROLE = await achievementsContract.DEFAULT_ADMIN_ROLE();
      expect(await achievementsContract.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("should operator have OPERATOR_ROLE", async () => {
      const OPERATOR_ROLE = await achievementsContract.OPERATOR_ROLE();
      expect(await achievementsContract.hasRole(OPERATOR_ROLE, operator.address)).to.be.true;
    });

    it("should operator have OPERATOR_ROLE", async () => {
      const MINTER_ROLE = await achievementsContract.MINTER_ROLE();
      expect(await achievementsContract.hasRole(MINTER_ROLE, minter.address)).to.be.true;
    });

    it("success: should support ERC1155 interface", async function () {
      const INTERFACE_ID_ER1155 = "0x01ffc9a7";
      expect(await achievementsContract.supportsInterface(INTERFACE_ID_ER1155)).to.be.true;
    });
  });
});
