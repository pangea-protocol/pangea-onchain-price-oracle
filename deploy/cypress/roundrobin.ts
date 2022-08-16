import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PriceOracle } from "../../types";
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

  const factory = "0x6043cF3482ee4D7bB28b2dDD2A5ef84c5C62b5e0";
  const wklay = "0xf01f433268c277535743231c95c8e46783746d30";

  const deployResult = await deploy("roundRobin", {
    from: deployer.address,
    contract: "UniswapReserve",
    proxy: {
      owner: dev,
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

deployFunction.tags = ["roundrobin", "cypress"];
