import { expect } from "chai";
import { ContractTransaction } from "ethers";
import { ethers, getChainId } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Rubyscore_Achievement } from "@contracts/Rubyscore_Achievement";
import { sign } from "@test-utils";

describe("Method: setTokenURI: ", () => {
  const nftIds = [1, 2, 3];
  const BASE_URI = "ipfs://";

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
    it("When not minter try to set URI", async () => {
      const { achievementsContract, user } = await loadFixture(deployAchievementsAndMint);
      const MINTER_ROLE = await achievementsContract.MINTER_ROLE();
      await expect(achievementsContract.connect(user).setTokenURI(1, "newTokenURI")).to.be.revertedWith(
        `AccessControl: account ${user.address.toLowerCase()} is missing role ${MINTER_ROLE}`
      );
    });

    it("When not minter try to set batch token URI", async () => {
      const { achievementsContract, user } = await loadFixture(deployAchievementsAndMint);
      const MINTER_ROLE = await achievementsContract.MINTER_ROLE();
      await expect(
        achievementsContract
          .connect(user)
          .setBatchTokenURI([1, 2, 3], ["newTokenURI_1", "newTokenURI_2", "newTokenURI_3"])
      ).to.be.revertedWith(
        `AccessControl: account ${user.address.toLowerCase()} is missing role ${MINTER_ROLE}`
      );
    });

    it("When ids arrays and URIs array has different length", async () => {
      const { achievementsContract, minter } = await loadFixture(deployAchievementsAndMint);
      await expect(
        achievementsContract.connect(minter).setBatchTokenURI([1, 2, 3], ["newTokenURI_1", "newTokenURI_2"])
      ).to.be.revertedWith("Invalid params");
    });

    it("When not minter try to set Base URI", async () => {
      const { achievementsContract, user } = await loadFixture(deployAchievementsAndMint);
      const OPERATOR_ROLE = await achievementsContract.OPERATOR_ROLE();
      await expect(achievementsContract.connect(user).setBaseURI("NewBaseURI")).to.be.revertedWith(
        `AccessControl: account ${user.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`
      );
    });
  });

  describe("When all parameters correct with one NFT token", () => {
    const tokenId = 1;
    const newTokenURI = "newTokenURI";
    let minter: SignerWithAddress;
    let achievementsContract: Rubyscore_Achievement;
    let tokenUriBeforeSet: string;

    let result: ContractTransaction;

    before(async () => {
      const deployments = await loadFixture(deployAchievementsAndMint);
      achievementsContract = deployments.achievementsContract;
      minter = deployments.minter;
      tokenUriBeforeSet = await achievementsContract.tokenURI(tokenId);
    });

    it("should return baseURI of ERC1155 contract before set", async () => {
      const tokenURI = await achievementsContract.tokenURI(tokenId);
      expect(tokenURI).to.be.equal(BASE_URI);
    });

    it("should success", async () => {
      result = await achievementsContract.connect(minter).setTokenURI(tokenId, newTokenURI);

      await expect(result).to.be.not.reverted;
    });

    it("should set new token URI", async () => {
      const tokenURI = await achievementsContract.tokenURI(tokenId);
      expect(tokenURI).to.be.not.equal(tokenUriBeforeSet);
    });

    it("should new token URI be equal to expected", async () => {
      const tokenURI = await achievementsContract.tokenURI(tokenId);

      expect(tokenURI).to.be.equal(`${BASE_URI}${newTokenURI}`);
    });

    it("should uri() be equal to tokenURI()", async () => {
      const tokenURI = await achievementsContract.tokenURI(tokenId);
      const uri = await achievementsContract.uri(tokenId);

      expect(tokenURI).to.be.equal(uri);
    });

    it("Event TokenURISet", async () => {
      await expect(result).to.emit(achievementsContract, "TokenURISet").withArgs(tokenId, newTokenURI);
    });
  });

  describe("When all parameters correct with some NFT token", () => {
    const tokenIds = [1, 2, 3];
    const newTokenURIs = ["newTokenURI_1", "newTokenURI_2", "newTokenURI_3"];
    let minter: SignerWithAddress;
    let achievementsContract: Rubyscore_Achievement;

    let result: ContractTransaction;

    before(async () => {
      const deployments = await loadFixture(deployAchievementsAndMint);
      achievementsContract = deployments.achievementsContract;
      minter = deployments.minter;
    });

    it("should success", async () => {
      result = await achievementsContract.connect(minter).setBatchTokenURI(tokenIds, newTokenURIs);

      await expect(result).to.be.not.reverted;
    });

    describe("should new token URI be equal to expected: ", () => {
      it("should new token 1 URI be equal to expected", async () => {
        const tokenURI = await achievementsContract.tokenURI(tokenIds[0]);

        expect(tokenURI).to.be.equal(`${BASE_URI}${newTokenURIs[0]}`);
      });

      it("should new token 2 URI be equal to expected", async () => {
        const tokenURI = await achievementsContract.tokenURI(tokenIds[1]);

        expect(tokenURI).to.be.equal(`${BASE_URI}${newTokenURIs[1]}`);
      });

      it("should new token 3 URI be equal to expected", async () => {
        const tokenURI = await achievementsContract.tokenURI(tokenIds[2]);

        expect(tokenURI).to.be.equal(`${BASE_URI}${newTokenURIs[2]}`);
      });
    });

    describe("should new token URI be equal to expected: ", () => {
      it("Event TokenURISet for token 1", async () => {
        await expect(result)
          .to.emit(achievementsContract, "TokenURISet")
          .withArgs(tokenIds[0], newTokenURIs[0]);
      });

      it("Event TokenURISet for token 2", async () => {
        await expect(result)
          .to.emit(achievementsContract, "TokenURISet")
          .withArgs(tokenIds[1], newTokenURIs[1]);
      });

      it("Event TokenURISet for token 3", async () => {
        await expect(result)
          .to.emit(achievementsContract, "TokenURISet")
          .withArgs(tokenIds[2], newTokenURIs[2]);
      });
    });
  });

  describe("When all parameters correct set BASE_URI", () => {
    const newBaseURI = "newBaseURI";
    let operator: SignerWithAddress;
    let achievementsContract: Rubyscore_Achievement;

    let result: ContractTransaction;

    before(async () => {
      const deployments = await loadFixture(deployAchievementsAndMint);
      achievementsContract = deployments.achievementsContract;
      operator = deployments.operator;
    });

    it("should success", async () => {
      result = await achievementsContract.connect(operator).setBaseURI(newBaseURI);

      await expect(result).to.be.not.reverted;
    });

    it("Event BaseURISet", async () => {
      await expect(result).to.emit(achievementsContract, "BaseURISet").withArgs(newBaseURI);
    });
  });
});
