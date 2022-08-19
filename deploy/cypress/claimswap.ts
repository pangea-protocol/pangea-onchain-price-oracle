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

  const factory = "0x3679c3766E70133Ee4A7eb76031E49d3d1f2B50c";
  const wklay = "0xe4f05A66Ec68B54A58B17c22107b02e0232cC817";

  const deployResult = await deploy("claimswapReserve", {
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

deployFunction.tags = ["claimswap", "cypress"];
