import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PriceOracle } from "../../types";
import { doExecute } from "../../tasks/utils";

const deployFunction: DeployFunction = async function ({
  ethers,
  deployments,
  network,
}: HardhatRuntimeEnvironment) {
  // if (network.name !== "baobab") return;
  const { deploy } = deployments;
  const { deployer, dev } = await ethers.getNamedSigners();

  const factory = "0xd2e72adcdd82e687158541fe196d53ed60caac09";

  const deployResult = await deploy("KlayswapReserve", {
    from: deployer.address,
    contract: "KlayswapReserve",
    proxy: {
      owner: dev.address,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [factory],
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

deployFunction.tags = ["klayswap", "baobab"];
