import { ethers, Contract } from "ethers";
import "dotenv/config";
import * as tokenContractJson from "../artifacts/contracts/Token.sol/MyToken.json";
import * as ballotContractJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import { MyToken, CustomBallot } from "../typechain";

const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

async function attachContracts(
  signer: ethers.Signer,
  ballotContractAddress: string
) {
  const tokenContract: MyToken = new Contract(
    "0x510Dd753824e9035939AE0b7096128d3b1dd9FB7",
    tokenContractJson.abi,
    signer
  ) as MyToken;

  const ballotContract: CustomBallot = new Contract(
    ballotContractAddress, // 0x245B1a20af6C898397C50a383Aa7FbF257608671
    ballotContractJson.abi,
    signer
  ) as CustomBallot;

  return { tokenContract, ballotContract };
}

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

  console.log("-------check that enough balance of VotingPower-------");

  // choose the right proposal

  // trigger the Voted event

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
