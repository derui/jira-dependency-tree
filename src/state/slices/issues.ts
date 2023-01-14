import { createSlice } from "@reduxjs/toolkit";
import produce from "immer";
import { synchronizeIssues, synchronizeIssuesFulfilled } from "../actions";
import { Issue } from "@/model/issue";
import { Loading } from "@/type";

interface IssuesState {
  issues: Issue[];
  loading: Loading;
}

const initialState = {
  issues: [],
  loading: "Completed",
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
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;