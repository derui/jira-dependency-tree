import { createSlice } from "@reduxjs/toolkit";
import { loading } from "../actions";

interface LoadingState {
  import: { loading: boolean; error?: string };
}

const initialState = {
  import: {
    loading: false,
  },
} as LoadingState;

const slice = createSlice({
  name: "loading",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loading.startImport, (state) => {
      state.import.loading = true;
      state.import.error = undefined;
    });

    builder.addCase(loading.finishImport, (state) => {
      state.import.loading = false;
    });

    builder.addCase(loading.errorImport, (state, { payload }) => {
      state.import.error = payload;
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
