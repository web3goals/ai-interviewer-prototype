import { INTERVIEWERS } from "@/constants/interviewers";
import { interviewContractAbi } from "@/contracts/abi/interviewContract";
import { theme } from "@/theme";
import { palette } from "@/theme/palette";
import { Interviewer } from "@/types";
import { chainToSupportedChainInterviewContractAddress } from "@/utils/chains";
import { Box, Stack, SxProps, Typography } from "@mui/material";
import Link from "next/link";
import { useContractRead, useNetwork } from "wagmi";
import { CardBox, LargeLoadingButton } from "../styled";

/**
 * A component with account interviews.
 */
export default function AccountInterviews(props: {
  address: `0x${string}`;
  sx?: SxProps;
}) {
  return (
    <Stack width={1} spacing={3} sx={{ ...props.sx }}>
      <AccountInterview
        address={props.address}
        interviewer={INTERVIEWERS[0]}
        backgroundColor={palette.yellow}
      />
      <AccountInterview
        address={props.address}
        interviewer={INTERVIEWERS[1]}
        backgroundColor={palette.purpleLight}
        textColor={theme.palette.primary.contrastText}
      />
    </Stack>
  );
}

function AccountInterview(props: {
  address: `0x${string}`;
  interviewer: Interviewer;
  backgroundColor?: string;
  textColor?: string;
}) {
  const { chain } = useNetwork();

  const { data: isStarted } = useContractRead({
    address: chainToSupportedChainInterviewContractAddress(chain),
    abi: interviewContractAbi,
    functionName: "isStarted",
    args: [props.address, BigInt(props.interviewer.id)],
  });

  if (isStarted) {
    return (
      <AccountInterviewStarted
        address={props.address}
        interviewer={props.interviewer}
        backgroundColor={props.backgroundColor}
        textColor={props.textColor}
      />
    );
  }

  return <></>;
}

function AccountInterviewStarted(props: {
  address: `0x${string}`;
  interviewer: Interviewer;
  backgroundColor?: string;
  textColor?: string;
}) {
  const { chain } = useNetwork();

  const { data: id } = useContractRead({
    address: chainToSupportedChainInterviewContractAddress(chain),
    abi: interviewContractAbi,
    functionName: "find",
    args: [props.address, BigInt(props.interviewer.id)],
  });

  const { data: params } = useContractRead({
    address: chainToSupportedChainInterviewContractAddress(chain),
    abi: interviewContractAbi,
    functionName: "getParams",
    args: [id || BigInt(0)],
    enabled: id !== undefined,
  });

  if (id && params) {
    return (
      <CardBox
        sx={{
          backgroundColor: props.backgroundColor,
          borderColor: "#000000",
          borderWidth: 7,
          padding: "24px 32px",
          color: props.textColor,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          {props.interviewer.titleAlt}
        </Typography>
        <Typography mt={1}>
          🚀 Earned{" "}
          <strong>{params.points.toString()} experience points</strong>
        </Typography>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          mt={2}
          alignItems={{ md: "center" }}
        >
          <Link href={`/interviews/${id}`}>
            <LargeLoadingButton variant="contained">
              Open Interview
            </LargeLoadingButton>
          </Link>
          <Link
            href={`https://testnets.opensea.io/assets/mumbai/${chainToSupportedChainInterviewContractAddress(
              chain
            )}/${id}`}
            target="_blank"
          >
            <LargeLoadingButton variant="outlined">
              View on OpenSea
            </LargeLoadingButton>
          </Link>
        </Stack>
      </CardBox>
    );
  }

  return <></>;
}
