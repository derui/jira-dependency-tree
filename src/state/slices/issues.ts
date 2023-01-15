import { createSlice } from "@reduxjs/toolkit";
import produce from "immer";
import { searchIssue, synchronizeIssues, synchronizeIssuesFulfilled } from "../actions";
import { Issue } from "@/model/issue";
import { Loading } from "@/type";
import { filterEmptyString } from "@/util/basic";

interface IssuesState {
  issues: Issue[];
  loading: Loading;
  matchedIssues: Issue[];
}

const initialState = {
  issues: [],
  loading: "Completed",
  matchedIssues: [],
} as IssuesState satisfies IssuesState;

const slice = createSlice({
  name: "issues",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(synchronizeIssues, (state) => {
      return produce(state, (draft) => {
        draft.loading = "Loading";
      });
    });

    builder.addCase(synchronizeIssuesFulfilled, (state, action) => {
      return produce(state, (draft) => {
        draft.issues = action.payload;
        draft.loading = "Completed";
      });
    });

    builder.addCase(searchIssue, (state, { payload }) => {
      if (!filterEmptyString(payload)) {
        state.matchedIssues = [];
      } else {
        state.matchedIssues = state.issues.filter(
          (issue) => issue.key.includes(payload) || issue.summary.includes(payload),
        );
      }
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
