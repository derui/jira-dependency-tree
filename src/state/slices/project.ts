import { createSlice } from "@reduxjs/toolkit";
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
    builder.addCase(submitProjectKey, (state) => {
      state.loading = Loading.Loading;
    });

    builder.addCase(submitProjectKeyFulfilled, (state, action) => {
      state.loading = Loading.Completed;
      state.project = action.payload;
      state.searchCondition = { projectKey: action.payload.key };
    });

    builder.addCase(changeConditionToEpic, (state, action) => {
      if (state.project) {
        state.searchCondition = { epic: action.payload, projectKey: state.project.key };
      }
    });

    builder.addCase(changeConditionToSprint, (state, action) => {
      if (state.project) {
        state.searchCondition = { sprint: action.payload, projectKey: state.project.key };
      }
    });

    builder.addCase(changeDefaultCondition, (state) => {
      if (state.project) {
        state.searchCondition = { projectKey: state.project.key };
      }
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
