import { createSlice } from "@reduxjs/toolkit";
import { changeToHorizontalLayout, changeToVerticalLayout } from "../actions";
import { GraphLayout } from "@/issue-graph/type";

interface GraphLayoutState {
  graphLayout: GraphLayout;
}

const initialState = {
  graphLayout: GraphLayout.Horizontal,
} as GraphLayoutState satisfies GraphLayoutState;

const slice = createSlice({
  name: "graphLayout",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(changeToVerticalLayout, (state) => {
        state.graphLayout = GraphLayout.Vertical;
      })
      .addCase(changeToHorizontalLayout, (state) => {
        state.graphLayout = GraphLayout.Horizontal;
      });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
