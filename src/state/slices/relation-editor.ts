import { createSlice } from "@reduxjs/toolkit";
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
  relations: Record<IssueRelationId, Relation>;
}

const initialState = {
  loading: Loading.Completed,
  opened: false,
  draft: {},
  relations: {},
} as RelationEditorState satisfies RelationEditorState;

const deleteRelationFromDraft = (state: RelationEditorState, id: IssueRelationId) => {
  Object.values(state.draft).forEach((v) => {
    delete v[id];
  });
};

const getTargetRelations = (state: RelationEditorState, target: { fromKey: string; toKey: string }) => {
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
      state.relations = payload.reduce<Record<IssueRelationId, Relation>>((accum, issue) => {
        issue.relations.forEach((v) => {
          accum[v.id] = v;
        });
        return accum;
      }, {});
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
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
