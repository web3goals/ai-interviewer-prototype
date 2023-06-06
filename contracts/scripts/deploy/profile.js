async function main() {
  console.log("👟 Start to deploy profile contract")

  // Define contract deployer
  const accounts = await ethers.getSigners()
  const deployer = accounts[0]

  // Deploy contract
  const factory = await ethers.getContractFactory("Profile", deployer)
  const contract = await factory.deploy()
  await contract.deployed()
  console.log(`✅ Contract deployed to ${contract.address}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
