/**
 * Check if the addresses are equal to each other.
 */
export function isAddressesEqual(
  addressOne: string | undefined,
  addressTwo: string | undefined
): boolean {
  if (!addressOne || !addressTwo) {
    return false;
  }
  return addressOne.toLowerCase() === addressTwo.toLowerCase();
}
