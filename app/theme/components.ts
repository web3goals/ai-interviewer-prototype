import { Components } from "@mui/material";

export const components: Components = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "initial",
        boxShadow: "none",
        "&:hover": {
          boxShadow: "none",
        },
      },
    },
    variants: [
      {
        props: { variant: "contained" },
        style: {
          color: "#FFFFFF",
          background: "#000000",
          "& .MuiButton-startIcon svg path": {
            stroke: "#FFFFFF",
          },
          "&:hover": {
            background: "#433d39",
          },
        },
      },
      {
        props: { variant: "outlined" },
        style: {
          color: "#000000",
          borderColor: "#000000",
          "& .MuiButton-startIcon svg path": {
            stroke: "#000000",
          },
          "&:hover": {
            borderColor: "#000000",
          },
        },
      },
    ],
  },
  MuiLink: {
    styleOverrides: {
      root: {
        textDecoration: "none",
      },
    },
  },
  MuiAccordion: {
    styleOverrides: {
      root: {
        border: "1px solid #DDDDDD",
        "&:not(:last-child)": {
          borderBottom: 0,
        },
      },
    },
  },
  MuiAccordionDetails: {
    styleOverrides: {
      root: {
        background: "#EEEEEE",
      },
    },
  },
};
