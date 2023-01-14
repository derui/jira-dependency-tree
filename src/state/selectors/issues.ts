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

export const isSyncable = () =>
  createDraftSafeSelector(selectSelf, (state) =>
    state.apiCredential.credential && state.project.project && state.issues.loading !== Loading.Loading ? true : false,
  );

export const selectMatchedIssue = (term: string) =>
  createDraftSafeSelector(selectIssues, (state) =>
    state.issues.filter((issue) => issue.key.includes(term) || issue.summary.includes(term)),
  );
