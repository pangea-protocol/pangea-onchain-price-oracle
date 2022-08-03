# Pangea ONCHAIN Price Oracle Contracts

This repository contains the smart contracts to calculate the on-chain token's dollar price. Price is calucated using
the liquidity pool of klaytn DEXes (pangea, klayswap, claimswap, pala, and so on...).

### WARNING

The price is determined by the liquidity at the time, so It is dangerous to use this as an oracle contract.

## Usage

### 1. `hardhat task`

````shell
yarn hardhat price kdai # DAI price
> price: 0.998156 $

yarn hardhat price klay # KLAY price
> price 0.290369 $

yarn hardhat price KETH # ETH price
> price 1625.915993 $

yarn hardhat price 0x34d21b1e550d73cee41151c77f3c73359527a396 # ETH price with
> price : 2824.156292 $ 
````

### 2. `contract` interfaces

* cypress : `0xE37338548438b71313607259ecC45d93E380932a`
* baobab : `0x1386968c3fd2109f68dA87d9Cf9A967De72EBB6A`

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

### References

1. The price of base token is fetched
   through [the witnet oracle](https://feeds.witnet.io/klaytn/klaytn-testnet_klay-usdt_6).
