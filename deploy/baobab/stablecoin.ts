import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PriceOracle } from "../../types";
import { doExecute } from "../../tasks/utils";

const deployFunction: DeployFunction = async function ({
  ethers,
  network,
}: HardhatRuntimeEnvironment) {
  if (network.name !== "baobab") return;

  const priceOracle = (await ethers.getContract("PriceOracle")) as PriceOracle;

  const stables = [
    "0x53e6905F2E6650E2946F884DBcE7d5c116891aff",
    "0x020eDa56755da20872F8bBb19327402f781f06FD",
  ];
  for (const stable of stables) {
    try {
      await doExecute(priceOracle.registerStableCoin(stable));
    } catch (e) {}
  }
};
export default deployFunction;

deployFunction.dependencies = ["priceOracle"];

deployFunction.tags = ["stablecoin", "baobab"];
