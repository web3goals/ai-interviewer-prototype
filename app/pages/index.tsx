import Layout from "@/components/layout";
import {
  CardBox,
  FullWidthSkeleton,
  LargeLoadingButton,
} from "@/components/styled";
import { INTERVIEWERS } from "@/constants/interviewers";
import { interviewContractAbi } from "@/contracts/abi/interviewContract";
import useToasts from "@/hooks/useToast";
import { theme } from "@/theme";
import { palette } from "@/theme/palette";
import { Interviewer } from "@/types";
import {
  chainToSupportedChainId,
  chainToSupportedChainInterviewContractAddress,
} from "@/utils/chains";
import { Avatar, Box, Container, Stack, Typography } from "@mui/material";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  useAccount,
  useContractEvent,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

/**
 * Landing page.
 */
export default function Landing() {
  return (
    <Layout maxWidth={false} disableGutters={true}>
      {/* Title */}
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Typography variant="h1" textAlign="center">
          ⚡ <strong>Check your skills</strong> with AI&nbsp;interviewers and{" "}
          <strong>earn experience points</strong> for your resume
        </Typography>
      </Container>
      {/* Interviewers */}
      <Container maxWidth="md" sx={{ mt: 12 }}>
        <Box
          id="interviewers"
          component="a"
          sx={{
            display: "block",
            position: "relative",
            top: "-98px",
            visibility: "hidden",
          }}
        />
        <Stack spacing={3}>
          <Interviewer
            interviewer={INTERVIEWERS[0]}
            backgroundColor={palette.yellow}
          />
          <Interviewer
            interviewer={INTERVIEWERS[1]}
            backgroundColor={palette.purpleLight}
            textColor={theme.palette.primary.contrastText}
          />
          <NewInterviewers />
        </Stack>
      </Container>
    </Layout>
  );
}

function Interviewer(props: {
  interviewer: Interviewer;
  backgroundColor?: string;
  textColor?: string;
}) {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <CardBox
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        backgroundColor: props.backgroundColor,
        borderColor: "#000000",
        borderWidth: 7,
        padding: "24px 32px",
        color: props.textColor,
      }}
    >
      {/* Left part */}
      <Box>
        <Avatar
          sx={{ width: 128, height: 128 }}
          src={props.interviewer.image}
        />
      </Box>
      {/* Right part */}
      <Box mt={{ xs: 2, md: 0 }} ml={{ md: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          {props.interviewer.title}
        </Typography>
        <Typography mt={1}>{props.interviewer.subtitle}</Typography>
        <Box mt={3}>
          {address ? (
            <InterviewStatus
              address={address}
              interviewer={props.interviewer}
            />
          ) : (
            <LargeLoadingButton
              variant="contained"
              onClick={() => openConnectModal?.()}
            >
              Connect wallet
            </LargeLoadingButton>
          )}
        </Box>
      </Box>
    </CardBox>
  );
}

function InterviewStatus(props: {
  address: `0x${string}`;
  interviewer: Interviewer;
}) {
  const { chain } = useNetwork();

  const { data: isStarted } = useContractRead({
    address: chainToSupportedChainInterviewContractAddress(chain),
    abi: interviewContractAbi,
    functionName: "isStarted",
    args: [props.address, BigInt(props.interviewer.id)],
  });

  if (isStarted === undefined) {
    return <FullWidthSkeleton />;
  } else if (isStarted) {
    return (
      <InterviewStarted
        address={props.address}
        interviewer={props.interviewer}
      />
    );
  } else {
    return (
      <InterviewNotStarted
        address={props.address}
        interviewer={props.interviewer}
      />
    );
  }
}

function InterviewStarted(props: {
  address: `0x${string}`;
  interviewer: Interviewer;
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

  return (
    <Stack
      direction={{ xs: "column-reverse", md: "row" }}
      spacing={3}
      alignItems={{ xs: "flex-start", md: "center" }}
    >
      <Link href={`/interviews/${id}`}>
        <LargeLoadingButton variant="contained">
          Go to Interview
        </LargeLoadingButton>
      </Link>
      {params && (
        <Typography fontWeight={700}>
          🚀 Earned {params.points.toString()} XP
        </Typography>
      )}
    </Stack>
  );
}

function InterviewNotStarted(props: {
  address: `0x${string}`;
  interviewer: Interviewer;
}) {
  const { chain } = useNetwork();
  const router = useRouter();
  const { showToastSuccess, showToastError } = useToasts();

  const { config: contractPrepareConfig, isError: isContractPrepareError } =
    usePrepareContractWrite({
      address: chainToSupportedChainInterviewContractAddress(chain),
      abi: interviewContractAbi,
      functionName: "start",
      args: [BigInt(props.interviewer.id)],
      chainId: chainToSupportedChainId(chain),
      onError(error: any) {
        showToastError(error);
      },
    });
  const {
    data: contractWriteData,
    isLoading: isContractWriteLoading,
    write: contractWrite,
  } = useContractWrite(contractPrepareConfig);
  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } =
    useWaitForTransaction({
      hash: contractWriteData?.hash,
    });

  useContractEvent({
    address: chainToSupportedChainInterviewContractAddress(chain),
    abi: interviewContractAbi,
    eventName: "Transfer",
    listener(log) {
      if (
        log[0].args.from === ethers.constants.AddressZero &&
        log[0].args.to === props.address
      ) {
        showToastSuccess("Interview is started");
        router.push(`/interviews/${log[0].args.tokenId?.toString()}`);
      }
    },
  });

  const isLoading = isContractWriteLoading || isTransactionLoading;
  const isDisabled =
    isLoading ||
    isTransactionSuccess ||
    isContractPrepareError ||
    !contractWrite;

  return (
    <LargeLoadingButton
      variant="contained"
      disabled={isDisabled}
      loading={isLoading}
      onClick={() => contractWrite?.()}
    >
      Start Interview
    </LargeLoadingButton>
  );
}

function NewInterviewers() {
  return (
    <CardBox
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderWidth: 7,
        padding: "38px 32px",
      }}
    >
      <Typography variant="h4" fontWeight={700}>
        ⌛ Soon new interviewers will be here
      </Typography>
      <Typography padding={1}>
        and they will thoroughly check your skills
      </Typography>
    </CardBox>
  );
}
