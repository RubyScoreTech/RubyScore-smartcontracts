import { Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

import { DEPLOYER_KEY } from "config";

export default async function (hre: HardhatRuntimeEnvironment) {
  if (!hre.network.zksync) {
    console.log("Skip zk deployments for EVM network!");
    return;
  }

  console.log(`Running deploy script for SBT`);
  if (!DEPLOYER_KEY) throw "⛔️ Private key not detected! Add it to the .env file!";

  const { admin, operator } = await hre.getNamedAccounts();

  const deployParams = [admin, operator];
  const URI = "https://api.rubyscore.io/nft/profile/";
  const premiumPrice = "10000000000000000"; // 0.01 ETH

  // Initialize the wallet.
  const wallet = new Wallet(DEPLOYER_KEY);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  // Load contract
  const artifact = await deployer.loadArtifact("Rubyscore_Profile");

  // Estimate contract deployment fee
  console.log(`Estimate contract deployment fee`);
  const deploymentFee = await deployer.estimateDeployFee(artifact, deployParams);

  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  // Deploy this contract. The returned object will be of a `Contract` type,
  const sbtContractDeploy = await deployer.deploy(artifact, deployParams);
  const sbtContract = await sbtContractDeploy.deployed();

  //obtain the Constructor Arguments
  console.log(`Constructor args: \n${deployParams} \n${sbtContract.interface.encodeDeploy(deployParams)}`);

  // Show the contract info.
  const contractAddress = sbtContract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  console.log("Setting updateBaseURI");
  let tx = await sbtContract.updateBaseURI(URI);
  console.log(`Tx hash: ${tx.hash}`);
  await tx.wait();

  console.log("Setting PremiumPrice");
  tx = await sbtContract.updatePremiumPrice(premiumPrice);
  console.log(`Tx hash: ${tx.hash}`);
  await tx.wait();

  if (wallet.address != admin) {
    console.log("Revoke operator role");
    const OPERATOR_ROLE = await sbtContract.OPERATOR_ROLE();
    tx = await sbtContract.renounceRole(OPERATOR_ROLE, wallet.address);
    console.log(`Tx hash: ${tx.hash}`);
    await tx.wait();
  }

  console.log("Ready \n");
}
