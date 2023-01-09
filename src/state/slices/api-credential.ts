import { createSlice } from "@reduxjs/toolkit";
import produce from "immer";
import { restoreApiCredential, submitApiCredentialFulfilled } from "../actions";
import { ApiCredential } from "@/model/event";

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
      return produce(state, (draft) => {
        draft.credential = action.payload;
      });
    });

    builder.addCase(restoreApiCredential, (state, action) => {
      return produce(state, (draft) => {
        draft.credential = action.payload;
      });
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
