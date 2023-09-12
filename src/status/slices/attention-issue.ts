import { createSlice } from "@reduxjs/toolkit";
import { attentionIssue, attentionIssueFulfilled } from "../actions";
import { IssueKey } from "@/type";

interface State {
  focusedIssueKey?: IssueKey;
}

const initialState = {} as State;

const slice = createSlice({
  name: "attentionIssue",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(attentionIssue, (state, { payload }) => {
      state.focusedIssueKey = payload;
    });

    builder.addCase(attentionIssueFulfilled, (state) => {
      state.focusedIssueKey = undefined;
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
