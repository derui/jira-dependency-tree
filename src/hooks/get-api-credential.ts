import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "./_internal-hooks";
import type { RootState } from "@/status/store";
import { ApiCredential } from "@/models/event";

const selector = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.apiCredential.credential,
);

/**
 * the hook to get api credential currently enabled
 */
export const useGetApiCredential = function useGetApiCredential(): ApiCredential | undefined {
  const apiCredential = useAppSelector(selector);

  return apiCredential;
};
