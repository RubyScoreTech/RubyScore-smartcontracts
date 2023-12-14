import { expect } from "chai";
import { ethers } from "hardhat";
import { Rubyscore_Profile } from "@contracts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractTransaction, utils } from "ethers";

describe("Method: claimName", () => {
  async function deploySoulBoundTokenContract() {
    const [deployer, admin, operator, user, secondUser] = await ethers.getSigners();
    const premiumPrice = utils.parseUnits("1", 18);

    const XProjectSBTInstance = await ethers.getContractFactory("Rubyscore_Profile");
    const soulBoundTokenContract = await XProjectSBTInstance.connect(deployer).deploy(
      admin.address,
      operator.address
    );

    await soulBoundTokenContract.connect(operator).updatePremiumPrice(premiumPrice);

    const standardName = "StandardN@me$/";
    const premiumName = "Ali";

    return { soulBoundTokenContract, deployer, admin, operator, user, secondUser, standardName, premiumName };
  }

  describe("When one of parameters is incorrect", () => {
    it("When name already occupied", async () => {
      const { soulBoundTokenContract, user, standardName, secondUser } = await loadFixture(
        deploySoulBoundTokenContract
      );

      await soulBoundTokenContract.connect(user).claimName(standardName);
      await expect(soulBoundTokenContract.checkName(standardName)).to.be.rejectedWith("Name is occupied");

      await expect(soulBoundTokenContract.connect(secondUser).claimName(standardName)).to.be.revertedWith(
        "ERC721: token already minted"
      );
    });

    it("When name already occupied in another registry", async () => {
      const { soulBoundTokenContract, user, standardName, secondUser } = await loadFixture(
        deploySoulBoundTokenContract
      );
      await soulBoundTokenContract.connect(user).claimName(standardName.toLowerCase());

      await expect(soulBoundTokenContract.checkName(standardName)).to.be.rejectedWith("Name is occupied");

      await expect(soulBoundTokenContract.connect(secondUser).claimName(standardName)).to.be.revertedWith(
        "ERC721: token already minted"
      );
    });

    it("When user already claim name", async () => {
      const { soulBoundTokenContract, user, standardName } = await loadFixture(deploySoulBoundTokenContract);
      await soulBoundTokenContract.connect(user).claimName(standardName);

      await expect(soulBoundTokenContract.connect(user).claimName(standardName)).to.be.revertedWith(
        "Already has name"
      );
    });

    it("When user try claim name with wrong payment (less than price)", async () => {
      const { soulBoundTokenContract, user, standardName } = await loadFixture(deploySoulBoundTokenContract);

      const premiumPrice = await soulBoundTokenContract.getPremiumPrice();

      await expect(
        soulBoundTokenContract.connect(user).claimName(standardName, { value: premiumPrice.sub(1) })
      ).to.be.revertedWith("Wrong ETH amount");
    });

    it("When user try claim name with wrong payment (more than price)", async () => {
      const { soulBoundTokenContract, user, standardName } = await loadFixture(deploySoulBoundTokenContract);

      const premiumPrice = await soulBoundTokenContract.getPremiumPrice();

      await expect(
        soulBoundTokenContract.connect(user).claimName(standardName, { value: premiumPrice.sub(1) })
      ).to.be.revertedWith("Wrong ETH amount");
    });

    it("When user already claim name and try claim another without payment", async () => {
      const { soulBoundTokenContract, user, standardName } = await loadFixture(deploySoulBoundTokenContract);
      await soulBoundTokenContract.connect(user).claimName(standardName);

      await expect(soulBoundTokenContract.connect(user).claimName("newName")).to.be.revertedWith(
        "Already has name"
      );
    });

    it("When user try to claim invalid name with trim", async () => {
      const { soulBoundTokenContract, user } = await loadFixture(deploySoulBoundTokenContract);
      const testName = "With space";

      await expect(soulBoundTokenContract.checkName(testName)).to.be.rejectedWith("Name is invalid");

      await expect(soulBoundTokenContract.connect(user).claimName("With space")).to.be.revertedWith(
        "Name is invalid"
      );
    });

    it("When user try to claim invalid name with not english char", async () => {
      const { soulBoundTokenContract, user } = await loadFixture(deploySoulBoundTokenContract);
      const testName = "Ademáss";

      await expect(soulBoundTokenContract.checkName(testName)).to.be.rejectedWith("Name is invalid");

      await expect(soulBoundTokenContract.connect(user).claimName(testName)).to.be.revertedWith(
        "Name is invalid"
      );
    });

    it("When user try to claim invalid name with less than 2 char", async () => {
      const { soulBoundTokenContract, user } = await loadFixture(deploySoulBoundTokenContract);
      const testName = "AI";

      await expect(soulBoundTokenContract.checkName(testName)).to.be.rejectedWith("Name is too short");
      await expect(soulBoundTokenContract.connect(user).claimName(testName)).to.be.revertedWith(
        "Wrong name length"
      );
    });

    it("When user try to claim invalid name with more than 20 char", async () => {
      const { soulBoundTokenContract, user } = await loadFixture(deploySoulBoundTokenContract);
      const testName = "AIAIAIAIAIAIAIAIAIAIA";

      await expect(soulBoundTokenContract.checkName(testName)).to.be.rejectedWith("Name is too long");
      await expect(soulBoundTokenContract.connect(user).claimName(testName)).to.be.revertedWith(
        "Name is too long"
      );
    });
  });

  describe("When all parameters correct: Claim free name", () => {
    let result: ContractTransaction;
    let soulBoundTokenContract: Rubyscore_Profile;
    let user: SignerWithAddress;
    let name: string;

    before(async () => {
      const deploy = await loadFixture(deploySoulBoundTokenContract);
      soulBoundTokenContract = deploy.soulBoundTokenContract;
      user = deploy.user;
      name = deploy.standardName;
    });

    it("should not reverted", async () => {
      const checkStatus = await soulBoundTokenContract.checkName(name);
      expect(checkStatus[0]).to.be.true;

      result = await soulBoundTokenContract.connect(user).claimName(name);
      await expect(result).to.be.not.reverted;
    });

    it("should increment user balance", async () => {
      const userBalance = await soulBoundTokenContract.balanceOf(user.address);
      expect(userBalance).to.be.eq(1);
    });

    it("should user have minted token", async () => {
      const tokenId = await soulBoundTokenContract.getIdByName(name);
      const ownerOfToken = await soulBoundTokenContract.ownerOf(tokenId);
      expect(user.address).to.be.eq(ownerOfToken);
    });

    it("should link user to name", async () => {
      const ownerByName = await soulBoundTokenContract.getOwnerByName(name);
      expect(user.address).to.be.eq(ownerByName);
    });

    it("should link name to user", async () => {
      const nameFromContract = await soulBoundTokenContract.getNameByOwner(user.address);
      expect(name).to.be.eq(nameFromContract);
    });

    it("should link name to id", async () => {
      const tokenId = await soulBoundTokenContract.getIdByOwner(user.address);
      const nameFromContract = await soulBoundTokenContract.getNameById(tokenId);
      expect(name).to.be.eq(nameFromContract);
    });

    it("should premium status be false", async () => {
      const premiumStatus = await soulBoundTokenContract.getPremiumStatus(user.address);
      expect(premiumStatus).to.be.false;
    });

    it("should id from owner address and name be equal", async () => {
      const tokenIdFromOwner = await soulBoundTokenContract.getIdByOwner(user.address);
      const tokenIdFromName = await soulBoundTokenContract.getIdByName(name);

      expect(tokenIdFromOwner).to.be.eq(tokenIdFromName);
    });

    it("should set to token expected URI", async () => {
      const tokenId = await soulBoundTokenContract.getIdByOwner(user.address);
      const baseURI: string = await soulBoundTokenContract.getBaseURI();
      const baseExtension: string = await soulBoundTokenContract.getBaseExtension();
      const tokenURI = await soulBoundTokenContract.tokenURI(tokenId);

      expect(tokenURI).to.be.eq(baseURI + tokenId.toString() + baseExtension);
    });

    it("should emit NameClaimed event", async () => {
      const tokenId = await soulBoundTokenContract.getIdByOwner(user.address);
      await expect(result)
        .to.emit(soulBoundTokenContract, "NameClaimed")
        .withArgs(user.address, tokenId, name, false);
    });
  });

  describe("When all parameters correct: Claim premium name, without name before", () => {
    let result: ContractTransaction;
    let soulBoundTokenContract: Rubyscore_Profile;
    let user: SignerWithAddress;
    let name: string;

    before(async () => {
      const deploy = await loadFixture(deploySoulBoundTokenContract);
      soulBoundTokenContract = deploy.soulBoundTokenContract;
      user = deploy.user;
      name = deploy.premiumName;
    });

    it("should not reverted", async () => {
      const checkStatus = await soulBoundTokenContract.checkName(name);
      expect(checkStatus[0]).to.be.true;

      const premiumPrice = await soulBoundTokenContract.getPremiumPrice();

      result = await soulBoundTokenContract.connect(user).claimName(name, { value: premiumPrice });
      await expect(result).to.be.not.reverted;
    });

    it("should increment user balance", async () => {
      const userBalance = await soulBoundTokenContract.balanceOf(user.address);
      expect(userBalance).to.be.eq(1);
    });

    it("should user have minted token", async () => {
      const tokenId = await soulBoundTokenContract.getIdByName(name);
      const ownerOfToken = await soulBoundTokenContract.ownerOf(tokenId);
      expect(user.address).to.be.eq(ownerOfToken);
    });

    it("should link user to name", async () => {
      const ownerByName = await soulBoundTokenContract.getOwnerByName(name);
      expect(user.address).to.be.eq(ownerByName);
    });

    it("should link name to user", async () => {
      const nameFromContract = await soulBoundTokenContract.getNameByOwner(user.address);
      expect(name).to.be.eq(nameFromContract);
    });

    it("should link name to id", async () => {
      const tokenId = await soulBoundTokenContract.getIdByOwner(user.address);
      const nameFromContract = await soulBoundTokenContract.getNameById(tokenId);
      expect(name).to.be.eq(nameFromContract);
    });

    it("should premium status be true", async () => {
      const premiumStatus = await soulBoundTokenContract.getPremiumStatus(user.address);
      expect(premiumStatus).to.be.true;
    });

    it("should id from owner address and name be equal", async () => {
      const tokenIdFromOwner = await soulBoundTokenContract.getIdByOwner(user.address);
      const tokenIdFromName = await soulBoundTokenContract.getIdByName(name);

      expect(tokenIdFromOwner).to.be.eq(tokenIdFromName);
    });

    it("should set to token expected URI", async () => {
      const tokenId = await soulBoundTokenContract.getIdByOwner(user.address);
      const baseURI: string = await soulBoundTokenContract.getBaseURI();
      const baseExtension: string = await soulBoundTokenContract.getBaseExtension();
      const tokenURI = await soulBoundTokenContract.tokenURI(tokenId);

      expect(tokenURI).to.be.eq(baseURI + tokenId.toString() + baseExtension);
    });

    it("should emit NameClaimed event", async () => {
      const tokenId = await soulBoundTokenContract.getIdByOwner(user.address);
      await expect(result)
        .to.emit(soulBoundTokenContract, "NameClaimed")
        .withArgs(user.address, tokenId, name, true);
    });
  });

  describe("When all parameters correct: Claim premium name, with save name before", () => {
    let result: ContractTransaction;
    let soulBoundTokenContract: Rubyscore_Profile;
    let user: SignerWithAddress;
    let name: string;
    let standardName: string;

    before(async () => {
      const deploy = await loadFixture(deploySoulBoundTokenContract);
      soulBoundTokenContract = deploy.soulBoundTokenContract;
      user = deploy.user;
      standardName = deploy.standardName;
    });

    it("should not reverted", async () => {
      const checkStatus = await soulBoundTokenContract.checkName(standardName);
      expect(checkStatus[0]).to.be.true;

      const premiumPrice = await soulBoundTokenContract.getPremiumPrice();

      await soulBoundTokenContract.connect(user).claimName(standardName, { value: 0 });

      result = await soulBoundTokenContract.connect(user).claimName("", { value: premiumPrice });
      await expect(result).to.be.not.reverted;
    });

    it("should not increment user balance", async () => {
      const userBalance = await soulBoundTokenContract.balanceOf(user.address);
      expect(userBalance).to.be.eq(1);
    });

    it("should user save token", async () => {
      const tokenId = await soulBoundTokenContract.getIdByName(standardName);
      const ownerOfToken = await soulBoundTokenContract.ownerOf(tokenId);
      expect(user.address).to.be.eq(ownerOfToken);
    });

    it("should save link user to name", async () => {
      const ownerByName = await soulBoundTokenContract.getOwnerByName(standardName);
      expect(user.address).to.be.eq(ownerByName);
    });

    it("should save link name to user", async () => {
      const nameFromContract = await soulBoundTokenContract.getNameByOwner(user.address);
      expect(standardName).to.be.eq(nameFromContract);
    });

    it("should save link name to id", async () => {
      const tokenId = await soulBoundTokenContract.getIdByOwner(user.address);
      const nameFromContract = await soulBoundTokenContract.getNameById(tokenId);
      expect(standardName).to.be.eq(nameFromContract);
    });

    it("should premium status be true", async () => {
      const premiumStatus = await soulBoundTokenContract.getPremiumStatus(user.address);
      expect(premiumStatus).to.be.true;
    });

    it("should id from owner address and name be equal", async () => {
      const tokenIdFromOwner = await soulBoundTokenContract.getIdByOwner(user.address);
      const tokenIdFromName = await soulBoundTokenContract.getIdByName(standardName);

      expect(tokenIdFromOwner).to.be.eq(tokenIdFromName);
    });

    it("should set to token expected URI", async () => {
      const tokenId = await soulBoundTokenContract.getIdByOwner(user.address);
      const baseURI: string = await soulBoundTokenContract.getBaseURI();
      const baseExtension: string = await soulBoundTokenContract.getBaseExtension();
      const tokenURI = await soulBoundTokenContract.tokenURI(tokenId);

      expect(tokenURI).to.be.eq(baseURI + tokenId.toString() + baseExtension);
    });

    it("should emit NameClaimed event", async () => {
      const tokenId = await soulBoundTokenContract.getIdByOwner(user.address);
      await expect(result)
        .to.emit(soulBoundTokenContract, "NameClaimed")
        .withArgs(user.address, tokenId, standardName, true);
    });
  });

  describe("When all parameters correct: Claim premium name, with name change", () => {
    let result: ContractTransaction;
    let soulBoundTokenContract: Rubyscore_Profile;
    let user: SignerWithAddress;
    let name: string;

    const oldName = "OldName@#";

    before(async () => {
      const deploy = await loadFixture(deploySoulBoundTokenContract);
      soulBoundTokenContract = deploy.soulBoundTokenContract;
      user = deploy.user;
      name = deploy.premiumName;
    });

    it("should not reverted", async () => {
      let checkStatus = await soulBoundTokenContract.checkName(oldName);
      expect(checkStatus[0]).to.be.true;
      checkStatus = await soulBoundTokenContract.checkName(name);
      expect(checkStatus[0]).to.be.true;

      await soulBoundTokenContract.connect(user).claimName(oldName, { value: 0 });

      const premiumPrice = await soulBoundTokenContract.getPremiumPrice();

      result = await soulBoundTokenContract.connect(user).claimName(name, { value: premiumPrice });
      await expect(result).to.be.not.reverted;
    });

    it("should increment user balance", async () => {
      const userBalance = await soulBoundTokenContract.balanceOf(user.address);
      expect(userBalance).to.be.eq(1);
    });

    it("should user have minted token", async () => {
      const tokenId = await soulBoundTokenContract.getIdByName(name);
      const ownerOfToken = await soulBoundTokenContract.ownerOf(tokenId);
      expect(user.address).to.be.eq(ownerOfToken);
    });

    it("should link user to name", async () => {
      const ownerByName = await soulBoundTokenContract.getOwnerByName(name);
      expect(user.address).to.be.eq(ownerByName);
    });

    it("should link name to user", async () => {
      const nameFromContract = await soulBoundTokenContract.getNameByOwner(user.address);
      expect(name).to.be.eq(nameFromContract);
    });

    it("should link name to id", async () => {
      const tokenId = await soulBoundTokenContract.getIdByOwner(user.address);
      const nameFromContract = await soulBoundTokenContract.getNameById(tokenId);
      expect(name).to.be.eq(nameFromContract);
    });

    it("should premium status be true", async () => {
      const premiumStatus = await soulBoundTokenContract.getPremiumStatus(user.address);
      expect(premiumStatus).to.be.true;
    });

    it("should id from owner address and name be equal", async () => {
      const tokenIdFromOwner = await soulBoundTokenContract.getIdByOwner(user.address);
      const tokenIdFromName = await soulBoundTokenContract.getIdByName(name);

      expect(tokenIdFromOwner).to.be.eq(tokenIdFromName);
    });

    it("should set to token expected URI", async () => {
      const tokenId = await soulBoundTokenContract.getIdByOwner(user.address);
      const baseURI: string = await soulBoundTokenContract.getBaseURI();
      const baseExtension: string = await soulBoundTokenContract.getBaseExtension();
      const tokenURI = await soulBoundTokenContract.tokenURI(tokenId);

      expect(tokenURI).to.be.eq(baseURI + tokenId.toString() + baseExtension);
    });

    it("should emit NameClaimed event", async () => {
      const tokenId = await soulBoundTokenContract.getIdByOwner(user.address);
      await expect(result)
        .to.emit(soulBoundTokenContract, "NameClaimed")
        .withArgs(user.address, tokenId, name, true);
    });
  });
});
