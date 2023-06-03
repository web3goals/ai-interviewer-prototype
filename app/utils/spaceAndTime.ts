import axios from "axios";
import nacl from "tweetnacl";
import { createClient } from "@vercel/kv";

/**
 * Source for all functions - https://github.com/spaceandtimelabs/SxT-NodeJS-SDK
 */

export async function getAccessToken(): Promise<string> {
  // Load access token
  const kvClient = createClient({
    url: process.env.NEXT_PUBLIC_KV_REST_API_URL || "",
    token: process.env.NEXT_PUBLIC_KV_REST_API_TOKEN || "",
  });
  const kvAccessToken: any = await kvClient.get("accessToken");
  // Return current access token if defined and valid
  if (kvAccessToken) {
    const isValid = await isAccessTokenValid(kvAccessToken);
    if (isValid) {
      console.log("Access token defined and valid");
      return kvAccessToken;
    }
  }
  // Generate new access token if not defined or not valid
  console.log("Access token not defined or not valid");
  const userId = process.env.NEXT_PUBLIC_SPACE_AND_TIME_USER_ID || "";
  const publicKey = process.env.NEXT_PUBLIC_SPACE_AND_TIME_PUBLIC_KEY || "";
  const privateKey = process.env.NEXT_PUBLIC_SPACE_AND_TIME_PRIVATE_KEY || "";
  const prefix = "";
  const joinCode = "";
  const scheme = "ed25519";
  const authCode = await generateAuthCode(userId, prefix, joinCode);
  const privateKeyUint = base64ToUint8(privateKey, publicKey);
  const signature = generateSignature(authCode, privateKeyUint);
  const accessToken = await generateAccessToken(
    userId,
    authCode,
    signature,
    publicKey,
    scheme
  );
  // Save access token
  await kvClient.set("accessToken", accessToken);
  // Return token
  return accessToken;
}

/**
 * Requests
 */

async function isAccessTokenValid(accessToken: string): Promise<boolean> {
  try {
    await axios.get("https://hackathon.spaceandtime.dev/v1/auth/validtoken", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function generateAccessToken(
  userId: string,
  authCode: string,
  signature: string,
  publicKey: string,
  scheme: string
): Promise<string> {
  checkUserIdFormat(userId);
  checkStringFormat(authCode);
  checkSignature(signature);
  isBase64(publicKey);
  const response = await axios.post(
    "https://hackathon.spaceandtime.dev/v1/auth/token",
    {
      userId: userId,
      authCode: authCode,
      signature: signature,
      key: publicKey,
      scheme: scheme,
    }
  );
  return response.data.accessToken;
}

async function generateAuthCode(
  userId: string,
  prefix: string,
  joinCode: string
): Promise<string> {
  const response = await axios.post(
    "https://hackathon.spaceandtime.dev/v1/auth/code",
    { userId: userId, prefix: prefix, joinCode: joinCode }
  );
  return response.data.authCode;
}

/**
 * Utils
 */

function generateSignature(message: any, privateKey: any) {
  checkStringFormat(message);
  let authCode = new TextEncoder().encode(message);
  let signatureArray = nacl.sign(authCode, privateKey);
  let signature = Buffer.from(
    signatureArray.buffer,
    signatureArray.byteOffset,
    signatureArray.byteLength
  ).toString("hex");
  signature = signature.slice(0, 128);
  return signature;
}

function base64ToUint8(base64PrivateKey: string, base64PublicKey: string) {
  isBase64(base64PrivateKey);
  isBase64(base64PublicKey);
  let privateKeyBuffer = Buffer.from(base64PrivateKey, "base64");
  let publicKeyBuffer = Buffer.from(base64PublicKey, "base64");
  let privateKeyUint8: any = new Uint8Array(
    privateKeyBuffer.buffer,
    privateKeyBuffer.byteOffset,
    privateKeyBuffer.byteLength
  );
  let publicKeyUint8 = new Uint8Array(
    publicKeyBuffer.buffer,
    publicKeyBuffer.byteOffset,
    publicKeyBuffer.byteLength
  );
  if (privateKeyUint8.length === publicKeyUint8.length) {
    let temporaryPrivateKey = [];

    for (let idx = 0; idx < privateKeyUint8.length; idx++) {
      temporaryPrivateKey[idx] = privateKeyUint8[idx];
    }

    for (let idx = 0; idx < publicKeyUint8.length; idx++) {
      temporaryPrivateKey[privateKeyUint8.length + idx] = publicKeyUint8[idx];
    }

    privateKeyUint8 = temporaryPrivateKey;
  }
  let PrivateKeyUint8Array = new Uint8Array(privateKeyUint8.length);
  for (let i = 0; i < privateKeyUint8.length; i++) {
    PrivateKeyUint8Array[i] = privateKeyUint8[i];
  }
  return PrivateKeyUint8Array;
}

function isBase64(str: any) {
  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*?(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  if (!base64Regex.test(str)) {
    throw new Error("String is not base64 encoded");
  }

  return true;
}

function checkUserIdFormat(userId: any) {
  if (typeof userId !== "string" && typeof userId !== "number") {
    throw new Error(
      `User ID must be a string or a number, but got ${typeof userId}`
    );
  }
}

function checkStringFormat(userString: any) {
  if (userString.length === 0) {
    throw new Error("Empty String provided.");
  } else if (typeof userString !== "string") {
    throw new Error(`Expected a String but got ${typeof userString} `);
  }
}

function checkSignature(signature: any) {
  const regex = /[0-9A-Fa-f]{6}/g;
  return regex.test(signature);
}
