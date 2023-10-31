import { createSlice } from "@reduxjs/toolkit";
import { loading } from "../actions";
import { IssueKey } from "@/type";

interface LoadingState {
  import: { loading: boolean; error?: string };
  issues: Record<IssueKey, boolean>;
}

const initialState: LoadingState = {
  import: {
    loading: false,
  },
  issues: {},
};

const slice = createSlice({
  name: "loading",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loading.startImport, (state, { payload }) => {
      state.import.loading = true;
      state.import.error = undefined;

      for (const issue of payload) {
        state.issues[issue] = true;
      }
    });

    builder.addCase(loading.finishImport, (state, { payload }) => {
      state.import.loading = false;

      for (const issue of payload) {
        delete state.issues[issue];
      }
    });

    builder.addCase(loading.errorImport, (state, { payload }) => {
      state.import.error = payload;

      state.issues = {};
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
