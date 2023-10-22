import { createSlice } from "@reduxjs/toolkit";
import { loading } from "../actions";

interface LoadingState {
  import: boolean;
}

const initialState = {
  import: false,
} as LoadingState;

const slice = createSlice({
  name: "loading",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loading.startImport, (state) => {
      state.import = true;
    });

    builder.addCase(loading.finishImport, (state) => {
      state.import = false;
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
