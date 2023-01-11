import { createSlice } from "@reduxjs/toolkit";
import produce from "immer";
import {
  changeConditionToEpic,
  changeConditionToSprint,
  changeDefaultCondition,
  submitProjectKey,
  submitProjectKeyFulfilled,
} from "../actions";
import { SearchCondition } from "@/model/event";
import { Project } from "@/model/project";
import { Loading } from "@/type";

interface ProjectState {
  project?: Project;
  searchCondition: SearchCondition;
  loading: Loading;
}

const initialState = {
  searchCondition: {},
  loading: Loading.Completed,
} as ProjectState satisfies ProjectState;

const slice = createSlice({
  name: "project",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitProjectKey, (state) => {
        state.loading = Loading.Loading;
      })
      .addCase(submitProjectKeyFulfilled, (state, action) => {
        return produce(state, (draft) => {
          draft.loading = Loading.Completed;
          draft.project = action.payload;
          draft.searchCondition = { projectKey: action.payload.key };
        });
      })

      .addCase(changeConditionToEpic, (state, action) => {
        return produce(state, (draft) => {
          if (draft.project) {
            draft.searchCondition = { epic: action.payload, projectKey: draft.project.key };
          }
        });
      })

      .addCase(changeConditionToSprint, (state, action) => {
        return produce(state, (draft) => {
          if (draft.project) {
            draft.searchCondition = { sprint: action.payload, projectKey: draft.project.key };
          }
        });
      })

      .addCase(changeDefaultCondition, (state) => {
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
