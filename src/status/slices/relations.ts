import { createSlice } from "@reduxjs/toolkit";
import { importIssues, relations } from "../actions";
import { IssueRelationId } from "@/type";
import { Relation } from "@/models/issue";

interface RelationsState {
  relations: Record<IssueRelationId, Relation>;
  term?: string;
}

const initialState = {
  relations: {},
  term: undefined,
} as RelationsState satisfies RelationsState;

const slice = createSlice({
  name: "relationEditor",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(importIssues, (state, { payload }) => {
      state.relations = payload.issues.reduce<Record<IssueRelationId, Relation>>((accum, issue) => {
        issue.relations.forEach((v) => {
          accum[v.id] = v;
        });
        return accum;
      }, {});
    });

    builder.addCase(relations.reflect, (state, { payload: { appended, removed } }) => {
      removed.forEach((id) => {
        delete state.relations[id];
      });

      appended.forEach((relation) => {
        state.relations[relation.id] = relation;
      });

      return state;
    });

    builder.addCase(relations.filter, (state, { payload }) => {
      state.term = payload;

      return state;
    });

    builder.addCase(relations.clearFilter, (state) => {
      state.term = undefined;

      return state;
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
