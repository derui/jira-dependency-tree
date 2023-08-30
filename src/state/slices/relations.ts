import { createSlice } from "@reduxjs/toolkit";
import { synchronizeIssuesFulfilled } from "../actions";
import { IssueRelationId } from "@/type";
import { Relation } from "@/model/issue";

interface RelationsState {
  relations: Record<IssueRelationId, Relation>;
}

const initialState = {
  relations: {},
} as RelationsState satisfies RelationsState;

const slice = createSlice({
  name: "relationEditor",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(synchronizeIssuesFulfilled, (state, { payload }) => {
      state.relations = payload.reduce<Record<IssueRelationId, Relation>>((accum, issue) => {
        issue.relations.forEach((v) => {
          accum[v.id] = v;
        });
        return accum;
      }, {});
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
