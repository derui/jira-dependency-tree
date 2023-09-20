import { createSlice } from "@reduxjs/toolkit";
import { changeGraphLayout, deselectIssueInGraph, selectIssueInGraph } from "../actions";
import { GraphLayout, IssueKey } from "@/type";

interface GraphLayoutState {
  layout: GraphLayout;
  selectedIssue?: IssueKey;
}

const initialState = {
  layout: GraphLayout.Horizontal,
} as GraphLayoutState;

const slice = createSlice({
  name: "graphLayout",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(changeGraphLayout, (state, { payload }) => {
      state.layout = payload;
    });

    builder.addCase(selectIssueInGraph, (state, { payload }) => {
      state.selectedIssue = payload;
    });

    builder.addCase(deselectIssueInGraph, (state, { payload }) => {
      state.selectedIssue = undefined;
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
