import { createSlice } from "@reduxjs/toolkit";
import { changeZoom } from "../actions";

interface ZoomState {
  zoomPercentage: number;
}

const initialState = {
  zoomPercentage: 100,
} as ZoomState satisfies ZoomState;

const slice = createSlice({
  name: "zoom",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(changeZoom, (state, { payload }) => {
      state.zoomPercentage = payload;
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
