import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "./_internal-hooks";
import { RootState } from "@/state/store";

const deletingDelta = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.relationDelta.deletingDelta,
);

const appendingDelta = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.relationDelta.appendingDelta,
);

type Result = {
  deleting: RootState["relationDelta"]["deletingDelta"];
  appending: RootState["relationDelta"]["appendingDelta"];
};

/**
 * get relations for issue
 */
export const useGetDelta = function useGetDelta(): Result {
  const deleting = useAppSelector(deletingDelta);
  const appending = useAppSelector(appendingDelta);

  return {
    appending,
    deleting,
  };
};
