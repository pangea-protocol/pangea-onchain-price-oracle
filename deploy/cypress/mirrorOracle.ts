import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { MirrorOracle__factory, PriceOracle } from "../../types";
import { doExecute } from "../../tasks/utils";
import { BigNumber } from "ethers";

const deployFunction: DeployFunction = async function ({
  ethers,
  deployments,
  network,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  if (network.name !== "cypress") return;
  const { deploy } = deployments;
  const { deployer } = await ethers.getNamedSigners();
  const { dev } = await getNamedAccounts();

  const contract = (await ethers.getContract("PriceOracle")) as PriceOracle;

  const deployResult = await deploy("MirrorOracle", {
    from: deployer.address,
    contract: "MirrorOracle",
    proxy: {
      owner: dev,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [contract.address],
        },
      },
    },
    log: true,
    gasPrice: BigNumber.from("250000000000"),
  });

  const mirrorOracle = await MirrorOracle__factory.connect(
    deployResult.address,
    deployer
  );

  const portalUSDC = "0x608792Deb376CCE1c9FA4D0E6B7b44f507CfFa6A";
  const oUSDC = "0x754288077D0fF82AF7a5317C7CB8c444D421d103";
  await doExecute(mirrorOracle.register(portalUSDC, oUSDC));
  await doExecute(
    contract.registerTokenOracle(portalUSDC, deployResult.address)
  );
};
export default deployFunction;

deployFunction.dependencies = ["priceOracle"];

deployFunction.tags = ["mirrorOracle", "cypress"];
