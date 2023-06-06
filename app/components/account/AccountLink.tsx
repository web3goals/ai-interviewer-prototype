import { ProfileUriData } from "@/types";
import { Link as MuiLink, SxProps, TypographyProps } from "@mui/material";
import Link from "next/link";
import { theme } from "theme";
import { addressToShortAddress } from "utils/converters";

/**
 * Component with account link.
 */
export default function AccountLink(props: {
  account: string;
  accountProfileUriData?: ProfileUriData;
  color?: string;
  variant?: TypographyProps["variant"];
  sx?: SxProps;
}) {
  return (
    <Link href={`/accounts/${props.account}`} passHref legacyBehavior>
      <MuiLink
        fontWeight={700}
        variant={props.variant || "body2"}
        color={props.color || theme.palette.primary.main}
        sx={{ ...props.sx }}
      >
        {props.accountProfileUriData?.attributes[0].value
          ? props.accountProfileUriData?.attributes[0].value +
            " (" +
            addressToShortAddress(props.account) +
            ")"
          : addressToShortAddress(props.account)}
      </MuiLink>
    </Link>
  );
}
