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

  console.log(`Running deploy script for Rubyscore_Vote`);
  if (!DEPLOYER_KEY) throw "⛔️ Private key not detected! Add it to the .env file!";

  const provider = new Provider("https://mainnet.era.zksync.io");

  // Initialize the wallet.
  const wallet = new Wallet(DEPLOYER_KEY, provider);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  // Load contract
  const artifact = await deployer.loadArtifact("Rubyscore_Vote");

  // Estimate contract deployment fee
  console.log(`Estimate contract deployment fee`);
  const deploymentFee = await deployer.estimateDeployFee(artifact, []);

  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  // Deploy this contract. The returned object will be of a `Contract` type,
  const vote = await deployer.deploy(artifact, []);

  //obtain the Constructor Arguments
  console.log(`Constructor args: \n${[]} \n${vote.interface.encodeDeploy([])}`);

  // Show the contract info.
  const contractAddress = vote.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  console.log("Ready \n");
}
