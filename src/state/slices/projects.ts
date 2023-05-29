import { createSlice } from "@reduxjs/toolkit";
import { projects } from "../actions";
import { SimpleProject } from "../models/simple-project";
import { Loading } from "@/type";

interface ProjectsState {
  projects: Record<string, SimpleProject>;
  loading: Loading;
}

const initialState = {
  projects: {},
  loading: Loading.Completed as Loading,
} as ProjectsState satisfies ProjectsState;

const slice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(projects.loadProjects, (state) => {
      state.loading = Loading.Loading;
    });

    builder.addCase(projects.loadProjectsSucceeded, (state, { payload }) => {
      state.projects = {};
      state.loading = Loading.Completed;

      for (const value of Object.values(payload.projects)) {
        state.projects[value.id] = value;
      }
    });

    builder.addCase(projects.loadProjectsError, (state) => {
      state.loading = Loading.Errored;
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
