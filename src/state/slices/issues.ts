import { createSlice } from "@reduxjs/toolkit";
import {
  addRelationSucceeded,
  expandIssue,
  narrowExpandedIssue,
  removeRelationSucceeded,
  searchIssue,
  synchronizeIssues,
  synchronizeIssuesFulfilled,
} from "../actions";
import { Issue } from "@/model/issue";
import { IssueKey, Loading } from "@/type";
import { filterEmptyString } from "@/util/basic";

type ProjectionTarget = { kind: "Root" } | { kind: "InsideIssue"; issueKey: IssueKey };

interface IssuesState {
  issues: Issue[];
  loading: Loading;
  matchedIssues: Issue[];
  projectionTarget: ProjectionTarget;
  _originalIssues: Issue[];
}

const initialState = {
  issues: [],
  loading: "Completed",
  matchedIssues: [],
  projectionTarget: { kind: "Root" },
  _originalIssues: [],
} as IssuesState satisfies IssuesState;

const slice = createSlice({
  name: "issues",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(synchronizeIssues, (state) => {
      state.loading = "Loading";
    });

    builder.addCase(synchronizeIssuesFulfilled, (state, action) => {
      state._originalIssues = action.payload;
      state.loading = "Completed";

      const target = state.projectionTarget;
      switch (target.kind) {
        case "Root":
          state.issues = action.payload;
          break;
        case "InsideIssue":
          state.issues = action.payload.filter((issue) => issue.parentIssue === target.issueKey);
          break;
      }
    });

    builder.addCase(searchIssue, (state, { payload }) => {
      if (!filterEmptyString(payload)) {
        state.matchedIssues = [];
      } else {
        state.matchedIssues = state.issues.filter(
          (issue) => issue.key.includes(payload) || issue.summary.includes(payload),
        );
      }
    });

    builder.addCase(addRelationSucceeded, (state, { payload }) => {
      const issueMap = new Map(state.issues.map((v) => [v.key, v]));

      const issueFromKey = issueMap.get(payload.inwardIssue);
      const issueToKey = issueMap.get(payload.outwardIssue);

      if (issueFromKey) {
        issueFromKey.relations.push(payload);
      } else {
        state.issues.push({
          key: payload.inwardIssue,
          summary: "Unknown issue",
          description: "",
          statusId: "",
          selfUrl: "",
          typeId: "",
          relations: [{ ...payload }],
        });
      }

      if (issueToKey) {
        issueToKey.relations.push(payload);
      } else {
        state.issues.push({
          key: payload.outwardIssue,
          summary: "Unknown issue",
          description: "",
          statusId: "",
          selfUrl: "",
          typeId: "",
          relations: [{ ...payload }],
        });
      }
    });

    builder.addCase(removeRelationSucceeded, (state, { payload }) => {
      state.issues.forEach((issue) => {
        const index = issue.relations.findIndex((r) => r.id === payload.relationId);

        if (index !== -1) {
          issue.relations.splice(index, 1);
        }
      });
    });

    builder.addCase(expandIssue, (state, { payload }) => {
      state.projectionTarget = { kind: "InsideIssue", issueKey: payload };
      state.issues = state._originalIssues.filter((issue) => issue.parentIssue === payload);
    });

    builder.addCase(narrowExpandedIssue, (state) => {
      state.issues = state._originalIssues;
      state.projectionTarget = { kind: "Root" };
    });
  },
});

export const getInitialState = slice.getInitialState;
export const reducer = slice.reducer;
