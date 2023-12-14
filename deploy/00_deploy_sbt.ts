import { DeployFunction } from "hardhat-deploy/types";
import { typedDeployments } from "@utils";
import { DEPLOY } from "config";

const migrate: DeployFunction = async ({ deployments, getNamedAccounts }) => {
  const { deploy, execute, read } = typedDeployments(deployments);
  const { deployer, admin, operator } = await getNamedAccounts();

  const premiumPrice = "10000000000000000"; // 0.01 ETH

  await deploy("Rubyscore_Profile", {
    from: deployer,
    args: [admin, operator],
    log: true,
  });

  console.log("Setting PremiumPrice");
  await execute("Rubyscore_Profile", { from: deployer, log: true }, "updatePremiumPrice", premiumPrice);

  if (deployer != admin) {
    console.log("Revoke operator role");
    const OPERATOR_ROLE = await read("Rubyscore_Profile", "OPERATOR_ROLE");
    await execute(
      "Rubyscore_Profile",
      { from: deployer, log: true },
      "renounceRole",
      OPERATOR_ROLE,
      deployer
    );
  }

  console.log("Ready \n");
};

migrate.tags = ["sbt"];

export default migrate;
