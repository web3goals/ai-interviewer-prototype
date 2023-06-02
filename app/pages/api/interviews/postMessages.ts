import { InterviewMessage } from "@/types";
import { getAccessToken } from "@/utils/spaceAndTime";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * API to post messages to space and time.
 *
 * TODO: Check with signed message that only interview owner can send messages
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Define request params
    const messages: InterviewMessage[] | undefined = req.body.messages;
    if (!messages) {
      throw new Error("Parameters are incorrect");
    }
    // Get access token
    const accessToken = await getAccessToken();
    // Send values to space and time
    for (const message of messages) {
      await axios.post(
        "https://hackathon.spaceandtime.dev/v1/sql/dml",
        {
          resourceId: "sandbox.interview_messages",
          sqlText: `INSERT INTO sandbox.interview_messages (id, interview_id, message_id, date, role, content, points) VALUES ('${message.id}', ${message.interviewId}, ${message.messageId}, ${message.date}, '${message.role}', '${message.content}', ${message.points})`,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Biscuit: process.env.NEXT_PUBLIC_SPACE_AND_TIME_BISCUIT,
          },
        }
      );
    }
    res.status(200).json({ data: "ok" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || error });
  }
}
