import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { IssueRequest } from "../actions";
import { Loading } from "@/type";

const selectSelf = (state: RootState) => state;
const selectIssues = createDraftSafeSelector(selectSelf, (state) => state.issues);

export const queryIssues = () =>
  createDraftSafeSelector(selectIssues, (state) => [
    state.loading,
    state.loading === Loading.Loading ? undefined : state.issues,
  ]);

const selectCredential = createDraftSafeSelector(selectSelf, (state) => state.apiCredential.credential);
const selectSearchCondition = createDraftSafeSelector(selectSelf, (state) =>
  state.project.project ? state.project.searchCondition : undefined,
);

export const getIssueRequest = () =>
  createDraftSafeSelector(
    selectCredential,
    selectSearchCondition,
    (credential, condition): IssueRequest | undefined => {
      if (!credential || !condition) {
        return undefined;
      }

      return {
        apiCredential: credential,
        searchCondition: condition,
      };
    },
  );
