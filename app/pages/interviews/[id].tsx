import AccountAvatar from "@/components/account/AccountAvatar";
import AccountLink from "@/components/account/AccountLink";
import FormikHelper from "@/components/helper/FormikHelper";
import Layout from "@/components/layout";
import {
  CardBox,
  FullWidthSkeleton,
  LargeLoadingButton,
  ThickDivider,
  WidgetBox,
  WidgetInputTextField,
  WidgetTitle,
} from "@/components/styled";
import { INTERVIEWERS } from "@/constants/interviewers";
import { interviewContractAbi } from "@/contracts/abi/interviewContract";
import { profileContractAbi } from "@/contracts/abi/profileContract";
import useError from "@/hooks/useError";
import useToasts from "@/hooks/useToast";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import { palette } from "@/theme/palette";
import { Interviewer, InterviewMessage, ProfileUriData } from "@/types";
import { isAddressesEqual } from "@/utils/addresses";
import {
  chainToSupportedChainId,
  chainToSupportedChainInterviewContractAddress,
  chainToSupportedChainProfileContractAddress,
} from "@/utils/chains";
import { stringToAddress, timestampToDate } from "@/utils/converters";
import { Avatar, Box, Stack, SxProps, Typography } from "@mui/material";
import axios from "axios";
import { ethers } from "ethers";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import * as yup from "yup";

/**
 * Page with an interview.
 */
export default function Interview() {
  const router = useRouter();
  const { id } = router.query;
  const { chain } = useNetwork();

  /**
   * Define owner
   */
  const { data: owner } = useContractRead({
    address: chainToSupportedChainInterviewContractAddress(chain),
    abi: interviewContractAbi,
    functionName: "ownerOf",
    args: [BigInt(id?.toString() || 0)],
    enabled: id !== undefined,
  });

  /**
   * Define params
   */
  const { data: params } = useContractRead({
    address: chainToSupportedChainInterviewContractAddress(chain),
    abi: interviewContractAbi,
    functionName: "getParams",
    args: [BigInt(id?.toString() || 0)],
    enabled: id !== undefined,
  });

  /**
   * Define owner profile uri data
   */
  const { data: ownerProfileUri } = useContractRead({
    address: chainToSupportedChainProfileContractAddress(chain),
    abi: profileContractAbi,
    functionName: "getURI",
    args: [stringToAddress(owner) || ethers.constants.AddressZero],
  });
  const { data: ownerProfileUriData } =
    useUriDataLoader<ProfileUriData>(ownerProfileUri);

  return (
    <Layout maxWidth="sm">
      {id && owner && params ? (
        <>
          <InteviewInterviewer
            interviewer={INTERVIEWERS[Number(params?.interviewer)]}
          />
          <InterviewPoints
            sx={{ mt: 6 }}
            id={id.toString()}
            owner={owner}
            ownerProfileUriData={ownerProfileUriData}
            points={Number(params.points)}
          />
          <ThickDivider sx={{ my: 8 }} />
          <InterviewMessages
            id={id.toString()}
            owner={owner}
            ownerProfileUriData={ownerProfileUriData}
            interviewer={INTERVIEWERS[Number(params?.interviewer)]}
          />
        </>
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}

function InteviewInterviewer(props: { interviewer: Interviewer }) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Avatar
        sx={{ width: 196, height: 196 }}
        src={props.interviewer.imageAlt}
      />
      <Typography variant="h4" fontWeight={700} textAlign="center" mt={3}>
        {props.interviewer.title}
      </Typography>
      <Typography textAlign="center" mt={1}>
        {props.interviewer.subtitle}
      </Typography>
    </Box>
  );
}

function InterviewPoints(props: {
  id: string;
  owner: string;
  ownerProfileUriData?: ProfileUriData;
  points: number;
  sx?: SxProps;
}) {
  const { address } = useAccount();

  return (
    <CardBox
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderColor: "#000000",
        borderWidth: 7,
        padding: "32px 32px",
        ...props.sx,
      }}
    >
      <Typography variant="h4" fontWeight={700} textAlign="center">
        🚀 Earned {props.points} XP
      </Typography>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        mt={1}
      >
        <Typography>by</Typography>
        <AccountAvatar
          size={24}
          emojiSize={12}
          account={props.owner}
          accountProfileUriData={props.ownerProfileUriData}
        />
        <AccountLink
          account={props.owner}
          accountProfileUriData={props.ownerProfileUriData}
          variant="body1"
        />
      </Stack>
      {isAddressesEqual(address, props.owner) && (
        <InterviewPointsRefreshButton id={props.id} sx={{ mt: 2 }} />
      )}
    </CardBox>
  );
}

