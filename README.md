# Pangea ONCHAIN Price Oracle Contracts

This repository contains the smart contracts to calculate the on-chain token's dollar price. Price is calucated using
the liquidity pool of klaytn DEXes (pangea, klayswap, claimswap, pala, and so on...).

### WARNING

The price is determined by the liquidity at the time, so It is dangerous to use this as an oracle contract.

## Usage

### 1. `hardhat task`

````shell
yarn hardhat price kdai # DAI price
> price: 1 $

yarn hardhat price klay # KLAY price
> price 0.700574 $

yarn hardhat price KETH # ETH price
> price 2824.156292 $

yarn hardhat price 0x34d21b1e550d73cee41151c77f3c73359527a396 # ETH price with
> price : 2824.156292 $ 
````

### 2. `contract` interfaces

* cypress : `0x9BFDf8c6bB855F578D3b5e441F958496aE46eC24`
* baobab : `0xc84866ad438e80C0CDe5A6eD0AF969E605982A70`

````solidity
interface IPriceOracle {
    /// @dev If decimal is 6 and price is 700,574, it means 0.700574$
    function DECIMAL() external view returns (uint256 decimal);

    /// @notice look up KLAY dollar price (units : 10 ^ -6 $)
    function consultKlayPrice() external view returns (uint256 price);

    /// @notice look up Token dollar price (units : 10 ^ -6 $)
    /// @param token token address
    /// @dev if there is no pair pool with (KLAY / DAI / USDC / USDT), the price will be 0
    function consultPrice(address token) external view returns (uint256 price);

    /// @notice look up Token dollar price using reference token (units : 10 ^ -6 $)
    /// @param token token address
    /// @param referenceTokens list of token address to refer dollar price 
    /// @dev infer the dollar price based on the pair pool with the reference token
    function consultPriceFrom(address token, address[] memory referenceTokens) external view returns (uint256 price);
}
````

### Installation

````shell
yarn install
````

### Limitations

1. Assume the price of DAI/USDT/USDC is pegged to $1. if de-pegging happens, we will remove it from the stablecoin list.

2. The price of the klay is fetched
   through [the witnet oracle](https://feeds.witnet.io/klaytn/klaytn-testnet_klay-usdt_6).
