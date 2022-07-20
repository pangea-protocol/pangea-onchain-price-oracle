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

  const factory = "0x6043cF3482ee4D7bB28b2dDD2A5ef84c5C62b5e0";
  const wklay = "0xf01f433268c277535743231c95c8e46783746d30";

  const deployResult = await deploy("roundRobin", {
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

deployFunction.tags = ["roundrobin", "cypress"];
