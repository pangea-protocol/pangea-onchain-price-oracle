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

  const factory = "0x79841BFF57F826aB6F1AE8dBC68a564375AA878F";
  const wklay = "0x60Cd78c3edE4d891455ceAeCfA97EECD819209cF";

  const deployResult = await deploy("claimswapReserve", {
    from: deployer.address,
    contract: "UniswapReserve",
    proxy: {
      owner: dev.address,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [factory, wklay],
        },
      },
    },
    log: true,
  });

  if (deployResult.newlyDeployed) {
    const contract = (await ethers.getContract("PriceOracle")) as PriceOracle;
    await doExecute(contract.registerPairReserve(deployResult.address));
  }
};
export default deployFunction;

deployFunction.dependencies = ["priceOracle"];

deployFunction.tags = ["claimswap", "baobab"];
