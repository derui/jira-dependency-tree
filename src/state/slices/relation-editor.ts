import { createSlice } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import {
  addRelation,
  addRelationAccepted,
  addRelationError,
  addRelationSucceeded,
  removeRelation,
  removeRelationError,
  removeRelationSucceeded,
  synchronizeIssues,
  synchronizeIssuesFulfilled,
} from "../actions";
import { IssueKey, IssueRelationId, Loading } from "@/type";
import { Relation } from "@/model/issue";

type DraftPerIssue = Record<IssueRelationId, Loading>;

interface RelationEditorState {
  loading: Loading;
  draft: Record<IssueKey, DraftPerIssue>;
  relations: Record<IssueKey, Record<IssueRelationId, Relation>>;
}

const initialState = {
  loading: Loading.Completed,
  draft: {},
  relations: {},
} as RelationEditorState satisfies RelationEditorState;

const deleteRelationFromDraft = (state: WritableDraft<RelationEditorState>, id: IssueRelationId) => {
  Object.values(state.draft).forEach((v) => {
    delete v[id];
  });
};

const slice = createSlice({
  name: "relationEditor",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(synchronizeIssues, (state) => {
      state.loading = Loading.Loading;
    });

    builder.addCase(synchronizeIssuesFulfilled, (state, { payload }) => {
      state.loading = Loading.Completed;

      state.draft = {};
      state.relations = payload.reduce<Record<string, Record<IssueRelationId, Relation>>>((accum, issue) => {
        accum[issue.key] = issue.relations.reduce<Record<IssueRelationId, Relation>>((relations, v) => {
          relations[v.id] = v;
          return relations;
        }, {});

        return accum;
      }, {});
    });

    builder.addCase(addRelationAccepted, (state, { payload }) => {
      if (state.draft[payload.fromKey]) {
        state.draft[payload.fromKey][payload.relationId] = Loading.Loading;
      } else {
        state.draft[payload.fromKey] = { [payload.relationId]: Loading.Loading };
      }

      if (state.draft[payload.toKey]) {
        state.draft[payload.toKey][payload.relationId] = Loading.Loading;
      } else {
        state.draft[payload.toKey] = { [payload.relationId]: Loading.Loading };
      }
    });

    builder.addCase(addRelationError, (state, { payload }) => {
      deleteRelationFromDraft(state, payload.relationId);
    });

    builder.addCase(addRelationSucceeded, (state, { payload }) => {
      deleteRelationFromDraft(state, payload.id);

      state.relations[payload.inwardIssue][payload.id] = payload;
      state.relations[payload.outwardIssue][payload.id] = payload;
    });

    builder.addCase(removeRelation, (state, { payload }) => {
      const relationInDraft = Object.values(state.draft)
        .map((v) => Object.keys(v))
        .flat();
      if (relationInDraft.includes(payload.relationId)) {
        return;
      }

      const issues = Object.entries(state.relations).filter(([, value]) => {
        return Object.keys(value).includes(payload.relationId);
      });

      issues.forEach(([key]) => {
        if (state.draft[key]) {
          state.draft[key][payload.relationId] = Loading.Loading;
        } else {
          state.draft[key] = { [payload.relationId]: Loading.Loading };
        }
      });
    });

    builder.addCase(removeRelationError, (state, { payload }) => {
      deleteRelationFromDraft(state, payload.relationId);
    });

    builder.addCase(removeRelationSucceeded, (state, { payload }) => {
      deleteRelationFromDraft(state, payload.relationId);

      Object.entries(state.relations).forEach(([, relations]) => {
        delete relations[payload.relationId];
      });
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
