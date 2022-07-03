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
  const signer2 = wallet2.connect(provider);
  const signer3 = wallet3.connect(provider);
  const signer4 = wallet4.connect(provider);

  const voters = [signer2, signer3, signer4];

  // we assume wallets got enought balance.
  console.log("-------ALLOWANCE CHECK AND APPROVAL-------");
  for (const voter of voters) {
    const { tokenContract, ballotContract } = await attachContracts(
      voter,
      ballotContractAddress
    );
    const allowance = await tokenContract.allowance(
      voter.address,
      ballotContract.address
    );
    if (allowance.eq(0)) {
      console.log(
        `Allowance = 0 for - ${voter.address} - Increasing Allowance`
      );
      const tx = await tokenContract.approve(
        ballotContract.address,
        ethers.utils.parseEther("1000000")
      );
      const receipt = await tx.wait();
      console.log("Allowance increase on tx: ", receipt.transactionHash);
    } else {
      console.log(
        `Allowance = ${ethers.utils.formatEther(allowance)} for - ${
          voter.address
        }`
      );
    }
  }
  console.log("---------------VOTING POWER---------------");
  for (const voter of voters) {
    const { ballotContract } = await attachContracts(
      voter,
      ballotContractAddress
    );
    const power = await ballotContract.votingPower();
    console.log(`Voting power PRE Snapshot for ${voter.address} is ${power}`);
  }
  console.log("----------------DELEGATION----------------");
  for (const voter of voters) {
    const { tokenContract } = await attachContracts(
      voter,
      ballotContractAddress
    );
    const delegatedTo = await tokenContract.delegates(voter.address);
    if (delegatedTo === ethers.constants.AddressZero) {
      if (voter.address === "0xec916FED7e563bA11e3863806F9D4326eCaD4A76") {
        const delegateTx = await tokenContract.delegate(
          "0x818d396ddeE8de1eaE98449e5A9e76D284A2Bffc"
        );
        const receipt = await delegateTx.wait();
        console.log(
          `Delegation for ${voter.address} on tx: ${receipt.transactionHash} to 0x818d396ddeE8de1eaE98449e5A9e76D284A2Bffc`
        );
      } else {
        const delegateTx = await tokenContract.delegate(voter.address);
        const receipt = await delegateTx.wait();
        console.log(
          `Delegation for ${voter.address} on tx: ${receipt.transactionHash} - Self delegation`
        );
      }
    } else {
      console.log(voter.address, " already delegated to: ", delegatedTo);
    }
  }
  console.log("---------------VOTING POWER---------------");
  for (const voter of voters) {
    const { tokenContract } = await attachContracts(
      voter,
      ballotContractAddress
    );
    const power = await tokenContract.getVotes(voter.address);
    console.log(`Voting power POST snapshot for ${voter.address} is ${power}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
