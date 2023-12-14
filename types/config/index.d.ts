declare module "config" {
  export interface GasReporter {
    readonly ENABLED: boolean;
    readonly COINMARKETCAP: string;
    readonly CURRENCY: string;
    readonly TOKEN: string;
    readonly GAS_PRICE_API: string;
  }

  export interface Node {
    readonly GAS_PRICE_NODE: number | "auto";
    readonly LOGGING: boolean;
    readonly FORK: Fork;
  }

  export interface Fork {
    readonly FORK_PROVIDER_URI: string;
    readonly FORK_ENABLED: boolean;
  }

  export interface Deploy {
    readonly ADMIN: string;
    readonly OPERATOR: string;
    readonly MINTER: string;
    readonly BASE_URI_ACHIEVEMENTS: string;
  }

  export const INFURA_KEY: string;
  export const DEPLOYER_KEY: string;
  export const ETHERSCAN_API_KEY: string;
  export const POLYGONSCAN_API_KEY: string;
  export const POLYGONZKSCAN_API_KEY: string;
  export const BSCSCAN_API_KEY: string;
  export const BASESCAN_API_KEY: string;
  export const LINEASCAN_API_KEY: string;
  export const OPTIMIZM_API_KEY: string;
  export const GAS_PRICE: number;
  export const NODE: Node;
  export const GAS_REPORTER: GasReporter;
  export const DEPLOY: Deploy;
}
