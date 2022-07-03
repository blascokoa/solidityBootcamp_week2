import { ethers } from "ethers";
import "dotenv/config";
import * as customBallotJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";

const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

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
  console.log("Proposals");
  const tokenContractAddress = process.argv.slice(2)[0];
  if (!tokenContractAddress.startsWith("0x")) {
    throw new Error("Invalid token contract address");
  }
  const proposals = process.argv.slice(3);
  if (proposals.length < 2) throw new Error("Not enough proposals");
  proposals.forEach((eachProposal, index) => {
    console.log(` |- Proposal ${index + 1} - ${eachProposal}`);
  });

  const customBallotFactory = new ethers.ContractFactory(
    customBallotJson.abi,
    customBallotJson.bytecode,
    signer
  );

  console.log("- Deploying CustomBallot contract...");
  const customBallotContract = await customBallotFactory.deploy(
    convertStringArrayToBytes32(proposals),
    tokenContractAddress
  );
  console.log("Awaiting confirmation...");
  await customBallotContract.deployed();
  console.log(`Ballot contract deployed at ${customBallotContract.address}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
