import { expect } from "chai";
import { ethers } from "hardhat";
import { ZERO_ADDRESS } from "@test-utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Rubyscore_Profile, XProjectSBT__factory } from "@contracts";

describe("Method: constructor", () => {
  let deployer: SignerWithAddress, admin: SignerWithAddress, operator: SignerWithAddress;
  let XProjectSBTInstance: XProjectSBT__factory;
  let soulBoundTokenContract: Rubyscore_Profile;

  before(async () => {
    [deployer, admin, operator] = await ethers.getSigners();
    XProjectSBTInstance = await ethers.getContractFactory("Rubyscore_Profile");
  });

  describe("When one of parameters is incorrect", () => {
    it("When admin is zero address", async () => {
      await expect(XProjectSBTInstance.deploy(ZERO_ADDRESS, operator.address)).to.be.revertedWith(
        "Zero address check"
      );
    });

    it("When operator is zero address", async () => {
      await expect(
        XProjectSBTInstance.connect(deployer).deploy(operator.address, ZERO_ADDRESS)
      ).to.be.revertedWith("Zero address check");
    });
  });

  describe("When all parameters correct", () => {
    before(async () => {
      soulBoundTokenContract = await XProjectSBTInstance.connect(deployer).deploy(
        admin.address,
        operator.address
      );
    });

    it("should admin have DEFAULT_ADMIN_ROLE", async () => {
      const DEFAULT_ADMIN_ROLE = await soulBoundTokenContract.DEFAULT_ADMIN_ROLE();
      expect(await soulBoundTokenContract.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("should operator have OPERATOR_ROLE", async () => {
      const OPERATOR_ROLE = await soulBoundTokenContract.OPERATOR_ROLE();
      expect(await soulBoundTokenContract.hasRole(OPERATOR_ROLE, operator.address)).to.be.true;
    });

    it("success: should support ERC721 interface", async function () {
      const INTERFACE_ID_ERC721 = "0x80ac58cd";
      expect(await soulBoundTokenContract.supportsInterface(INTERFACE_ID_ERC721)).to.be.true;
    });
  });
});
