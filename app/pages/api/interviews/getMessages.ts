import { getAccessToken } from "@/utils/spaceAndTime";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * API to get messages from space and time.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Define request params
    const interviewId: string | undefined = req.query.interviewId?.toString();
    if (!interviewId) {
      throw new Error("Parameters are incorrect");
    }
    // Get access token
    const accessToken = await getAccessToken();
    // Get values from space and time
    const response = await axios.post(
      "https://hackathon.spaceandtime.dev/v1/sql/dql",
      {
        resourceId: "sandbox.interview_messages",
        sqlText: `SELECT * FROM sandbox.interview_messages WHERE interview_id = ${interviewId} ORDER BY message_id DESC`,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Biscuit: process.env.NEXT_PUBLIC_SPACE_AND_TIME_BISCUIT,
        },
      }
    );
    res.status(200).json({ data: response.data });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || error });
  }
}
