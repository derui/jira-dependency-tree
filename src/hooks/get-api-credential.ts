import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "./hooks";
import type { RootState } from "@/state/store";
import { ApiCredential } from "@/model/event";

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
