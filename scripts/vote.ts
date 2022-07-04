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

  const signer2: ethers.Wallet = wallet2.connect(provider);
  const signer3: ethers.Wallet = wallet3.connect(provider);
  const signer4: ethers.Wallet = wallet4.connect(provider);

  const voters = [signer2, signer3, signer4];

  let readArgCounter = 3;
  for (const voter of voters) {
    const contract: CustomBallot = new ethers.Contract(
      ballotContractAddress,
      ballotContractJson.abi,
      voter
    ) as CustomBallot;
    const proposalNumber: string = process.argv.slice(readArgCounter)[0];
    readArgCounter++;
    const power = await contract.votingPower();
    if (Number(ethers.utils.formatUnits(power, 18)) > 0) {
      console.log(
        "user voted",
        voter.address,
        proposalNumber,
        ethers.utils.formatUnits(power, 18)
      );
      const tx = await contract.vote(proposalNumber, power);
      const receipt = await tx.wait();
      console.log(
        `${voter.address} Voted for proposal ${proposalNumber} - power: ${power} - Tx Hash: ${receipt.transactionHash}`
      );
    } else {
      console.log(`${voter.address} has no voting power`);
    }
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
