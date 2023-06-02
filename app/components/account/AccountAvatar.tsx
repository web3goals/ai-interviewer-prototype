import { ProfileUriData } from "@/types";
import { Avatar, SxProps, Typography } from "@mui/material";
import { emojiAvatarForAddress } from "utils/avatars";
import { ipfsUriToHttpUri } from "utils/converters";

/**
 * Component with account avatar.
 */
export default function AccountAvatar(props: {
  account: string;
  accountProfileUriData?: ProfileUriData;
  size?: number;
  emojiSize?: number;
  sx?: SxProps;
}) {
  return (
    <Avatar
      sx={{
        width: props.size || 48,
        height: props.size || 48,
        borderRadius: props.size || 48,
        background: emojiAvatarForAddress(props.account).color,
        ...props.sx,
      }}
      src={
        props.accountProfileUriData?.image
          ? ipfsUriToHttpUri(props.accountProfileUriData.image)
          : undefined
      }
    >
      <Typography fontSize={props.emojiSize || 22}>
        {emojiAvatarForAddress(props.account).emoji}
      </Typography>
    </Avatar>
  );
}
