async function main() {
  console.log("👟 Start to deploy interview contract")

  // Define contract deployer
  const accounts = await ethers.getSigners()
  const deployer = accounts[0]

  // Deploy contract
  const oracleAddress = "0xeA6721aC65BCeD841B8ec3fc5fEdeA6141a0aDE4"
  const factory = await ethers.getContractFactory("Interview", deployer)
  const contract = await factory.deploy(oracleAddress)
  await contract.deployed()
  console.log(`✅ Contract deployed to ${contract.address}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
