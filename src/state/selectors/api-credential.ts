import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

const selectSelf = (state: RootState) => state;

/**
 * get current credential
 */
export const getApiCrednetial = () => {
  return createDraftSafeSelector(selectSelf, (state) => state.apiCredential.credential);
};