function InterviewPointsRefreshButton(props: { id: string; sx: SxProps }) {
  const { chain } = useNetwork();
  const { showToastSuccess, showToastError } = useToasts();

  const requestSource =
    '// Define args\r\nconst interviewId = args[0]\r\nconsole.log(`Interview ID: ${interviewId}`)\r\n\r\n// Make request\r\nconst request = Functions.makeHttpRequest({\r\n  url: `https://ai-interviewer-app.vercel.app/api/interviews/getTotalPoints?interviewId=${interviewId}`,\r\n})\r\nconst [response] = await Promise.all([request])\r\nif (response.error) {\r\n  throw Error("Request is failed")\r\n}\r\n\r\n// Define total points\r\nconst totalPoints = response.data.data\r\nconsole.log(`Total points: ${totalPoints}`)\r\n\r\n// Return result\r\nreturn Functions.encodeUint256(totalPoints)\r\n';

  const { config: contractPrepareConfig, isError: isContractPrepareError } =
    usePrepareContractWrite({
      address: chainToSupportedChainInterviewContractAddress(chain),
      abi: interviewContractAbi,
      functionName: "executeRequest",
      args: [
        BigInt(props.id),
        requestSource,
        "0x",
        [props.id],
        BigInt(process.env.NEXT_PUBLIC_CHAINLINK_FUNCTIONS_SUBSCRIPTION || ""),
        100000,
      ],
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

  useEffect(() => {
    if (isTransactionSuccess) {
      showToastSuccess("Points will be refreshed soon");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransactionSuccess]);

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
      sx={{ ...props.sx }}
    >
      Refresh
    </LargeLoadingButton>
  );
}

function InterviewMessages(props: {
  id: string;
  owner: string;
  ownerProfileUriData?: ProfileUriData;
  interviewer: Interviewer;
}) {
  const { address } = useAccount();
  const { handleError } = useError();
  const [messages, setMessages] = useState<InterviewMessage[] | undefined>();

  /**
   * Form states
   */
  const [formValues, setFormValues] = useState({
    message: "",
  });
  const formValidationSchema = yup.object({
    message: yup.string().required(),
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  /**
   * Get response from chatgpt and upload messages to space and time
   */
  async function submitForm(values: any, actions: any) {
    try {
      setIsFormSubmitting(true);
      if (!messages) {
        throw new Error("System messages are not defined");
      }
      // Define user message
      const userMessage: InterviewMessage = {
        id: `${props.id}_${messages.length}`,
        interviewId: props.id.toString(),
        messageId: messages.length,
        date: Math.round(new Date().getTime() / 1000),
        role: "user",
        content: values.message,
        points: 0,
      };
      // Prepare messages for chatgpt
      const chatgptMessages = [...messages, userMessage].map((message) => ({
        role: message.role,
        content: message.content,
      }));
      // Send messages to chatgpt
      const chatgptResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: chatgptMessages,
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer " + process.env.NEXT_PUBLIC_OPEN_AI_API_KEY_SECRET,
          },
        }
      );
      // Define chatgpt message
      const chatgptMessageContent: string =
        chatgptResponse.data.choices?.[0]?.message?.content;
      const chatgptMessage: InterviewMessage = {
        id: `${props.id}_${messages.length + 1}`,
        interviewId: props.id.toString(),
        messageId: messages.length + 1,
        date: Math.round(new Date().getTime() / 1000),
        role: "assistant",
        content: chatgptMessageContent,
        points: chatgptMessageContent.toLowerCase().includes("plus one point")
          ? 1
          : 0,
      };
      // Send messages to space and time
      await axios.post("/api/interviews/postMessages", {
        messages: [userMessage, chatgptMessage],
      });
      // Update messages
      setMessages([...messages, userMessage, chatgptMessage]);
      actions?.resetForm();
    } catch (error: any) {
      handleError(error, true);
    } finally {
      setIsFormSubmitting(false);
    }
  }

  /**
   * Load messages
   */
  useEffect(() => {
    // Init messages with system message
    const messages: InterviewMessage[] = [
      {
        id: `${props.id}_0`,
        interviewId: props.id.toString(),
        messageId: 0,
        date: 0,
        role: "system",
        content: props.interviewer.prompt,
        points: 0,
      },
    ];
    // Load messages from space and time using api
    axios
      .get(`/api/interviews/getMessages?interviewId=${props.id}`)
      .then((response) => {
        for (const responseMessage of response.data.data) {
          messages.push({
            id: responseMessage.ID,
            interviewId: responseMessage.INTERVIEW_ID,
            messageId: responseMessage.MESSAGE_ID,
            date: responseMessage.DATE,
            role: responseMessage.ROLE,
            content: atob(responseMessage.CONTENT),
            points: responseMessage.POINTS,
          });
        }
        setMessages(messages);
      })
      .catch((error) => handleError(error, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        🎤️ Interview
      </Typography>
      {messages && isAddressesEqual(address, props.owner) && (
        <Formik
          initialValues={formValues}
          validationSchema={formValidationSchema}
          onSubmit={submitForm}
        >
          {({ values, errors, touched, handleChange }) => (
            <Form
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <FormikHelper onChange={(values: any) => setFormValues(values)} />
              {/* Message input */}
              <WidgetBox bgcolor={palette.blue} mt={2}>
                <WidgetTitle>Message</WidgetTitle>
                <WidgetInputTextField
                  id="message"
                  name="message"
                  placeholder="I’m ready!"
                  value={values.message}
                  onChange={handleChange}
                  error={touched.message && Boolean(errors.message)}
                  helperText={touched.message && errors.message}
                  disabled={isFormSubmitting}
                  multiline
                  maxRows={4}
                  sx={{ width: 1 }}
                />
              </WidgetBox>
              {/* Submit button */}
              <LargeLoadingButton
                loading={isFormSubmitting}
                variant="outlined"
                type="submit"
                disabled={isFormSubmitting}
                sx={{ mt: 2 }}
              >
                Post
              </LargeLoadingButton>
            </Form>
          )}
        </Formik>
      )}
      {messages && (
        <Box width={1} mt={2}>
          {messages
            .slice(0)
            .reverse()
            .map((message, index) => {
              if (message.role === "system") {
                return <Box key={index} />;
              }
              return (
                <CardBox
                  key={index}
                  sx={{ display: "flex", flexDirection: "row", mt: 2 }}
                >
                  {/* Left part */}
                  <Box>
                    {message.role === "assistant" ? (
                      <Avatar
                        sx={{ width: 64, height: 64 }}
                        src={props.interviewer.imageAlt}
                      />
                    ) : (
                      <AccountAvatar
                        account={props.owner}
                        accountProfileUriData={props.ownerProfileUriData}
                        size={64}
                        emojiSize={28}
                      />
                    )}
                  </Box>
                  {/* Right part */}
                  <Box ml={1.5}>
                    {message.role === "assistant" ? (
                      <Typography fontWeight={700} variant="body2">
                        {props.interviewer.name}
                      </Typography>
                    ) : (
                      <AccountLink
                        account={props.owner}
                        accountProfileUriData={props.ownerProfileUriData}
                      />
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {timestampToDate(message.date)?.toLocaleString()}
                    </Typography>
                    <Typography mt={1}>{message.content}</Typography>
                  </Box>
                </CardBox>
              );
            })}
        </Box>
      )}
      {!messages && <FullWidthSkeleton />}
    </Box>
  );
}
