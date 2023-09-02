import { createSlice } from "@reduxjs/toolkit";
import {
  clearIssueFilter,
  expandIssue,
  filterIssues,
  importIssues,
  narrowExpandedIssue,
  searchIssue,
} from "../actions";
import { Issue } from "@/model/issue";
import { IssueKey, Loading } from "@/type";
import { filterEmptyString } from "@/util/basic";

type ProjectionTarget = { kind: "Root" } | { kind: "InsideIssue"; issueKey: IssueKey };

interface IssuesState {
  issues: Record<IssueKey, Issue>;
  loading: Loading;
  matchedIssues: Issue[];
  projectionTarget: ProjectionTarget;
  _originalIssues: Issue[];
}

const initialState = {
  issues: {},
  loading: "Completed",
  matchedIssues: [],
  projectionTarget: { kind: "Root" },
  _originalIssues: [],
} as IssuesState satisfies IssuesState;

const slice = createSlice({
  name: "issues",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(importIssues, (state, action) => {
      state._originalIssues = action.payload.issues;
      state.loading = "Completed";

      const target = state.projectionTarget;
      switch (target.kind) {
        case "Root":
          state.issues = action.payload.issues
            .filter((issue) => issue.parentIssue === undefined)
            .reduce<IssuesState["issues"]>((accum, v) => {
              accum[v.key] = v;
              return accum;
            }, {});
          break;
        case "InsideIssue":
          state.issues = action.payload.issues
            .filter((issue) => issue.parentIssue === target.issueKey)
            .reduce<IssuesState["issues"]>((accum, v) => {
              accum[v.key] = v;
              return accum;
            }, {});
          break;
      }
    });

    builder.addCase(filterIssues, (state, { payload }) => {
      if (!filterEmptyString(payload)) {
        state.matchedIssues = [];
      } else {
        state.matchedIssues = state.issues.filter(
          (issue) => issue.key.includes(payload) || issue.summary.includes(payload),
        );
      }
    });

    builder.addCase(clearIssueFilter, (state) => {
      state.matchedIssues = [];
    });

    builder.addCase(expandIssue, (state, { payload }) => {
      state.projectionTarget = { kind: "InsideIssue", issueKey: payload };
      state.issues = state._originalIssues.filter((issue) => issue.parentIssue === payload);
    });

    builder.addCase(narrowExpandedIssue, (state) => {
      state.issues = state._originalIssues.filter((issue) => issue.parentIssue === undefined);
      state.projectionTarget = { kind: "Root" };
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
