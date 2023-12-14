import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-toolbox";

import "tsconfig-paths/register";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-watcher";
import "hardhat-deploy";
import "solidity-docgen";

import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";

import "./tasks/index";

import { HardhatUserConfig } from "hardhat/config";
import {
  DEPLOYER_KEY,
  INFURA_KEY,
  ETHERSCAN_API_KEY,
  POLYGONSCAN_API_KEY,
  POLYGONZKSCAN_API_KEY,
  BSCSCAN_API_KEY,
  BASESCAN_API_KEY,
  LINEASCAN_API_KEY,
  OPTIMIZM_API_KEY,
  GAS_PRICE,
  NODE,
  GAS_REPORTER,
} from "config";

const { GAS_PRICE_NODE, LOGGING } = NODE;
const { FORK_PROVIDER_URI, FORK_ENABLED } = NODE.FORK;

function typedNamedAccounts<T>(namedAccounts: { [key in string]: T }) {
  return namedAccounts;
}

const zkSyncTestnet =
  process.env.NODE_ENV == "test"
    ? {
        url: "http://localhost:3050",
        ethNetwork: "http://localhost:8545",
        zksync: true,
      }
    : {
        url: "https://zksync2-testnet.zksync.dev",
        ethNetwork: "goerli",
        zksync: true,
        verifyURL: "https://zksync2-testnet-explorer.zksync.dev/contract_verification", // Verification endpoint
      };

