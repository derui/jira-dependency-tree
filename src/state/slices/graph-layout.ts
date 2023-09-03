import { createSlice } from "@reduxjs/toolkit";
import { changeGraphLayout } from "../actions";
import { GraphLayout } from "@/drivers/issue-graph/type";

interface GraphLayoutState {
  layout: GraphLayout;
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
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
