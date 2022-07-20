import {DeployFunction} from "hardhat-deploy/types";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {PriceOracle} from "../../types";
import {doExecute} from "../../tasks/utils";

const deployFunction: DeployFunction = async function ({
                                                         ethers,
                                                         network,
                                                       }: HardhatRuntimeEnvironment) {
  if (network.name !== "cypress") return;

  const priceOracle = (await ethers.getContract("PriceOracle")) as PriceOracle;

  const stables = [
    "0x5c74070fdea071359b86082bd9f9b3deaafbe32b",
    "0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167",
    "0x754288077d0ff82af7a5317c7cb8c444d421d103",
  ];
  for (const stable of stables) {
    try {
      await doExecute(priceOracle.registerStableCoin(stable));
    } catch (e) {
    }
  }
};
export default deployFunction;

deployFunction.dependencies = ["priceOracle"];

deployFunction.tags = ["stablecoin", "cypress"];
