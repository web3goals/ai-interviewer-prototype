async function main() {
  console.log("👟 Start sandbox")

  // Define account
  const accounts = await ethers.getSigners()
  const account = accounts[0]

  // Define interview contract
  const interviewAddress = "0x18e1858a2ff94BE221639C220D87844A27c0dda6"
  const interviewFactory = await ethers.getContractFactory("Interview", account)
  const interviewContract = await interviewFactory.attach(interviewAddress)

  // Start interview
  // await interviewContract.start(0)

  // Execute request
  // const tokenId = 1
  // const source =
  //   '// Define args\r\nconst interviewId = args[0]\r\nconsole.log(`Interview ID: ${interviewId}`)\r\n\r\n// Make request\r\nconst request = Functions.makeHttpRequest({\r\n  url: `https://ai-interviewer-app.vercel.app/api/interviews/getTotalPoints?interviewId=${interviewId}`,\r\n})\r\nconst [response] = await Promise.all([request])\r\nif (response.error) {\r\n  throw Error("Request is failed")\r\n}\r\n\r\n// Define total points\r\nconst totalPoints = response.data.data\r\nconsole.log(`Total points: ${totalPoints}`)\r\n\r\n// Return result\r\nreturn Functions.encodeUint256(totalPoints)\r\n'
  // const secrets = []
  // const args = ["1"]
  // const subscriptionId = 1507
  // const gasLimit = 100000
  // const overrides = {
  //   gasLimit: 1_500_000,
  //   gasPrice: undefined,
  // }
  // await interviewContract.executeRequest(tokenId, source, secrets, args, subscriptionId, gasLimit, overrides)

  console.log("🏁 Sandbox is finished")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
