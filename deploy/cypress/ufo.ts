import {DeployFunction} from "hardhat-deploy/types";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {PriceOracle} from "../../types";
import {doExecute} from "../../tasks/utils";

const deployFunction: DeployFunction = async function ({
                                                         ethers,
                                                         deployments,
                                                         network,
                                                       }: HardhatRuntimeEnvironment) {
  if (network.name !== "cypress") return;
  const {deploy} = deployments;
  const {deployer, dev} = await ethers.getNamedSigners();

  const factory = "0x165e04633A90ef31fc25958fffbD15966eCfe929";
  const wklay = "0x8dfbb066e2881c85749cce3d9ea5c7f1335b46ae";

  const deployResult = await deploy("ufoReserve", {
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

deployFunction.tags = ["ufo", "cypress"];
