## ProjectX smart contracts

This repo will have a code of ProjectX Smart Contracts.

## Setting project

### Install dependencies

```sh
yarn install
```

---

### Compile contracts

#### EVM network(ETH, POLYGON, BSC, BASE, LINEA, ZORA ...)

```sh
yarn compile
```

#### zkSync network

```sh
yarn compile --network zkSyncTestnet
```

---

### Migrate contracts

#### EVM network(ETH, POLYGON, BSC, BASE, LINEA, ZORA ...)

```sh
yarn migrate:<NETWORK> (mainnet, goerli, polygon, polygonMumbai, bsc, bscTestnet)
```

#### zkSync network

```sh
yarn hardhat deploy-zksync --script zk_01_deploy_achievements.ts --network zkSyncTestnet
```

or

```sh
yarn hardhat deploy-zksync --script zk_01_deploy_achievements.ts --network zkSyncMainnet
```

---

### Verify contracts

#### EVM network(ETH, POLYGON, BSC, BASE, LINEA, ZORA ...)

To verify the contract, you must specify the names of the contracts for verification through "," WITHOUT SPACES

```sh
yarn verify:<NETWORK> <NAME_CONTRACT_FIRST>,<NAME_CONTRACT_SECOND>
```

#### zkSync network

```sh
hh verify --network zkSyncTestnet <CONTRACT_NAME> <CONSTRUCTOR_ARG_0> <CONSTRUCTOR_ARG_1> <CONSTRUCTOR_ARG_N>
```

---

### Tests contracts

```sh
# Run Tests
yarn test

# Run test watcher
yarn test:watch
```

---

### Node hardhat(Localfork)

NOTE:// To work with a node or fork, you need to run the node in a separate console

```sh
# Run Node hardhat (For run localfork setting config { FORK_ENABLED: true, FORK_PROVIDER_URI: "https://...."})
yarn node

# Run test watcher
yarn test:node
```

---

### Coverage

```sh
yarn coverage
```

---

### Gas reporter

You can start the gas reporter either through a separate gas reporter script through "**yarn**" or by changing the variable in the config "**GAS_REPORTER.ENABLED**" when running tests

```sh
# Native gas reporter
yarn gas-reporter

# GAS_REPORTER.ENABLED = true
yarn test
```

---

### Clean

```sh
# Rm artifacts, cache, typechain-types
yarn clean

# Rm deployments for choose network
yarn clean:deployments <NETWORK>
```

### Linter

```sh
# Checking code style for .ts, .sol
yarn lint

# Run fix code style for .ts, .sol
yarn lint:fix

# Checking code style for .ts
yarn lint:ts

# Run fix code style for .ts
yarn lint:ts:fix

# Checking code style for .sol
yarn lint:sol

# Run fix code style for .sol
yarn lint:sol:fix
```

## Auto audit with slither

To run the analyzer, you must first install it globally

To audit all contracts, use the command :

```sh
slither .
```

To exclude warnings in subsequent audits, use :

```sh
slither . --triage
```

## Deployment config

```
{
  "INFURA_KEY": "",
  "DEPLOYER_KEY": "",
  "ETHERSCAN_API_KEY": "",
  "POLYGONSCAN_API_KEY": "",
  "BSCSCAN_API_KEY": "",
  "GAS_PRICE": "",
  "NODE": {
    "GAS_PRICE": "auto",
    "LOGGING": true,
    "FORK": {
      "FORK_PROVIDER_URI": "",
      "FORK_ENABLED": false
    }
  },
  "GAS_REPORTER": {
    "ENABLED": false,
    "COINMARKETCAP": "",
    "CURRENCY": "USD",
    "TOKEN": "ETH",
    "GAS_PRICE_API": "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice"
  },
  "DEPLOY": {}
}
```
