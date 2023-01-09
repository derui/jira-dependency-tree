import { createSlice } from "@reduxjs/toolkit";
import produce from "immer";
import {
  changeConditionToEpic,
  changeConditionToSprint,
  changeDefaultCondition,
  submitProjectKeyFulfilled,
} from "../actions";
import { SearchCondition } from "@/model/event";

interface ProjectState {
  key?: string;
  searchCondition: SearchCondition;
}

const initialState = {
  searchCondition: {},
} as ProjectState satisfies ProjectState;

const slice = createSlice({
  name: "project",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(submitProjectKeyFulfilled, (state, action) => {
      return produce(state, (draft) => {
        draft.key = action.payload;
      });
    });

    builder.addCase(changeConditionToEpic, (state, action) => {
      return produce(state, (draft) => {
        if (draft.key) {
          draft.searchCondition = { epic: action.payload, projectKey: draft.key };
        }
      });
    });

    builder.addCase(changeConditionToSprint, (state, action) => {
      return produce(state, (draft) => {
        if (draft.key) {
          draft.searchCondition = { sprint: action.payload, projectKey: draft.key };
        }
      });
    });

    builder.addCase(changeDefaultCondition, (state) => {
      return produce(state, (draft) => {
        if (draft.key) {
          draft.searchCondition = { projectKey: draft.key };
        }
      });
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
