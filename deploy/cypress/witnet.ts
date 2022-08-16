import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PriceOracle, WitnetExternalOracle } from "../../types";
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

  const router = "0xD39D4d972C7E166856c4eb29E54D3548B4597F53";

  await deploy("WitnetExternalOracle", {
    from: deployer.address,
    contract: "WitnetExternalOracle",
    proxy: {
      owner: dev,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [router],
        },
      },
    },
    log: true,
    gasPrice: BigNumber.from("250000000000"),
  });

  const oracle = (await ethers.getContract("PriceOracle")) as PriceOracle;
  const witnet = (await ethers.getContract(
    "WitnetExternalOracle"
  )) as WitnetExternalOracle;

  for (const klay of [
    ethers.constants.AddressZero, // address(0)
    "0xe4f05A66Ec68B54A58B17c22107b02e0232cC817", // claimswap's wklay
    "0x5819b6af194a78511c79c85ea68d2377a7e9335f", // definix's wklay
    "0x2ff5f6de2287ca3075232127277e53519a77947c", // pala's wklay
    "0xf01f433268c277535743231c95c8e46783746d30", // roundrobin's wklay
    "0x8dfbb066e2881c85749cce3d9ea5c7f1335b46ae", // ufo's wklay
    "0xFF3e7cf0C007f919807b32b30a4a9E7Bd7Bc4121", // pangea's wklay
  ]) {
    const value = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("Price-KLAY/USD-6")
    );
    await doExecute(
      witnet.register(klay, value, 6, {
        gasPrice: BigNumber.from("250000000000"),
      })
    );
    await doExecute(
      oracle.registerTokenOracle(klay, witnet.address, {
        gasPrice: BigNumber.from("250000000000"),
      })
    );
  }

  await doExecute(
    oracle.registerBaseToken(ethers.constants.AddressZero, {
      gasPrice: BigNumber.from("250000000000"),
    })
  );

  for (const usdt of [
    "0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167", // orbit USDT
    "0xd6dAb4CfF47dF175349e6e7eE2BF7c40Bb8C05A3", // Synapse Assets
  ]) {
    const value = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("Price-USDT/USD-6")
    );

    await doExecute(
      witnet.register(usdt, value, 6, {
        gasPrice: BigNumber.from("250000000000"),
      })
    );
    await doExecute(
      oracle.registerTokenOracle(usdt, witnet.address, {
        gasPrice: BigNumber.from("250000000000"),
      })
    );
    await doExecute(
      oracle.registerBaseToken(usdt, {
        gasPrice: BigNumber.from("250000000000"),
      })
    );
  }
};
export default deployFunction;

deployFunction.dependencies = ["priceOracle"];

deployFunction.tags = ["witnet", "cypress"];
