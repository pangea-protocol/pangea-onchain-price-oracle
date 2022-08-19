import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PriceOracle } from "../../types";
import { doExecute } from "../../tasks/utils";
import { BigNumber } from "ethers";

const deployFunction: DeployFunction = async function ({
  ethers,
  deployments,
  network,
}: HardhatRuntimeEnvironment) {
  if (network.name !== "cypress") return;
  const { deploy } = deployments;
  const { deployer, dev } = await ethers.getNamedSigners();

  const factory = "0x3d94b5E3b83CbD52B9616930D33515613ADfAd67";
  const wklay = "0xFF3e7cf0C007f919807b32b30a4a9E7Bd7Bc4121";

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
    gasPrice: BigNumber.from("250000000000"),
  });

  if (deployResult.newlyDeployed) {
    const contract = (await ethers.getContract("PriceOracle")) as PriceOracle;
    await doExecute(
      contract.registerPairReserve(deployResult.address, {
        gasPrice: BigNumber.from("250000000000"),
      })
    );
  }
};
export default deployFunction;

deployFunction.dependencies = ["priceOracle"];

deployFunction.tags = ["pangea", "baobab"];
