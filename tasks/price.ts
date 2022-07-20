import { task } from "hardhat/config";
import { PriceOracle } from "../types";
import { readTokenAddress } from "./utils";
import { BigNumber } from "ethers";

function toDollar(amount: BigNumber) {
  return amount.toNumber() / 10 ** 6;
}

task("price", "show dollar price of token in onchain Liquidity")
  .addPositionalParam("token", "address or symbol of tokenA")
  .addPositionalParam(
    "referenceToken",
    "address or symbol of referenceToken",
    ""
  )
  .setAction(async ({ token, referenceToken }, { ethers, network }) => {
    const priceOracle = (await ethers.getContract(
      "PriceOracle"
    )) as PriceOracle;

    let price;
    if (referenceToken != "") {
      const tokenAddress = readTokenAddress(token, network.name);
      const referenceAddress = readTokenAddress(referenceToken, network.name);
      price = await priceOracle.consultPriceFrom(
        tokenAddress,
        referenceAddress
      );
    } else if (token.toLowerCase() == "klay") {
      price = await priceOracle.consultKlayPrice();
    } else {
      const tokenAddress = readTokenAddress(token, network.name);
      price = await priceOracle.consultPrice(tokenAddress);
    }

    console.log(`price : ${toDollar(price)} $`);
  });
