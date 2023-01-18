import { createSlice } from "@reduxjs/toolkit";
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
      state.loading = "Loading";
    });

    builder.addCase(synchronizeIssuesFulfilled, (state, action) => {
      state.issues = action.payload;
      state.loading = "Completed";
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
