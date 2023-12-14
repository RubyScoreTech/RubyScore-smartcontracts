import { expect } from "chai";
import { ContractTransaction } from "ethers";
import { ethers, getChainId } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Rubyscore_Achievement } from "@contracts/Rubyscore_Achievement";
import { sign } from "@test-utils";

describe("Method: setTransferUnlock: ", () => {
  const BASE_URI = "https://xproject.api/achivments/";
  const tokenId = 1;
  const nftIds = [tokenId, 2, 3];

  const deployAchievementsAndMint = async () => {
    const [deployer, operator, minter, user] = await ethers.getSigners();

    const AchievementsInstance = await ethers.getContractFactory("Rubyscore_Achievement");
    const achievementsContract = await AchievementsInstance.deploy(
      deployer.address,
      operator.address,
      minter.address,
      BASE_URI,
      "name",
      "symbol"
    );

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
      nftIds: nftIds,
    };
    const operatorSignature = await sign(domain, types, mintParams, minter);
    await achievementsContract.connect(user).safeMint(mintParams, operatorSignature);

    return { achievementsContract, domain, types, mintParams, deployer, operator, minter, user };
  };

  describe("When one of parameters is incorrect", () => {
    it("should user can not transfer token by default", async () => {
      const { achievementsContract, user, operator } = await loadFixture(deployAchievementsAndMint);

      await expect(
        achievementsContract.connect(user).safeTransferFrom(user.address, operator.address, tokenId, 1, "0x")
      ).to.be.revertedWith("This token only for you");
    });

    it("When not operator try to set Base URI", async () => {
      const { achievementsContract, user } = await loadFixture(deployAchievementsAndMint);
      const OPERATOR_ROLE = await achievementsContract.OPERATOR_ROLE();
      await expect(achievementsContract.connect(user).setTransferUnlock(tokenId, true)).to.be.revertedWith(
        `AccessControl: account ${user.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`
      );
    });
  });

  describe("When all parameters correct with one NFT token", () => {
    let operator: SignerWithAddress;
    let user: SignerWithAddress;
    let achievementsContract: Rubyscore_Achievement;

    let result: ContractTransaction;

    before(async () => {
      const deployments = await loadFixture(deployAchievementsAndMint);
      achievementsContract = deployments.achievementsContract;
      operator = deployments.operator;
      user = deployments.user;
    });

    it("should transfer be locked by default", async () => {
      const transferUnlockStatusBefore = await achievementsContract.getTransferStatus(tokenId);

      expect(transferUnlockStatusBefore).to.be.false;
    });

    it("should success", async () => {
      result = await achievementsContract.connect(operator).setTransferUnlock(tokenId, true);

      await expect(result).to.be.not.reverted;
    });

    it("should unlock transfer to token with id 1", async () => {
      const transferUnlockStatus = await achievementsContract.getTransferStatus(tokenId);

      expect(transferUnlockStatus).to.be.true;
    });

    it("should user can transfer token with id 1", async () => {
      const transfer = await achievementsContract
        .connect(user)
        .safeTransferFrom(user.address, operator.address, tokenId, 1, "0x");

      await expect(transfer).to.be.not.reverted;
    });

    it("should user can not transfer token with id 2", async () => {
      await expect(
        achievementsContract.connect(user).safeTransferFrom(user.address, operator.address, 2, 1, "0x")
      ).to.be.revertedWith("This token only for you");
    });

    it("Event TokenUnlockSet", async () => {
      await expect(result).to.emit(achievementsContract, "TokenUnlockSet").withArgs(tokenId, true);
    });
  });
});
