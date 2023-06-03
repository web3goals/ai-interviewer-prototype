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
import useError from "@/hooks/useError";
import { palette } from "@/theme/palette";
import { Interviewer, InterviewMessage } from "@/types";
import { timestampToDate } from "@/utils/converters";
import { Avatar, Box, Typography } from "@mui/material";
import axios from "axios";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import * as yup from "yup";

/**
 * Page with an interview.
 */
export default function Interview() {
  const router = useRouter();
  const { id } = router.query;

  // TODO: Replace interview data by data loaded from contract
  const interview = {
    id: id?.toString() || "",
    owner: "0x4306D7a79265D2cb85Db0c5a55ea5F4f6F73C4B1",
    interviewerId: 0,
    points: 42,
  };
  const interviewer = INTERVIEWERS[interview.interviewerId];

  return (
    <Layout maxWidth="sm">
      {id ? (
        <>
          <InteviewInterviewer interviewer={interviewer} />
          <ThickDivider sx={{ my: 8 }} />
          <InterviewMessages
            id={interview.id}
            owner={interview.owner}
            points={interview.points}
            interviewer={interviewer}
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

// TODO: Display form only for interview owner
// TODO: Change text for not interview owner
// TODO: Display account name and avatar if defined
function InterviewMessages(props: {
  id: string;
  owner: string;
  points: number;
  interviewer: Interviewer;
}) {
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
      const chatgptMessage: InterviewMessage = {
        id: `${props.id}_${messages.length + 1}`,
        interviewId: props.id.toString(),
        messageId: messages.length + 1,
        date: Math.round(new Date().getTime() / 1000),
        role: "assistant",
        content: chatgptResponse.data.choices?.[0]?.message?.content,
        points: 0, // TODO: Add point if chatgpt accept user's answer
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
   * Load messages from space and time
   */
  useEffect(() => {
    axios
      .get(`/api/interviews/getMessages?interviewId=${props.id}`)
      .then((response) => {
        const messages: InterviewMessage[] = [];
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
        ✍️ Your interview
      </Typography>
      <Typography textAlign="center" mt={1}>
        where you have already earned <strong>{props.points} XP</strong>
      </Typography>
      {messages ? (
        <>
          {/* Form */}
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
                <FormikHelper
                  onChange={(values: any) => setFormValues(values)}
                />
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
          {/* Messages */}
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
                        <AccountLink account={props.owner} />
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
        </>
      ) : (
        <FullWidthSkeleton />
      )}
    </Box>
  );
}
