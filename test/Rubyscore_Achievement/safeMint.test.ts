import { expect } from "chai";
import { BigNumber, ContractTransaction } from "ethers";
import { ethers, getChainId } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Rubyscore_Achievement } from "@contracts/Rubyscore_Achievement";
import { IRubyscore_Achievement } from "@contracts/interfaces/IRubyscore_Achievement";
import { sign, Domain, ITypes } from "@test-utils";

describe("Method: safeMint: ", () => {
  const BASE_URI = "https://xproject.api/achivments/";
  const nftId = 1;
  const deployAchievements = async () => {
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
      nftIds: [nftId],
    };

    return { achievementsContract, domain, types, mintParams, deployer, operator, minter, user };
  };

  describe("When one of parameters is incorrect", () => {
    it("When signer not equal operator", async () => {
      const { achievementsContract, domain, types, mintParams, user } = await loadFixture(deployAchievements);
      const notOperatorSignature: string = await sign(domain, types, mintParams, user);
      const MINTER_ROLE = await achievementsContract.MINTER_ROLE();
      await expect(
        achievementsContract.connect(user).safeMint(mintParams, notOperatorSignature)
      ).to.be.revertedWith(
        `AccessControl: account ${user.address.toLowerCase()} is missing role ${MINTER_ROLE}`
      );
    });

    it("When user change data", async () => {
      const { achievementsContract, domain, types, mintParams, minter, user } = await loadFixture(
        deployAchievements
      );
      const notOperatorSignature: string = await sign(domain, types, mintParams, minter);

      const changedData = { ...mintParams, nftIds: [1, 2] };
      await expect(achievementsContract.connect(user).safeMint(changedData, notOperatorSignature)).to.be
        .reverted;
    });

    it("When try mint with wrong nonce", async () => {
      const { achievementsContract, domain, types, mintParams, minter, user } = await loadFixture(
        deployAchievements
      );

      const dataWithWrongNonce = { ...mintParams, userNonce: 98 };
      const operatorSignature: string = await sign(domain, types, dataWithWrongNonce, minter);

      await expect(achievementsContract.connect(user).safeMint(dataWithWrongNonce, operatorSignature)).to.be
        .reverted;
    });

    it("When try mint with wrong userAddress", async () => {
      const { achievementsContract, domain, types, mintParams, minter, user, operator } = await loadFixture(
        deployAchievements
      );

      const dataWithWrongNonce = { ...mintParams, userAddress: operator.address };
      const operatorSignature: string = await sign(domain, types, dataWithWrongNonce, minter);

      await expect(achievementsContract.connect(user).safeMint(dataWithWrongNonce, operatorSignature)).to.be
        .reverted;
    });

    it("When try mint without NFTs Ids", async () => {
      const { achievementsContract, domain, types, mintParams, minter, user } = await loadFixture(
        deployAchievements
      );
      const notOperatorSignature: string = await sign(domain, types, mintParams, minter);

      const changedData = { ...mintParams, nftIds: [] };
      await expect(
        achievementsContract.connect(user).safeMint(changedData, notOperatorSignature)
      ).to.be.revertedWith("Invalid NFT ids");
    });

    it("When try mint second NFT to one address", async () => {
      const { achievementsContract, domain, types, mintParams, minter, user } = await loadFixture(
        deployAchievements
      );
      let operatorSignature: string = await sign(domain, types, mintParams, minter);

      await expect(achievementsContract.connect(user).safeMint(mintParams, operatorSignature)).to.be.not
        .reverted;

      const newBuyParams = { ...mintParams, userNonce: 1 };
      operatorSignature = await sign(domain, types, newBuyParams, minter);
      await expect(
        achievementsContract.connect(user).safeMint(newBuyParams, operatorSignature)
      ).to.be.revertedWith("You already have this achievement");
    });

    it("When try mint with wrong payment amount", async () => {
      const { achievementsContract, domain, types, mintParams, minter, user, operator } = await loadFixture(
        deployAchievements
      );
      let operatorSignature: string = await sign(domain, types, mintParams, minter);

      await achievementsContract.connect(operator).setPrice(100);

      operatorSignature = await sign(domain, types, mintParams, minter);
      await expect(
        achievementsContract.connect(user).safeMint(mintParams, operatorSignature)
      ).to.be.revertedWith("Wrong payment amount");
    });
    it("When try mint second NFT to one address with batch", async () => {
      const { achievementsContract, domain, types, mintParams, minter, user } = await loadFixture(
        deployAchievements
      );
      const batchBuyParams = { ...mintParams, nftIds: [1, 2, 3] };
      let operatorSignature: string = await sign(domain, types, batchBuyParams, minter);
      await expect(achievementsContract.connect(user).safeMint(batchBuyParams, operatorSignature)).to.be.not
        .reverted;

      const newBuyParams = { ...batchBuyParams, userNonce: 1 };
      operatorSignature = await sign(domain, types, newBuyParams, minter);
      await expect(
        achievementsContract.connect(user).safeMint(newBuyParams, operatorSignature)
      ).to.be.revertedWith("You already have this achievement");
    });
  });

  describe("When all parameters correct with one NFT token", () => {
    let user: SignerWithAddress, minter: SignerWithAddress;
    let achievementsContract: Rubyscore_Achievement;
    let domain: Domain;
    let types: ITypes;
    let operatorSignature: string;
    let mintParams: IRubyscore_Achievement.MintParamsStruct;
    let userNonceBeforeMint: BigNumber;

    let result: ContractTransaction;

    before(async () => {
      const deployments = await loadFixture(deployAchievements);
      achievementsContract = deployments.achievementsContract;
      domain = deployments.domain;
      types = deployments.types;
      mintParams = deployments.mintParams;
      minter = deployments.minter;
      user = deployments.user;
      userNonceBeforeMint = await achievementsContract.getUserNonce(user.address);
      operatorSignature = await sign(domain, types, mintParams, minter);
    });

    it("should success", async () => {
      result = await achievementsContract.connect(user).safeMint(mintParams, operatorSignature);

      await expect(result).to.be.not.reverted;
    });

    it("should increase user nonce token", async () => {
      const userNonce = await achievementsContract.getUserNonce(user.address);
      expect(userNonce).to.be.equal(userNonceBeforeMint.add(1));
    });

    it("should increase totalSupply", async () => {
      const totalSupply = await achievementsContract.totalSupply(nftId);
      expect(totalSupply).to.be.equal(1);
    });

    it("should mint one NFT token for user", async () => {
      const userBalance = await achievementsContract.balanceOf(user.address, nftId);
      expect(userBalance).to.be.equal(1);
    });

    it("Event Minted", async () => {
      await expect(result)
        .to.emit(achievementsContract, "Minted")
        .withArgs(mintParams.userAddress, mintParams.userNonce, mintParams.nftIds);
    });
  });

  describe("When all parameters correct with some NFT token", () => {
    let user: SignerWithAddress, minter: SignerWithAddress;
    let achievementsContract: Rubyscore_Achievement;
    let domain: Domain;
    let types: ITypes;
    let operatorSignature: string;
    let mintParams: IRubyscore_Achievement.MintParamsStruct;
    let userNonceBeforeMint: BigNumber;

    let result: ContractTransaction;

    before(async () => {
      const deployments = await loadFixture(deployAchievements);
      achievementsContract = deployments.achievementsContract;
      domain = deployments.domain;
      types = deployments.types;
      mintParams = { ...deployments.mintParams, nftIds: [1, 2, 3] };
      minter = deployments.minter;
      user = deployments.user;
      userNonceBeforeMint = await achievementsContract.getUserNonce(user.address);
      operatorSignature = await sign(domain, types, mintParams, minter);
    });

    it("should success", async () => {
      result = await achievementsContract.connect(user).safeMint(mintParams, operatorSignature);

      await expect(result).to.be.not.reverted;
    });

    it("should increase user nonce token", async () => {
      const userNonce = await achievementsContract.getUserNonce(user.address);
      expect(userNonce).to.be.equal(userNonceBeforeMint.add(1));
    });

    describe("should increase totalSupply:", () => {
      it("should increase totalSupply of NFT with id 1", async () => {
        const totalSupply = await achievementsContract.totalSupply(1);
        expect(totalSupply).to.be.equal(1);
      });

      it("should increase totalSupply of NFT with id 2", async () => {
        const totalSupply = await achievementsContract.totalSupply(2);
        expect(totalSupply).to.be.equal(1);
      });

      it("should increase totalSupply of NFT with id 3", async () => {
        const totalSupply = await achievementsContract.totalSupply(3);
        expect(totalSupply).to.be.equal(1);
      });
    });

    it("should mint NFTs for user:", async () => {
      const userBalance = await achievementsContract.balanceOfBatch(
        [user.address, user.address, user.address],
        mintParams.nftIds
      );
      expect(userBalance).to.be.deep.equal([1, 1, 1]);
    });

    it("Event Minted", async () => {
      await expect(result)
        .to.emit(achievementsContract, "Minted")
        .withArgs(mintParams.userAddress, mintParams.userNonce, mintParams.nftIds);
    });
  });
});
