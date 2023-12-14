import { utils, Wallet, Provider } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

import { DEPLOYER_KEY } from "config";

export default async function (hre: HardhatRuntimeEnvironment) {
  if (!hre.network.zksync) {
    console.log("Skip zk deployments for EVM network!");
    return;
  }

  console.log(`Running deploy script for Rubyscore_Achievement`);
  if (!DEPLOYER_KEY) throw "⛔️ Private key not detected! Add it to the .env file!";

  const { admin, operator, minter } = await hre.getNamedAccounts();
  const baseURI = "ipfs://";
  const name = "Rubyscore_zkSync";
  const symbol = "Rubyscore_zkSync";
  const deployParams = [admin, operator, minter, baseURI, name, symbol];
  const price = "300000000000000"; // 0.0003 ETH

  const provider = new Provider("https://mainnet.era.zksync.io");

  // Initialize the wallet.
  const wallet = new Wallet(DEPLOYER_KEY, provider);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  // Load contract
  const artifact = await deployer.loadArtifact("Rubyscore_Achievement");

  // Estimate contract deployment fee
  console.log(`Estimate contract deployment fee`);
  const deploymentFee = await deployer.estimateDeployFee(artifact, deployParams);

  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  // Deploy this contract. The returned object will be of a `Contract` type,
  const achievements = await deployer.deploy(artifact, deployParams);

  //obtain the Constructor Arguments
  console.log(`Constructor args: \n${deployParams} \n${achievements.interface.encodeDeploy(deployParams)}`);

  // Show the contract info.
  const contractAddress = achievements.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  console.log("Setting PremiumPrice");
  let tx = await achievements.setPrice(price);
  console.log(`Tx hash: ${tx.hash}`);
  await tx.wait();

  if (wallet.address != admin) {
    console.log("Revoke operator role");
    const OPERATOR_ROLE = await achievements.OPERATOR_ROLE();
    tx = await achievements.renounceRole(OPERATOR_ROLE, wallet.address);
    console.log(`Tx hash: ${tx.hash}`);
    await tx.wait();
  }

  console.log("Ready \n");
}
