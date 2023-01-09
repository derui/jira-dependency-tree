---
to: src/state/slices/<%= name %>.ts
---

import {createSlice} from '@reduxjs/toolkit';

interface <%= h.changeCase.pascal(name) %>State {
  // state of slice
}

const initialState = {

} satisfies State;

const slice = createSlice({
  name: <%= h.changeCase.camel(name) %>,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // use builder to add reducer
  }
});

export const reducer = slice.reducer;
