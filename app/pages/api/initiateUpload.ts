import { ProtocolEnum, SpheronClient } from "@spheron/storage";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * API to get a token for uploading data from browser to Spheron Storage.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = new SpheronClient({
      token: process.env.NEXT_PUBLIC_SPHERON_API_KEY || "",
    });
    const { uploadToken } = await client.createSingleUploadToken({
      name: "browser-upload",
      protocol: ProtocolEnum.IPFS,
    });
    res.status(200).json({
      uploadToken: uploadToken,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error });
  }
}
