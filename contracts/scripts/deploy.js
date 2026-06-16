const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // USDC ERC-20 precompile di Arc (6 desimal). KONFIRMASI ke docs resmi sebelum deploy.
  const USDC = process.env.USDC_ARC_TESTNET || "0x3600000000000000000000000000000000000000";
  const TREASURY = process.env.TREASURY_ADDRESS || deployer.address;

  const Registry = await ethers.getContractFactory("MeshworkRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("MeshworkRegistry:", registryAddr);

  const Escrow = await ethers.getContractFactory("MeshworkEscrow");
  const escrow = await Escrow.deploy(USDC, registryAddr, TREASURY);
  await escrow.waitForDeployment();
  const escrowAddr = await escrow.getAddress();
  console.log("MeshworkEscrow:  ", escrowAddr);

  // WAJIB: hubungkan supaya recordCompletion bisa dipanggil Escrow
  const tx = await registry.setEscrow(escrowAddr);
  await tx.wait();
  console.log("Registry.setEscrow ->", escrowAddr);

  console.log("\nDONE. Set di .env.local frontend:");
  console.log("NEXT_PUBLIC_REGISTRY_ADDRESS=" + registryAddr);
  console.log("NEXT_PUBLIC_ESCROW_ADDRESS=" + escrowAddr);
  console.log("NEXT_PUBLIC_USDC_ADDRESS=" + USDC);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
