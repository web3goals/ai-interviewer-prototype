import { LoadingButton, LoadingButtonProps } from "@mui/lab";
import {
  Box,
  BoxProps,
  DialogContent,
  DialogContentProps,
  Divider,
  DividerProps,
  Skeleton,
  SkeletonProps,
  TextField,
  TextFieldProps,
  Typography,
  TypographyProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";

export const ThickDivider = styled(Divider)<DividerProps>(({ theme }) => ({
  width: "100%",
  borderBottomWidth: 5,
}));

export const FullWidthSkeleton = styled(Skeleton)<SkeletonProps>(
  ({ theme }) => ({
    width: "100%",
    height: "64px",
  })
);

export const ExtraLargeLoadingButton = styled(
  LoadingButton
)<LoadingButtonProps>(({ theme, variant }) => ({
  fontSize: "24px",
  fontWeight: 700,
  borderRadius: "78px",
  padding: "24px 78px",
  ...(variant === "outlined" && {
    border: "5px solid",
    "&:hover": {
      border: "5px solid",
    },
  }),
})) as typeof LoadingButton;

export const LargeLoadingButton = styled(LoadingButton)<LoadingButtonProps>(
  ({ theme, variant }) => ({
    fontSize: "18px",
    fontWeight: 700,
    borderRadius: "78px",
    padding: "14px 48px",
    ...(variant === "outlined" && {
      border: "5px solid",
      "&:hover": {
        border: "5px solid",
      },
    }),
  })
) as typeof LoadingButton;

export const MediumLoadingButton = styled(LoadingButton)<LoadingButtonProps>(
  ({ theme, variant }) => ({
    fontSize: "14px",
    fontWeight: 700,
    borderRadius: "24px",
    padding: "8px 18px",
    ...(variant === "outlined" && {
      border: "4px solid",
      "&:hover": {
        border: "4px solid",
      },
    }),
  })
) as typeof LoadingButton;

export const CardBox = styled(Box)<BoxProps>(({ theme }) => ({
  width: "100%",
  border: "solid",
  borderColor: theme.palette.divider,
  borderWidth: "5px",
  borderRadius: "10px",
  padding: "18px 24px",
}));

export const WidgetBox = styled(Box)<BoxProps>(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "16px 32px",
  borderRadius: "12px",
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
  },
}));

export const WidgetTitle = styled(Typography)<TypographyProps>(({ theme }) => ({
  color: "#FFFFFF",
  fontSize: "1.8rem",
  fontWeight: 700,
  minWidth: "0px",
  marginRight: "0px",
  marginBottom: "8px",
  [theme.breakpoints.up("md")]: {
    fontSize: "2.125rem",
    minWidth: "180px",
    marginRight: "24px",
    marginBottom: "0px",
  },
}));

export const WidgetContentBox = styled(Box)<BoxProps>(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  padding: "14px 20px",
}));

export const WidgetText = styled(Typography)<TypographyProps>(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  padding: "14px 20px",
}));

export const WidgetInputTextField = styled(TextField)<TextFieldProps>(
  ({ theme }) => ({
    width: "120px",
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: "0px",
        borderRadius: "12px",
      },
      "&:hover fieldset": {
        border: "4px solid #000000",
      },
      "&.Mui-focused fieldset": {
        border: "4px solid #000000",
      },
    },
  })
);

export const DialogCenterContent = styled(DialogContent)<DialogContentProps>(
  ({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "14px 0px",
  })
);
