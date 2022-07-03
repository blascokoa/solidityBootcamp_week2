import { ethers } from "ethers";
import "dotenv/config";
import * as tokenContractJson from "../artifacts/contracts/Token.sol/MyToken.json";

const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

async function main() {
  console.log("Setting up the wallet...");
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC, "m/44'/60'/0'/0/0")
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = ethers.providers.getDefaultProvider("ropsten", {
    etherscan: process.env.ETHERSCAN_API_KEY,
    infura: process.env.INFURA_API_KEY,
  });
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Balance: ${balance}`);
  if (balance < 0.1) {
    console.log("Not enough funds to deploy the contract");
    return;
  }
  const tokenContractFactory = new ethers.ContractFactory(
    tokenContractJson.abi,
    tokenContractJson.bytecode,
    signer
  );
  console.log("- Deploying the token contract...");
  const tokenContract = await tokenContractFactory.deploy();
  console.log("Awaiting confirmation...");
  await tokenContract.deployed();
  const tokenContractAddress = tokenContract.address;
  console.log(`Token contract deployed at ${tokenContractAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
