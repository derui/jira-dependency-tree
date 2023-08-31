import { createSlice } from "@reduxjs/toolkit";
import { relations } from "../actions";
import { AppendingRelationDelta, DeletingRelationDelta, RelationDelta } from "@/model/relation-delta";
import { DeltaId } from "@/type";

interface RelationDeltaState {
  appendingDelta: Record<DeltaId, AppendingRelationDelta>;
  deletingDelta: Record<DeltaId, DeletingRelationDelta>;
}

const initialState = {
  appendingDelta: {},
  deletingDelta: {},
} as RelationDeltaState;

const containsDelta = function containsDelta(state: RelationDeltaState, givenDelta: RelationDelta) {
  if (givenDelta.kind === "append") {
    const deltas = Object.values(state.appendingDelta);

    return deltas.some((v) => {
      return v.inwardIssue === givenDelta.inwardIssue && v.outwardIssue === givenDelta.outwardIssue;
    });
  } else {
    const deltas = Object.values(state.deletingDelta);

    return deltas.some((v) => {
      return v.relationId === givenDelta.relationId;
    });
  }
};

const slice = createSlice({
  name: "relationDelta",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(relations.appendDelta, (state, { payload }) => {
      if (containsDelta(state, payload)) {
        return state;
      }

      switch (payload.kind) {
        case "append":
          state.appendingDelta[payload.deltaId] = payload;
          break;
        case "delete":
          state.deletingDelta[payload.deltaId] = payload;
          break;
      }

      return state;
    });

    builder.addCase(relations.deleteDelta, (state, { payload }) => {
      delete state.appendingDelta[payload];
      delete state.deletingDelta[payload];

      return state;
    });

    builder.addCase(relations.reset, () => {
      return { appendingDelta: {}, deletingDelta: {} };
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
