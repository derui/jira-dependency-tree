import { createSlice } from "@reduxjs/toolkit";
import { importIssues, issueSet, removeNode } from "../actions";
import { Issue } from "@/models/issue";
import { IssueKey } from "@/type";

interface IssuesState {
  issues: Record<IssueKey, Issue>;
}

const initialState = {
  issues: {},
} as IssuesState satisfies IssuesState;

const slice = createSlice({
  name: "issues",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(importIssues, (state, action) => {
      state.issues = action.payload.issues
        .filter((issue) => issue.parentIssue === undefined)
        .reduce<IssuesState["issues"]>((accum, v) => {
          accum[v.key] = v;
          return accum;
        }, {});
    });

    builder.addCase(removeNode, (state, { payload }) => {
      delete state.issues[payload];
    });

    builder.addCase(issueSet.select, (state) => {
      state.issues = {};
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
