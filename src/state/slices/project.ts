import { createSlice } from "@reduxjs/toolkit";
import produce from "immer";
import {
  changeConditionToEpic,
  changeConditionToSprint,
  changeDefaultCondition,
  submitProjectKeyFulfilled,
} from "../actions";
import { SearchCondition } from "@/model/event";
import { Project } from "@/model/project";

interface ProjectState {
  project?: Project;
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
        draft.project = action.payload;
        draft.searchCondition = { projectKey: action.payload.key };
      });
    });

    builder.addCase(changeConditionToEpic, (state, action) => {
      return produce(state, (draft) => {
        if (draft.project) {
          draft.searchCondition = { epic: action.payload, projectKey: draft.project.key };
        }
      });
    });

    builder.addCase(changeConditionToSprint, (state, action) => {
      return produce(state, (draft) => {
        if (draft.project) {
          draft.searchCondition = { sprint: action.payload, projectKey: draft.project.key };
        }
      });
    });

    builder.addCase(changeDefaultCondition, (state) => {
      return produce(state, (draft) => {
        if (draft.project) {
          draft.searchCondition = { projectKey: draft.project.key };
        }
      });
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
