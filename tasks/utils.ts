import path from "path";
import fs from "fs";
import { BigNumber, ContractTransaction, ethers } from "ethers";

type AddressMap = { [key: string]: { [v: string]: string } };

export function readAddressFrom(
  network: string,
  filename: string,
  searchValue: string
) {
  const fPath = path.join(__dirname, "./address", network, `${filename}.json`);

  const addressMap = JSON.parse(fs.readFileSync(fPath, "utf-8")) as AddressMap;

  for (const [key, value] of Object.entries(addressMap)) {
    if (value["name"] === searchValue) return key;
  }

  return "0x0000000000000000000000000000000000000000";
}

export async function doExecute(transaction: Promise<ContractTransaction>) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const tx = await transaction;
  const receipt = await tx.wait();
  // KLAYTN GASPRICE
  const GAS_PRICE = tx.gasPrice!;

  const result = {
    gasUsed: receipt.gasUsed.mul(GAS_PRICE),
    price:
      receipt.gasUsed
        .mul(GAS_PRICE)
        .mul(100000)
        .div(BigNumber.from(10).pow(18))
        .toNumber() / 100000,
  };

  console.log(`TX GAS USED : ${result.price} (${result.gasUsed})`);
}

export function readTokenAddress(value: string, network: string) {
  if (ethers.utils.isAddress(value)) {
    return value;
  }

  if (value.toLowerCase() === "klay") {
    return "0x0000000000000000000000000000000000000000";
  }

  const fPath = path.join(__dirname, "./address", network, `tokens.json`);

  const addressMap = JSON.parse(fs.readFileSync(fPath, "utf-8")) as AddressMap;

  for (const [k, v] of Object.entries(addressMap)) {
    if (
      v["symbol"].toLowerCase() === value.toLowerCase() ||
      v["name"].toLowerCase() == value.toLowerCase()
    )
      return k;
  }

  return "0x0000000000000000000000000000000000000000";
}
