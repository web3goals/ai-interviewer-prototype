import AccountAvatar from "@/components/account/AccountAvatar";
import AccountLink from "@/components/account/AccountLink";
import EntityList from "@/components/entity/EntityList";
import Layout from "@/components/layout";
import { CardBox } from "@/components/styled";
import { profileContractAbi } from "@/contracts/abi/profileContract";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import { ProfileUriData } from "@/types";
import { chainToSupportedChainProfileContractAddress } from "@/utils/chains";
import { stringToAddress } from "@/utils/converters";
import { Box, SxProps, Typography } from "@mui/material";
import { ethers } from "ethers";
import {
  paginatedIndexesConfig,
  useContractInfiniteReads,
  useContractRead,
  useNetwork,
} from "wagmi";

/**
 * Page with accounts.
 */
export default function Accounts() {
  const { chain } = useNetwork();

  const profileContractConfig = {
    address:
      chainToSupportedChainProfileContractAddress(chain) ||
      ethers.constants.AddressZero,
    abi: profileContractAbi,
  };

  const { data: owners } = useContractInfiniteReads({
    cacheKey: "owners",
    ...paginatedIndexesConfig(
      (index: bigint) => {
        return [
          {
            ...profileContractConfig,
            functionName: "ownerOf",
            args: [index] as const,
          },
        ];
      },
      { start: 1, perPage: 10, direction: "increment" }
    ),
  });

  const addresses: any[] | undefined = owners?.pages?.[0].map(
    (element) => element.result
  );

  return (
    <Layout maxWidth="md">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        ✨ Great people
      </Typography>
      <EntityList
        entities={addresses}
        renderEntityCard={(address, index) => (
          <AccountCard key={index} address={address} />
        )}
        noEntitiesText="😐 no people"
        sx={{ mt: 4 }}
      />
    </Layout>
  );
}

function AccountCard(props: { address?: string; sx?: SxProps }) {
  const { chain } = useNetwork();

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

  if (!props.address) {
    return <></>;
  }

  return (
    <CardBox sx={{ display: "flex", flexDirection: "row", ...props.sx }}>
      {/* Left part */}
      <Box>
        <AccountAvatar
          account={props.address}
          accountProfileUriData={profileUriData}
          size={64}
          emojiSize={28}
        />
      </Box>
      {/* Right part */}
      <Box width={1} ml={1.5} display="flex" flexDirection="column">
        <AccountLink
          account={props.address}
          accountProfileUriData={profileUriData}
        />
        {profileUriData?.attributes[1].value && (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {profileUriData?.attributes[1].value}
          </Typography>
        )}
      </Box>
    </CardBox>
  );
}
