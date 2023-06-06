import { ProfileUriData } from "@/types";
import {
  AlternateEmail,
  Instagram,
  Language,
  Telegram,
  Twitter,
} from "@mui/icons-material";
import { Box, Divider, IconButton, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { FullWidthSkeleton, LargeLoadingButton } from "components/styled";
import { profileContractAbi } from "contracts/abi/profileContract";
import { ethers } from "ethers";
import useUriDataLoader from "hooks/useUriDataLoader";
import Link from "next/link";
import { isAddressesEqual } from "utils/addresses";
import { chainToSupportedChainProfileContractAddress } from "utils/chains";
import { addressToShortAddress, stringToAddress } from "utils/converters";
import { useAccount, useContractRead, useNetwork } from "wagmi";
import AccountAvatar from "./AccountAvatar";

/**
 * A component with account profile.
 */
export default function AccountProfile(props: { address: string }) {
  const { chain } = useNetwork();
  const { address } = useAccount();

  /**
   * Define profile uri data
   */
  const { data: profileUri } = useContractRead({
    address: chainToSupportedChainProfileContractAddress(chain),
    abi: profileContractAbi,
    functionName: "getURI",
    args: [stringToAddress(props.address) || ethers.constants.AddressZero],
  });
  const { data: profileUriData } = useUriDataLoader<ProfileUriData>(profileUri);

  if (profileUri === "" || profileUriData) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        {/* Image */}
        <AccountAvatar
          account={props.address}
          accountProfileUriData={profileUriData}
          size={164}
          emojiSize={64}
          sx={{ mb: 3 }}
        />
        {/* Name */}
        {profileUriData?.attributes?.[0]?.value && (
          <Typography variant="h4" fontWeight={700} textAlign="center">
            {profileUriData.attributes[0].value}
          </Typography>
        )}
        {/* About */}
        {profileUriData?.attributes?.[1]?.value && (
          <Typography textAlign="center" sx={{ maxWidth: 480, mt: 1 }}>
            {profileUriData.attributes[1].value}
          </Typography>
        )}
        {/* Links and other data */}
        <Stack
          direction={{ xs: "column-reverse", md: "row" }}
          alignItems="center"
          mt={1.5}
        >
          {/* Email and links */}
          <Stack direction="row" alignItems="center">
            {profileUriData?.attributes?.[2]?.value && (
              <IconButton
                href={`mailto:${profileUriData.attributes[2].value}`}
                target="_blank"
                component="a"
                color="primary"
              >
                <AlternateEmail />
              </IconButton>
            )}
            {profileUriData?.attributes?.[3]?.value && (
              <IconButton
                href={profileUriData.attributes[3].value}
                target="_blank"
                component="a"
                color="primary"
              >
                <Language />
              </IconButton>
            )}
            {profileUriData?.attributes?.[4]?.value && (
              <IconButton
                href={`https://twitter.com/${profileUriData.attributes[4].value}`}
                target="_blank"
                component="a"
                color="primary"
              >
                <Twitter />
              </IconButton>
            )}
            {profileUriData?.attributes?.[5]?.value && (
              <IconButton
                href={`https://t.me/${profileUriData.attributes[5].value}`}
                target="_blank"
                component="a"
                color="primary"
              >
                <Telegram />
              </IconButton>
            )}
            {profileUriData?.attributes?.[6]?.value && (
              <IconButton
                href={`https://instagram.com/${profileUriData.attributes[6].value}`}
                target="_blank"
                component="a"
                color="primary"
              >
                <Instagram />
              </IconButton>
            )}
            {(profileUriData?.attributes?.[2]?.value ||
              profileUriData?.attributes?.[3]?.value ||
              profileUriData?.attributes?.[4]?.value ||
              profileUriData?.attributes?.[5]?.value ||
              profileUriData?.attributes?.[6]?.value) && (
              <Divider
                flexItem
                orientation="vertical"
                variant="middle"
                sx={{
                  display: { xs: "none", md: "block" },
                  borderRightWidth: 4,
                  ml: 1.3,
                  mr: 2,
                }}
              />
            )}
          </Stack>
          {/* Address, reputation */}
          <Stack
            direction="row"
            alignItems="center"
            sx={{ mb: { xs: 1, md: 0 } }}
          >
            <Typography fontWeight={700} sx={{ mr: 1.5 }}>
              {addressToShortAddress(props.address)}
            </Typography>
          </Stack>
        </Stack>
        {/* Owner buttons */}
        {isAddressesEqual(address, props.address) && (
          <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
            <Link href="/accounts/edit" legacyBehavior>
              <LargeLoadingButton variant="outlined">
                {profileUriData ? "Edit Profile" : "Create Profile"}
              </LargeLoadingButton>
            </Link>
          </Stack>
        )}
      </Box>
    );
  }

  return <FullWidthSkeleton />;
}
