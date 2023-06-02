import { Interviewer } from "@/types";

export const INTERVIEWERS: { [key: string]: Interviewer } = {
  keplin: {
    id: 1,
    name: "Keplin",
    title: "JavaScript Interviewer",
    subtitle: "Hey, I’m Keplin! JavaScript interviewer...", // TODO: Implement subtitle
    image: "/images/keplin.png",
  },
  rosman: {
    id: 2,
    name: "Rosman",
    title: "Solidity Interviewer",
    subtitle: "Hey, I’m Rosman! Solidity interviewer...", // TODO: Implement subtitle
    image: "/images/rosman.png",
  },
};
