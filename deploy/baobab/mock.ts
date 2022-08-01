import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PriceOracle } from "../../types";
import { doExecute } from "../../tasks/utils";

const deployFunction: DeployFunction = async function ({
  ethers,
  deployments,
  network,
}: HardhatRuntimeEnvironment) {
  if (network.name !== "baobab") return;
  const { deploy } = deployments;
  const { deployer, dev } = await ethers.getNamedSigners();

  const deployResult = await deploy("FixedPriceOracle", {
    from: deployer.address,
    contract: "FixedPriceOracle",
    proxy: {
      owner: dev.address,
      proxyContract: "OpenZeppelinTransparentProxy",
    },
    log: true,
  });

  const dai = "0x91cD54795be0A59Eaa949Ae4ea2D5288D0b11995";
  const oracle = (await ethers.getContract("PriceOracle")) as PriceOracle;
  await doExecute(oracle.registerTokenOracle(dai, deployResult.address));
  await doExecute(oracle.registerBaseToken(dai));
};
export default deployFunction;

deployFunction.dependencies = ["witnet"];

deployFunction.tags = ["mockOracle", "baobab"];
