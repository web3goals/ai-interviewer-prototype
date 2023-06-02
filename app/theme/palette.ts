import { PaletteOptions } from "@mui/material";

declare module "@mui/material/styles" {
  interface PaletteOptions {
    green: string;
    blue: string;
    blueLight: string;
    red: string;
    orange: string;
    yellow: string;
    purpleLight: string;
    purpleDark: string;
    greyLight: string;
    greyDark: string;
  }
}

export const palette: PaletteOptions = {
  background: { default: "#EEEEEE" },
  primary: {
    main: "#2B6EFD",
  },
  success: {
    main: "#1DB954",
  },
  error: {
    main: "#FF4400",
  },
  divider: "#DDDDDD",
  green: "#1DB954",
  blue: "#2B6EFD",
  blueLight: "#00ADEF",
  red: "#FF4400",
  orange: "#E97E27",
  yellow: "#FFC833",
  purpleLight: "#9747FF",
  purpleDark: "#410C92",
  greyLight: "#999999",
  greyDark: "#333333",
};
