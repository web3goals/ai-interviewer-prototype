import Layout from "@/components/layout";
import { CardBox, LargeLoadingButton } from "@/components/styled";
import { INTERVIEWERS } from "@/constants/interviewers";
import { theme } from "@/theme";
import { palette } from "@/theme/palette";
import { Interviewer } from "@/types";
import { Avatar, Box, Container, Stack, Typography } from "@mui/material";

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
        <Stack
          direction={{ xs: "column-reverse", md: "row" }}
          spacing={3}
          alignItems={{ xs: "flex-start", md: "center" }}
          mt={3}
        >
          {/* TODO: Add link to interview page  */}
          {/* TODO: Or open modal to mint interview token, and redirect after that to interview page */}
          <LargeLoadingButton variant="outlined" sx={{ background: "#FFFFFF" }}>
            Go to {props.interviewer.name}
          </LargeLoadingButton>
          {/* TODO: Define earned points by loading token uri data  */}
          <Typography fontWeight={700}>Earned ❓ XP</Typography>
        </Stack>
      </Box>
    </CardBox>
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
