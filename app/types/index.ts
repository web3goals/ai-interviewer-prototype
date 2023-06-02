export type Interviewer = {
  id: number;
  name: string;
  title: string;
  subtitle: string;
  image: string;
};

export type InterviewMessage = {
  id: string; // Combination of interview id and message id
  interviewId: string;
  messageId: number;
  date: number;
  role: "system" | "assistant" | "user";
  content: string;
  points: number;
};
