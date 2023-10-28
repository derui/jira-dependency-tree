import { createSlice } from "@reduxjs/toolkit";
import { clearIssueFilter, filterIssues, importIssues, issueSet, removeNode } from "../actions";
import { Issue } from "@/models/issue";
import { IssueKey } from "@/type";
import { filterEmptyString } from "@/utils/basic";

interface IssuesState {
  issues: Record<IssueKey, Issue>;
  matchedIssues: Issue[];
}

const initialState = {
  issues: {},
  matchedIssues: [],
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

      state.matchedIssues = Object.values(state.issues);
    });

    builder.addCase(filterIssues, (state, { payload }) => {
      if (!filterEmptyString(payload)) {
        state.matchedIssues = Object.values(state.issues);
      } else {
        const searchString = payload.toLowerCase();

        state.matchedIssues = Object.values(state.issues).filter(
          (issue) =>
            issue.key.toLowerCase().includes(searchString) || issue.summary.toLowerCase().includes(searchString),
        );
      }
    });

    builder.addCase(clearIssueFilter, (state) => {
      state.matchedIssues = [];
    });

    builder.addCase(removeNode, (state, { payload }) => {
      delete state.issues[payload];
    });

    builder.addCase(issueSet.select, (state) => {
      state.issues = {};
      state.matchedIssues = [];
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
