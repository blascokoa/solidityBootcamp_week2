import "dotenv/config";
import { ethers } from "ethers";
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

  const provider = ethers.providers.getDefaultProvider("ropsten", {
    etherscan: process.env.ETHERSCAN_API_KEY,
    infura: process.env.INFURA_API_KEY,
  });

  const ballotContractAddress = process.argv.slice(2)[0];
  if (!ballotContractAddress.startsWith("0x")) {
    throw new Error("Invalid ballot contract address");
  }

  const voter = wallet.connect(provider);

  const contract: CustomBallot = new ethers.Contract(
    ballotContractAddress,
    ballotContractJson.abi,
    voter
  ) as CustomBallot;
  const proposalNumber: string = process.argv.slice(3)[0];
  const power = await contract.votingPower();
  contract.vote(proposalNumber, power);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
