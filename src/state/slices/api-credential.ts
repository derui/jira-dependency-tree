import { createSlice } from "@reduxjs/toolkit";
import { ApiCredential } from "@/model/event";

interface ApiCredentialState {
  credential?: ApiCredential;
}

const initialState = {} satisfies ApiCredentialState;

const slice = createSlice({
  name: "apiCredential",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // use builder to add reducer
  },
});

export const reducer = slice.reducer;
