const { ethers } = require("hardhat");

async function main() {
  const network = await ethers.provider.getNetwork();
  console.log(`Network: ${network.name ?? "unknown"} (chainId ${network.chainId})`);

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No signer configured. Set HEDERA_TESTNET_PRIVATE_KEY and rerun.");
  }

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} HBAR`);

  const contract = await ethers.deployContract("TeritageInheritance");
  await contract.waitForDeployment();

  console.log(`TeritageInheritance deployed at ${contract.target}`);

  const relayerAddress = process.env.RELAYER_ADDRESS || deployer.address;
  const setRelayerTx = await contract.setRelayer(relayerAddress);
  await setRelayerTx.wait();
  console.log(`Relayer set to ${relayerAddress}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
