import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Loading } from "@/type";

const selectSelf = (state: RootState) => state;
const selectIssues = createDraftSafeSelector(selectSelf, (state) => state.issues);

export const queryIssues = () =>
  createDraftSafeSelector(selectIssues, (state) => [
    state.loading,
    state.loading === Loading.Loading ? undefined : state.issues,
  ]);
