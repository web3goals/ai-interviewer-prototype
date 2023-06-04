// Define args
const interviewId = args[0]
console.log(`Interview ID: ${interviewId}`)

// Make request
const request = Functions.makeHttpRequest({
  url: `https://ai-interviewer-app.vercel.app/api/interviews/getTotalPoints?interviewId=${interviewId}`,
})
const [response] = await Promise.all([request])
if (response.error) {
  throw Error("Request is failed")
}

// Define total points
const totalPoints = response.data.data
console.log(`Total points: ${totalPoints}`)

// Return result
return Functions.encodeUint256(totalPoints)
