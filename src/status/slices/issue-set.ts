import { createSlice } from "@reduxjs/toolkit";
import { importIssues, issueSet, removeNode } from "../actions";
import { IssueSet } from "@/models/issue-set";

interface IssueSetState {
  currentIssueSetKey: string;
  issueSets: Record<string, IssueSet>;
}

const initialState: IssueSetState = {
  currentIssueSetKey: "Default",
  issueSets: { Default: { name: "Default", issueKeys: [] } },
};

const slice = createSlice({
  name: "issueSet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(importIssues, (state, { payload }) => {
      const issueSet = state.issueSets[state.currentIssueSetKey];

      if (!issueSet) {
        throw new Error(`Illegal state : not found current issue set | ${state.currentIssueSetKey}`);
      }

      issueSet.issueKeys = Array.from(new Set(issueSet.issueKeys.concat(payload.issues.map((v) => v.key))));
    });

    builder.addCase(removeNode, (state, { payload }) => {
      const issueSet = state.issueSets[state.currentIssueSetKey];

      if (!issueSet) {
        throw new Error(`Illegal state : not found current issue set | ${state.currentIssueSetKey}`);
      }

      issueSet.issueKeys = issueSet.issueKeys.filter((v) => v !== payload);
    });

    builder.addCase(issueSet.create, (state, { payload }) => {
      const exists = Object.keys(state.issueSets).includes(payload);
      if (exists) {
        return;
      }

      state.issueSets[payload] = { name: payload, issueKeys: [] };
    });

    builder.addCase(issueSet.delete, (state, { payload }) => {
      const exists = Object.keys(state.issueSets).includes(payload);
      if (!exists || state.currentIssueSetKey === payload) {
        return;
      }

      delete state.issueSets[payload];
    });

    builder.addCase(issueSet.rename, (state, { payload: { from, to } }) => {
      const old = state.issueSets[from];
      if (!old) {
        return;
      }

      delete state.issueSets[from];
      state.issueSets[to] = { name: to, issueKeys: old.issueKeys };

      if (state.currentIssueSetKey === from) {
        state.currentIssueSetKey = to;
      }
    });

    builder.addCase(issueSet.select, (state, { payload }) => {
      const old = state.issueSets[payload];
      if (!old) {
        return;
      }

      state.currentIssueSetKey = payload;
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
