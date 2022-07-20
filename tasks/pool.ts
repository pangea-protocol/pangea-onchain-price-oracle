import { task } from "hardhat/config";
import {
  IKlayswapExchange,
  IKlayswapFactory,
  IUniswapV2Factory,
  IUniswapV2Pair,
} from "../types";
import { readAddressFrom, readTokenAddress } from "./utils";

task("klayswap:pool", "show pool address from klayswap")
  .addPositionalParam("tokenA", "address or symbol of tokenA")
  .addPositionalParam("tokenB", "address or symbol of tokenB")
  .setAction(async ({ tokenA, tokenB }, { ethers, network }) => {
    const factoryAddress = readAddressFrom(network.name, "klayswap", "Factory");
    if (factoryAddress === ethers.constants.AddressZero)
      throw new Error(
        `${network.name}에 klayswap Factory 주소가 존재하지 않습니다.`
      );
    const klayswapFactory = (await ethers.getContractAt(
      "IKlayswapFactory",
      factoryAddress
    )) as IKlayswapFactory;
    const tokenAAddress = readTokenAddress(tokenA, network.name);
    const tokenBAddress = readTokenAddress(tokenB, network.name);

    const poolAddress = await klayswapFactory.tokenToPool(
      tokenAAddress,
      tokenBAddress
    );

    const pool = (await ethers.getContractAt(
      "IKlayswapExchange",
      poolAddress
    )) as IKlayswapExchange;
    console.log(await pool.tokenA());
    console.log(await pool.tokenB());
    console.log(poolAddress);
  });

task("pala").setAction(async ({}, { ethers }) => {
  const pool = (await ethers.getContractAt(
    "IUniswapV2Pair",
    "0xA14a5969459027eb0eAaC498F5E871B6aB4994a4"
  )) as IUniswapV2Pair;
  console.log("roundrobin : ", await pool.factory());
});

task("claimswap:pool", "show pool address from claimswap")
  .addPositionalParam("tokenA", "address or symbol of tokenA")
  .addPositionalParam("tokenB", "address or symbol of tokenB")
  .setAction(async ({ tokenA, tokenB }, { ethers, network }) => {
    const factoryAddress = readAddressFrom(
      network.name,
      "claimswap",
      "UniswapV2Factory"
    );
    if (factoryAddress === ethers.constants.AddressZero)
      throw new Error(
        `${network.name}에 UniswapV2Factory 주소가 존재하지 않습니다.`
      );
    const claimSwapFactory = (await ethers.getContractAt(
      "IUniswapV2Factory",
      factoryAddress
    )) as IUniswapV2Factory;
    const wklayAddress = readAddressFrom(network.name, "claimswap", "WKLAY");

    let tokenAAddress = readTokenAddress(tokenA, network.name);
    let tokenBAddress = readTokenAddress(tokenB, network.name);
    tokenAAddress =
      tokenAAddress === ethers.constants.AddressZero
        ? wklayAddress
        : tokenAAddress;
    tokenBAddress =
      tokenBAddress === ethers.constants.AddressZero
        ? wklayAddress
        : tokenBAddress;

    const poolAddress = await claimSwapFactory.getPair(
      tokenAAddress,
      tokenBAddress
    );

    console.log(poolAddress);
  });
