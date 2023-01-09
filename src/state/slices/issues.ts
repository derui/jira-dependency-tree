import { createSlice } from "@reduxjs/toolkit";
import produce from "immer";
import { synchronizeIssues, synchronizeIssuesFulfilled } from "../actions";
import { Issue } from "@/model/issue";

interface IssuesState {
  issues: Issue[];
  loading: boolean;
}

const initialState = {
  issues: [],
  loading: false,
} as IssuesState satisfies IssuesState;

const slice = createSlice({
  name: "issues",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(synchronizeIssues, (state) => {
      return produce(state, (draft) => {
        draft.loading = true;
      });
    });

    builder.addCase(synchronizeIssuesFulfilled, (state, action) => {
      return produce(state, (draft) => {
        draft.issues = action.payload;
        draft.loading = false;
      });
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
