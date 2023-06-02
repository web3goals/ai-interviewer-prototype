import { truncate } from "lodash";
import { useSnackbar } from "notistack";
import { errorToPrettyError } from "utils/errors";

/**
 * Hook for work with toasts.
 */
export default function useToasts() {
  const { enqueueSnackbar } = useSnackbar();

  let showToastSuccess = function (message: string) {
    enqueueSnackbar(message, {
      variant: "success",
    });
  };

  let showToastError = function (error: any) {
    const prettyError = errorToPrettyError(error);
    enqueueSnackbar(truncate(prettyError.message, { length: 256 }), {
      variant: prettyError.severity === "info" ? "info" : "error",
    });
  };

  return {
    showToastSuccess,
    showToastError,
  };
}
