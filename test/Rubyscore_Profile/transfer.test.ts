import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Method: transfer", () => {
  async function deploySoulBoundTokenContract() {
    const [deployer, admin, operator, user, secondUser] = await ethers.getSigners();

    const XProjectSBTInstance = await ethers.getContractFactory("Rubyscore_Profile");
    const soulBoundTokenContract = await XProjectSBTInstance.connect(deployer).deploy(
      admin.address,
      operator.address
    );

    const standardName = "StandardName";
    await soulBoundTokenContract.connect(user).claimName(standardName);
    const tokenId = await soulBoundTokenContract.getIdByOwner(user.address);

    return { soulBoundTokenContract, deployer, admin, operator, user, secondUser, tokenId };
  }

  describe("When all parameters correct", () => {
    it("should reverted whin user try transferFrom token", async () => {
      const { soulBoundTokenContract, user, secondUser, tokenId } = await loadFixture(
        deploySoulBoundTokenContract
      );

      await expect(
        soulBoundTokenContract.connect(user).transferFrom(user.address, secondUser.address, tokenId)
      ).to.be.revertedWith("Only For you!!!");
    });

    it("should reverted whin user try safeTransferFrom token", async () => {
      const { soulBoundTokenContract, user, secondUser, tokenId } = await loadFixture(
        deploySoulBoundTokenContract
      );

      await expect(
        soulBoundTokenContract
          .connect(user)
          ["safeTransferFrom(address,address,uint256)"](user.address, secondUser.address, tokenId)
      ).to.be.revertedWith("Only For you!!!");
    });

    it("should reverted whin someone try transferFrom token", async () => {
      const { soulBoundTokenContract, user, secondUser, tokenId } = await loadFixture(
        deploySoulBoundTokenContract
      );
      await soulBoundTokenContract.connect(user).approve(secondUser.address, tokenId);

      await expect(
        soulBoundTokenContract.connect(secondUser).transferFrom(user.address, secondUser.address, tokenId)
      ).to.be.revertedWith("Only For you!!!");
    });

    it("should reverted whin someone try safeTransferFrom token", async () => {
      const { soulBoundTokenContract, user, secondUser, tokenId } = await loadFixture(
        deploySoulBoundTokenContract
      );
      await soulBoundTokenContract.connect(user).approve(secondUser.address, tokenId);

      await expect(
        soulBoundTokenContract
          .connect(secondUser)
          ["safeTransferFrom(address,address,uint256)"](user.address, secondUser.address, tokenId)
      ).to.be.revertedWith("Only For you!!!");
    });
  });
});
