import { DeployFunction } from "hardhat-deploy/types";
import { typedDeployments } from "@utils";

const migrate: DeployFunction = async ({ deployments, getNamedAccounts }) => {
  const { deploy, execute, read } = typedDeployments(deployments);
  const { deployer, admin, operator, minter } = await getNamedAccounts();

  const baseURI = "ipfs://";
  const price = "300000000000000"; // 0.0003 ETH
  const name = "Rubyscore_Achievement";
  const symbol = "Rubyscore_Achievement";

  await deploy("Rubyscore_Achievement", {
    from: deployer,
    args: [admin, operator, minter, baseURI, name, symbol],
    log: true,
  });

  console.log("Setting PremiumPrice");
  await execute("Rubyscore_Achievement", { from: deployer, log: true }, "setPrice", price);

  if (deployer != admin) {
    console.log("Revoke operator role");
    const OPERATOR_ROLE = await read("Rubyscore_Achievement", "OPERATOR_ROLE");
    await execute(
      "Rubyscore_Achievement",
      { from: deployer, log: true },
      "renounceRole",
      OPERATOR_ROLE,
      deployer
    );
  }
  console.log("Ready \n");
};

migrate.tags = ["ach"];

export default migrate;
