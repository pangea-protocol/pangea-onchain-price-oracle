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
    "0x3185206Bc408D4a0cb948c4D245Bfbda50067aeC",
    "0x91cD54795be0A59Eaa949Ae4ea2D5288D0b11995",
  ];
  for (const stable of stables) {
    try {
      await doExecute(priceOracle.registerStableCoin(stable));
    } catch (e) {}
  }
};
export default deployFunction;

deployFunction.dependencies = ["priceOracle"];

deployFunction.tags = ["stablecoins", "baobab"];
