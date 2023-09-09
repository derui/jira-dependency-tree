import { createSlice } from "@reduxjs/toolkit";
import { restoreApiCredential, submitApiCredentialFulfilled } from "../actions";
import { ApiCredential } from "@/models/event";

interface ApiCredentialState {
  credential?: ApiCredential;
}

const initialState = {} as ApiCredentialState satisfies ApiCredentialState;

const slice = createSlice({
  name: "apiCredential",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // applying api credential
    builder.addCase(submitApiCredentialFulfilled, (state, action) => {
      state.credential = action.payload;
    });

    builder.addCase(restoreApiCredential, (state, action) => {
      state.credential = action.payload;
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
