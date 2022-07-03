import { ethers, Contract } from "ethers";
import "dotenv/config";
import * as ballotContractJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import { CustomBallot } from "../typechain";

const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

async function main() {
  console.log("---------------SETUP WALLETS--------------");
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC, "m/44'/60'/0'/0/0")
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Wallet 1: Using address ${wallet.address} (Deployer)`);

  const wallet2 =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC, "m/44'/60'/0'/0/1")
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Wallet 2: Using address ${wallet2.address}`);

  const wallet3 =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC, "m/44'/60'/0'/0/2")
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Wallet 3: Using address ${wallet3.address}`);

  const wallet4 =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC, "m/44'/60'/0'/0/3")
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Wallet 3: Using address ${wallet4.address}`);

  const provider = ethers.providers.getDefaultProvider("ropsten", {
    etherscan: process.env.ETHERSCAN_API_KEY,
    infura: process.env.INFURA_API_KEY,
  });

  const ballotContractAddress = process.argv.slice(2)[0];
  if (!ballotContractAddress.startsWith("0x")) {
    throw new Error("Invalid ballot contract address");
  }

  const signer = wallet.connect(provider);

  const ballotContract: CustomBallot = new Contract(
    ballotContractAddress,
    ballotContractJson.abi,
    signer
  ) as CustomBallot;

  const tx = await ballotContract.updateReferenceBlock();
  const receipt = await tx.wait();
  console.log("Reference Block updated with tx: ", receipt.transactionHash);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
