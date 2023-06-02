import useToast from "./useToast";

/**
 * Hook for work with errors.
 */
export default function useError() {
  const { showToastError } = useToast();

  let handleError = function (error: Error, isErrorToastRequired: boolean) {
    console.error(error);
    if (isErrorToastRequired) {
      showToastError(error);
    }
  };

  return {
    handleError,
  };
}
