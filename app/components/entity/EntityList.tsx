import { SxProps, Box, Stack, Typography } from "@mui/material";
import {
  CardBox,
  ExtraLargeLoadingButton,
  FullWidthSkeleton,
} from "components/styled";
import { ReactNode } from "react";

/**
 * A component with entity list.
 */
export default function EntityList(props: {
  entities: any[] | undefined;
  renderEntityCard: (entity: any, key: number) => ReactNode;
  noEntitiesText: string;
  displayLoadMoreButton?: boolean;
  isMoreLoading?: boolean;
  onLoadMoreButtonClick?: () => void;
  sx?: SxProps;
}) {
  return (
    <Box
      width={1}
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ ...props.sx }}
    >
      {/* Not empty list */}
      {props.entities && props.entities.length > 0 && (
        <>
          <Stack width={1} spacing={2}>
            {props.entities.map((entity, index) =>
              props.renderEntityCard(entity, index)
            )}
          </Stack>
          {props.displayLoadMoreButton && (
            <ExtraLargeLoadingButton
              variant="outlined"
              loading={props.isMoreLoading}
              onClick={props.onLoadMoreButtonClick}
              sx={{ mt: 4 }}
            >
              Load More
            </ExtraLargeLoadingButton>
          )}
        </>
      )}
      {/* Empty list */}
      {props.entities && props.entities.length === 0 && (
        <CardBox>
          <Typography textAlign="center">{props.noEntitiesText}</Typography>
        </CardBox>
      )}
      {/* Loading list */}
      {!props.entities && <FullWidthSkeleton />}
    </Box>
  );
}
