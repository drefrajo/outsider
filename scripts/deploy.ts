import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying from:", deployer.address);
  // console.log("Balance:", ethers.utils.formatEther(await deployer.getBalance()));

  const Outsider = await ethers.getContractFactory("Outsider");
  const outsider = await Outsider.deploy();

  console.log(outsider.deployTransaction.hash);
  console.log(outsider.deployTransaction.nonce);

  await outsider.deployed();

  console.log("Outsider deployed to:", outsider.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