const config: HardhatUserConfig = {
  zksolc: {
    version: "1.3.16", // Uses latest available in https://github.com/matter-labs/zksolc-bin/
    settings: {},
  },
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  typechain: {
    outDir: "types/typechain-types",
  },
  networks: {
    hardhat: {
      gasPrice: GAS_PRICE_NODE,
      loggingEnabled: LOGGING,
      forking: {
        url: FORK_PROVIDER_URI,
        enabled: FORK_ENABLED,
      },
      zksync: false,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      zksync: false,
    },
    zkSyncTestnet,
    zkSyncMainnet: {
      url: "https://mainnet.era.zksync.io",
      ethNetwork: "mainnet", // Can also be the RPC URL of the network (e.g. `https://goerli.infura.io/v3/<API_KEY>`)
      zksync: true,
      verifyURL: "https://zksync2-mainnet-explorer.zksync.io/contract_verification", // Verification endpoint
      gasPrice: 2100000000,
    },
    zkEVMMainnet: {
      url: `https://zkevm-rpc.com`,
      accounts: [DEPLOYER_KEY],
      zksync: false,
    },
    zkEVMTestnet: {
      url: `https://rpc.public.zkevm-test.net`,
      accounts: [DEPLOYER_KEY],
      zksync: false,
    },
    scrollSepolia: {
      url: "https://sepolia-rpc.scroll.io",
      accounts: [DEPLOYER_KEY],
    },
    scrollMainnet: {
      url: "https://rpc.scroll.io/",
      accounts: [DEPLOYER_KEY],
      gasPrice: 424483200,
    },
    optimismMainnet: {
      url: "https://mainnet.optimism.io",
      accounts: [DEPLOYER_KEY],
    },
    optimismGoerli: {
      url: "https://optimism-goerli.publicnode.com",
      accounts: [DEPLOYER_KEY],
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
      chainId: 1,
      accounts: [DEPLOYER_KEY],
      zksync: false,
    },
    baseMainnet: {
      url: "https://mainnet.base.org",
      accounts: [DEPLOYER_KEY],
    },
    baseGoerli: {
      url: "https://goerli.base.org",
      accounts: [DEPLOYER_KEY],
      gasPrice: 1000000000,
    },
    baseLocal: {
      url: "http://localhost:8545",
      accounts: [DEPLOYER_KEY],
      gasPrice: 1000000000,
    },
    lineaTestnet: {
      url: `https://rpc.goerli.linea.build/`,
      accounts: [DEPLOYER_KEY],
      chainId: 59140,
      gasPrice: 1000000007,
    },
    lineaMainnet: {
      url: `https://linea-mainnet.infura.io/v3/${INFURA_KEY}`,
      accounts: [DEPLOYER_KEY],
    },
    zoraGoerli: {
      url: "https://testnet.rpc.zora.energy/",
      accounts: [DEPLOYER_KEY],
      gasPrice: 2000000008,
    },
    zoraMainnet: {
      url: "https://rpc.zora.energy/",
      accounts: [DEPLOYER_KEY],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
      chainId: 5,
      accounts: [DEPLOYER_KEY],
      zksync: false,
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
      chainId: 137,
      accounts: [DEPLOYER_KEY],
    },
    polygonMumbai: {
      url: `https://rpc-mumbai.maticvigil.com/`,
      chainId: 80001,
      accounts: [DEPLOYER_KEY],
      zksync: false,
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      accounts: [DEPLOYER_KEY],
      zksync: false,
    },
    bscTestnet: {
      url: "https://bsc-testnet.public.blastapi.io",
      chainId: 97,
      accounts: [DEPLOYER_KEY],
      zksync: false,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
      zkEVMMainnet: POLYGONZKSCAN_API_KEY,
      zkEVMTestnet: POLYGONZKSCAN_API_KEY,
      scrollSepolia: "scroll_API_KEY",
      scrollMainnet: "scroll_API_KEY",
      bsc: BSCSCAN_API_KEY,
      bscTestnet: BSCSCAN_API_KEY,
      baseGoerli: BASESCAN_API_KEY,
      baseMainnet: BASESCAN_API_KEY,
      lineaTestnet: LINEASCAN_API_KEY,
      lineaMainnet: LINEASCAN_API_KEY,
      optimismGoerli: OPTIMIZM_API_KEY,
      optimismMainnet: OPTIMIZM_API_KEY,
      zoraGoerli: ETHERSCAN_API_KEY,
      zoraMainnet: ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "zkEVMMainnet",
        chainId: 1101,
        urls: {
          apiURL: "https://explorer.mainnet.zkevm-test.net/api",
          browserURL: "https://explorer.mainnet.zkevm-test.net/",
        },
      },
      {
        network: "zkEVMTestnet",
        chainId: 1442,
        urls: {
          apiURL: "https://testnet-zkevm.polygonscan.com/api",
          browserURL: "https://testnet-zkevm.polygonscan.com",
        },
      },
      {
        network: "scrollSepolia",
        chainId: 534351,
        urls: {
          apiURL: "https://api-sepolia.scrollscan.com/api",
          browserURL: "https://sepolia.scrollscan.com",
        },
      },
      {
        network: "scrollMainnet",
        chainId: 534352,
        urls: {
          apiURL: "https://api.scrollscan.com/api",
          browserURL: "https://scrollscan.com/",
        },
      },
      {
        network: "optimismMainnet",
        chainId: 10,
        urls: {
          apiURL: "https://api-optimistic.etherscan.io/api",
          browserURL: "https://explorer.optimism.io",
        },
      },
      {
        network: "optimismGoerli",
        chainId: 420,
        urls: {
          apiURL: "https://api-goerli-optimistic.etherscan.io/",
          browserURL: "https://goerli-explorer.optimism.io",
        },
      },

      {
        network: "baseGoerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org",
        },
      },
      {
        network: "baseMainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "lineaMainnet",
        chainId: 59144,
        urls: {
          apiURL: "https://api.lineascan.build/api",
          browserURL: "https://lineascan.build/",
        },
      },
      {
        network: "lineaTestnet",
        chainId: 59140,
        urls: {
          apiURL: "https://api-testnet.lineascan.build/api",
          browserURL: "https://goerli.lineascan.build/address",
        },
      },
      {
        network: "zoraGoerli",
        chainId: 999,
        urls: {
          apiURL: "https://testnet.explorer.zora.energy/api",
          browserURL: "https://testnet.explorer.zora.energy",
        },
      },
      {
        network: "zoraMainnet",
        chainId: 7777777,
        urls: {
          apiURL: "https://explorer.zora.energy/api",
          browserURL: "https://explorer.zora.energy",
        },
      },
    ],
  },
  namedAccounts: typedNamedAccounts({
    deployer: 0,
    admin: "0x0d0D5Ff3cFeF8B7B2b1cAC6B6C27Fd0846c09361",
    minter: "0x381c031baa5995d0cc52386508050ac947780815",
    operator: "0x381c031baa5995d0cc52386508050ac947780815",
  }),
  docgen: {
    pages: "files",
  },
  watcher: {
    test: {
      tasks: [{ command: "test", params: { testFiles: ["{path}"] } }],
      files: ["./test/**/*"],
      verbose: true,
    },
  },
  gasReporter: {
    enabled: GAS_REPORTER.ENABLED,
    coinmarketcap: GAS_REPORTER.COINMARKETCAP,
    currency: GAS_REPORTER.CURRENCY,
    token: GAS_REPORTER.TOKEN,
    gasPrice: GAS_PRICE,
  },
};

export default config;
