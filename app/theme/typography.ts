export const typography = {
  fontFamily: [
    "Prompt",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Oxygen",
    "Ubuntu",
    "Cantarell",
    "Fira Sans",
    "Droid Sans",
    "Helvetica Neue",
    "sans-serif",
  ].join(","),
  h1: {
    fontSize: "3.6rem",
    "@media (max-width:600px)": {
      fontSize: "1.8rem",
    },
  },
  h4: {
    "@media (max-width:600px)": {
      fontSize: "1.8rem",
    },
  },
  h6: {
    "@media (max-width:600px)": {
      fontSize: "1.25rem",
    },
  },
};
