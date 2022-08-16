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

  const factory = "0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654";

  const deployResult = await deploy("KlayswapReserve", {
    from: deployer.address,
    contract: "KlayswapReserve",
    proxy: {
      owner: dev,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [factory],
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

deployFunction.tags = ["klayswap", "cypress"];
