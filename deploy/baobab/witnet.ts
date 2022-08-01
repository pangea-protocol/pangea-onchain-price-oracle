import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PriceOracle, WitnetExternalOracle } from "../../types";
import { doExecute } from "../../tasks/utils";

const deployFunction: DeployFunction = async function ({
  ethers,
  deployments,
  network,
}: HardhatRuntimeEnvironment) {
  if (network.name !== "baobab") return;
  const { deploy } = deployments;
  const { deployer, dev } = await ethers.getNamedSigners();

  const router = "0xeD074DA2A76FD2Ca90C1508930b4FB4420e413B0";

  await deploy("WitnetExternalOracle", {
    from: deployer.address,
    contract: "WitnetExternalOracle",
    proxy: {
      owner: dev.address,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [router],
        },
      },
    },
    log: true,
  });

  const oracle = (await ethers.getContract("PriceOracle")) as PriceOracle;
  const witnet = (await ethers.getContract(
    "WitnetExternalOracle"
  )) as WitnetExternalOracle;

  for (const klay of [
    ethers.constants.AddressZero, // address(0)
    "0x60Cd78c3edE4d891455ceAeCfA97EECD819209cF", // claimswap's wklay
    "0x0339d5Eb6D195Ba90B13ed1BCeAa97EbD198b106", // pangea's wklay
  ]) {
    const value = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("Price-KLAY/USD-6")
    );
    await doExecute(witnet.register(klay, value, 6));
  }
  await doExecute(
    oracle.registerTokenOracle(ethers.constants.AddressZero, witnet.address)
  );
  await doExecute(
    oracle.registerBaseToken(ethers.constants.AddressZero)
  )

  for (const usdt of [
    "0x3185206Bc408D4a0cb948c4D245Bfbda50067aeC",
  ]) {
    const value = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("Price-USDT/USD-6")
    );

    await doExecute(witnet.register(usdt, value, 6));
    await doExecute(oracle.registerTokenOracle(usdt, witnet.address));
    await doExecute(oracle.registerBaseToken(usdt));
  }
};
export default deployFunction;

deployFunction.dependencies = ["priceOracle"];

deployFunction.tags = ["witnet", "baobab"];
