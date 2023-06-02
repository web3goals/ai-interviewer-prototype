import { ethers } from "ethers";

/**
 * Convert "ipfs://..." to "http://...".
 */
export function ipfsUriToHttpUri(ipfsUri?: string): string {
  const cid = ipfsUri?.match(/(?<=ipfs:\/\/).*$/)?.[0];
  if (!cid) {
    throw new Error(`Fail to converting IPFS URI to HTTP URI: ${ipfsUri}`);
  }
  const cidParts = cid.split("/");
  if (cidParts.length == 2) {
    return `https://${cidParts[0]}.ipfs.sphn.link/${cidParts[1]}`;
  }
  return `https://${cidParts[0]}.ipfs.sphn.link`;
}

/**
 * Convert "0x4306D7a79265D2cb85Db0c5a55ea5F4f6F73C4B1" to "0x430...c4b1".
 */
export function addressToShortAddress(address: string): string {
  let shortAddress = address;
  if (address?.length > 10) {
    shortAddress = `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  }
  return shortAddress?.toLowerCase();
}

/**
 * Convert string like "0x44EAe6f0C8E0714B8d8676eA803Dec04B492Ba16" to ethers address type.
 */
export function stringToAddress(string?: string): `0x${string}` | undefined {
  if (!string) {
    return undefined;
  }
  return ethers.utils.getAddress(string) as `0x${string}`;
}
