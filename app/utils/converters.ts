import { ethers } from "ethers";

/**
 * Convert string like "0x44EAe6f0C8E0714B8d8676eA803Dec04B492Ba16" to ethers address type.
 */
export function stringToAddress(string?: string): `0x${string}` | undefined {
  if (!string) {
    return undefined;
  }
  return ethers.utils.getAddress(string) as `0x${string}`;
}
