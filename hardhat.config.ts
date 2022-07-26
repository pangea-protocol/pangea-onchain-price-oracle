import "dotenv/config";
import "@nomiclabs/hardhat-solhint";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-abi-exporter";
import "@typechain/hardhat";
import "hardhat-deploy";
import "solidity-coverage";
import "./tasks";

import { HardhatUserConfig } from "hardhat/config";

const accounts = {
  mnemonic:
    process.env.MNEMONIC ||
    "test test test test test test test test test test test junk",
};

const config: HardhatUserConfig = {
  defaultNetwork: process.env.NETWORK ? process.env.NETWORK : "cypress",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      live: false,
      saveDeployments: true,
      tags: ["test", "local"],
      gasPrice: 250000000000,
      // Solidity-coverage overrides gasPrice to 1 which is not compatible with EIP1559
      hardfork: process.env.CODE_COVERAGE ? "berlin" : "london",
    },
    baobab: {
      chainId: 1001,
      url: "https://baobab.ken.stick.us/",
      accounts,
      gasPrice: 250000000000,
    },
    cypress: {
      chainId: 8217,
      url: "https://ken.stick.us/",
      accounts: [process.env.DEPLOYER_ADDRESS!, process.env.DEV_ADDRESS!],
      gasPrice: 250000000000,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      cypress: "0x2A2F23ff33671361010D357529BDF0adca9416Fc",
    },
    dev: {
      default: 1,
      cypress: "0x9906594cF4CC26b62fEf0eA53CE159F4d2Ad9a32",
    },
  },
  paths: {
    artifacts: "artifacts",
    cache: "cache",
    deploy: "deploy",
    deployments: "deployments",
    imports: "imports",
    sources: "contracts",
    tests: "test",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 9999999,
          },
        },
      },
    ],
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
  abiExporter: {
    path: "deployments/abis",
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
    pretty: false,
  },
  mocha: {
    timeout: 300000,
  },
};

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
export default config;
