import { createSlice } from "@reduxjs/toolkit";
import { payAttentionIssue } from "../actions";
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
    builder.addCase(payAttentionIssue, (state, { payload }) => {
      state.focusedIssueKey = payload;
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
