export type Interviewer = {
  id: number;
  name: string;
  title: string;
  titleAlt: string;
  subtitle: string;
  image: string;
  imageAlt: string;
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

export type ProfileUriData = {
  name: string;
  image: string;
  attributes: [
    { trait_type: "name"; value: string },
    { trait_type: "about"; value: string },
    { trait_type: "email"; value: string },
    { trait_type: "website"; value: string },
    { trait_type: "twitter"; value: string },
    { trait_type: "telegram"; value: string },
    { trait_type: "instagram"; value: string }
  ];
};
