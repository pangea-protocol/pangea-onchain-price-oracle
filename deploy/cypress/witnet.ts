import {DeployFunction} from "hardhat-deploy/types";
import {HardhatRuntimeEnvironment} from "hardhat/types";

const deployFunction: DeployFunction = async function ({
                                                         ethers,
                                                         deployments,
                                                         network,
                                                       }: HardhatRuntimeEnvironment) {
  if (network.name !== "cypress") return;
  const {deploy} = deployments;
  const {deployer, dev} = await ethers.getNamedSigners();

  const router = "0xD39D4d972C7E166856c4eb29E54D3548B4597F53";

  await deploy("WitnetOracle", {
    from: deployer.address,
    contract: "WitnetOracle",
    proxy: {
      owner: dev.address,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [router],
        },
      },
    },
    log: true,
  });
};
export default deployFunction;

deployFunction.dependencies = ["priceOracle"];

deployFunction.tags = ["witnet", "cypress"];
