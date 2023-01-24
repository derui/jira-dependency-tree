import { createSlice } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import {
  addRelationAccepted,
  addRelationError,
  addRelationSucceeded,
  deselectIssueInGraph,
  removeRelation,
  removeRelationError,
  removeRelationSucceeded,
  selectIssueInGraph,
  synchronizeIssues,
  synchronizeIssuesFulfilled,
} from "../actions";
import { IssueKey, IssueRelationId, Loading } from "@/type";
import { Relation } from "@/model/issue";

type DraftPerIssue = Record<IssueRelationId, Loading>;

interface RelationEditorState {
  loading: Loading;
  opened: boolean;
  selectedIssueKey: IssueKey | undefined;
  draft: Record<IssueKey, DraftPerIssue>;
  relations: Record<IssueKey, Record<IssueRelationId, Relation>>;
}

const initialState = {
  loading: Loading.Completed,
  opened: false,
  draft: {},
  relations: {},
} as RelationEditorState satisfies RelationEditorState;

const deleteRelationFromDraft = (state: WritableDraft<RelationEditorState>, id: IssueRelationId) => {
  Object.values(state.draft).forEach((v) => {
    delete v[id];
  });
};

const getTargetRelations = (state: WritableDraft<RelationEditorState>, target: { fromKey: string; toKey: string }) => {
  return Object.entries(state.relations)
    .map(([, value]) => {
      return Object.values(value)
        .flat()
        .filter((relation) => {
          return relation.inwardIssue === target.fromKey && relation.outwardIssue === target.toKey;
        });
    })
    .flat();
};

const slice = createSlice({
  name: "relationEditor",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(selectIssueInGraph, (state, { payload }) => {
      state.selectedIssueKey = payload;
      state.opened = true;
    });

    builder.addCase(deselectIssueInGraph, (state) => {
      state.opened = false;
      state.selectedIssueKey = undefined;
    });

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

      const tempRelation = {
        id: payload.relationId,
        externalId: "",
        inwardIssue: payload.fromKey,
        outwardIssue: payload.toKey,
      };
      state.relations[payload.fromKey][payload.relationId] = tempRelation;
      state.relations[payload.toKey][payload.relationId] = tempRelation;
    });

    builder.addCase(addRelationError, (state, { payload }) => {
      deleteRelationFromDraft(state, payload.relationId);

      delete state.relations[payload.fromKey][payload.relationId];
      delete state.relations[payload.toKey][payload.relationId];
    });

    builder.addCase(addRelationSucceeded, (state, { payload }) => {
      deleteRelationFromDraft(state, payload.id);

      state.relations[payload.inwardIssue][payload.id] = payload;
      state.relations[payload.outwardIssue][payload.id] = payload;
    });

    builder.addCase(removeRelation, (state, { payload }) => {
      const targetRelations = getTargetRelations(state, payload);

      targetRelations.forEach((relation) => {
        if (state.draft[relation.inwardIssue]) {
          state.draft[relation.inwardIssue][relation.id] = Loading.Loading;
        } else {
          state.draft[relation.inwardIssue] = { [relation.id]: Loading.Loading };
        }

        if (state.draft[relation.outwardIssue]) {
          state.draft[relation.outwardIssue][relation.id] = Loading.Loading;
        } else {
          state.draft[relation.outwardIssue] = { [relation.id]: Loading.Loading };
        }
      });
    });

    builder.addCase(removeRelationError, (state, { payload }) => {
      const targetRelations = getTargetRelations(state, payload);

      targetRelations.forEach((v) => {
        deleteRelationFromDraft(state, v.id);
      });
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
