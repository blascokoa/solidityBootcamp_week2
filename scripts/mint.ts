import { ethers, Contract } from "ethers";
import "dotenv/config";
import * as tokenContractJson from "../artifacts/contracts/Token.sol/MyToken.json";
import { MyToken } from "../typechain";

const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

async function main() {
  console.log("Setting up the wallet...");
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
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Balance: ${balance}`);
  if (balance < 0.1) {
    console.log("Not enough funds to deploy the contract");
    return;
  }

  const tokenContract: MyToken = new Contract(
    "0x510Dd753824e9035939AE0b7096128d3b1dd9FB7",
    tokenContractJson.abi,
    signer
  ) as MyToken;

  console.log("- Fund wallets...");
  const nonce = await signer.getTransactionCount();
  await Promise.all([
    signer.sendTransaction({
      to: wallet2.address,
      value: ethers.utils.parseEther("0.01"),
      nonce: nonce,
    }),
    signer.sendTransaction({
      to: wallet3.address,
      value: ethers.utils.parseEther("0.01"),
      nonce: nonce + 1,
    }),
    signer.sendTransaction({
      to: wallet4.address,
      value: ethers.utils.parseEther("0.01"),
      nonce: nonce + 2,
    }),
  ]);
  console.log("Funding transactions mined...");

  console.log("- Minting tokens to wallets...");
  await Promise.all([
    tokenContract.mint(wallet2.address, ethers.utils.parseEther("10"), {
      nonce: nonce + 3,
    }),
    tokenContract.mint(wallet3.address, ethers.utils.parseEther("50"), {
      nonce: nonce + 4,
    }),
    tokenContract.mint(wallet4.address, ethers.utils.parseEther("33"), {
      nonce: nonce + 5,
    }),
  ]);

  console.log("Minting transactions mined...");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
