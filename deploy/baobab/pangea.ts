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

  const factory = "0x0846b68C4C72C8940B402217CDfD63706071bEc5";
  const wklay = "0x3e825cbA8d59Eb0E62A24Db1A8F85158d30A26c3";

  const deployResult = await deploy("PangeaReserve", {
    from: deployer.address,
    contract: "PangeaReserve",
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

deployFunction.tags = ["pangea", "baobab"];
