import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "./_internal-hooks";
import { RootState } from "@/state/store";

const selectDeletingDelta = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.relationDelta.deletingDelta,
);

const selectAppendingDelta = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.relationDelta.appendingDelta,
);

const selectPreparation = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.relationDelta.preparationToAdd,
);

type Result = {
  deleting: RootState["relationDelta"]["deletingDelta"];
  appending: RootState["relationDelta"]["appendingDelta"];
  preparation: RootState["relationDelta"]["preparationToAdd"];
  hasDelta: boolean;
};

/**
 * get relations for issue
 */
export const useGetDelta = function useGetDelta(): Result {
  const deleting = useAppSelector(selectDeletingDelta);
  const appending = useAppSelector(selectAppendingDelta);
  const preparation = useAppSelector(selectPreparation);

  const hasDelta = Object.keys(deleting).length > 0 || Object.keys(appending).length > 0;

  return {
    appending,
    deleting,
    preparation,
    hasDelta,
  };
};
