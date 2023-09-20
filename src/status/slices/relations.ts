import { createSlice } from "@reduxjs/toolkit";
import { highlightRelatedNodes, importIssues, relations, removeNode, resetHighlightRelationNodes } from "../actions";
import { IssueRelationId } from "@/type";
import { Relation } from "@/models/issue";

interface RelationsState {
  relations: Record<IssueRelationId, Relation>;
  highlightedRelations: Record<IssueRelationId, Relation>;
  term?: string;
}

const initialState = {
  relations: {},
  highlightedRelations: {},
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

    builder.addCase(highlightRelatedNodes, (state, { payload }) => {
      const related = Object.values(state.relations).filter((r) => {
        return r.inwardIssue === payload || r.outwardIssue === payload;
      });

      state.highlightedRelations = Object.fromEntries(related.map((r) => [r.id, r]));
    });

    builder.addCase(resetHighlightRelationNodes, (state) => {
      state.highlightedRelations = {};
    });

    builder.addCase(removeNode, (state, { payload }) => {
      for (const key of Object.keys(state.relations)) {
        const relation = state.relations[key];

        if (relation.inwardIssue === payload || relation.outwardIssue === payload) {
          delete state.relations[key];
        }
      }
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
