import test from "ava";
import { searchIssue, synchronizeIssues, synchronizeIssuesFulfilled } from "../actions";
import { getInitialState, reducer } from "./issues";
import { Loading } from "@/type";
import { Issue } from "@/model/issue";

test("initial state", (t) => {
  t.deepEqual(getInitialState(), { issues: [], loading: Loading.Completed, matchedIssues: [] });
});

test("loading", (t) => {
  const ret = reducer(getInitialState(), synchronizeIssues());

  t.is(ret.loading, Loading.Loading);
  t.deepEqual(ret.issues, []);
});

test("loaded issues", (t) => {
  const issue = {
    key: "key",
    summary: "summary",
    description: "description",
    statusId: "",
    typeId: "",
    selfUrl: "",
    outwardIssueKeys: [],
  };
  const ret = reducer(getInitialState(), synchronizeIssuesFulfilled([issue]));

  t.is(ret.issues.length, 1);
  t.is(ret.issues[0], issue);
  t.is(ret.loading, Loading.Completed);
});

test("get issue matched", (t) => {
  const issues: Issue[] = [
    {
      key: "key",
      summary: "summary",
      description: "description",
      statusId: "",
      typeId: "",
      selfUrl: "",
      outwardIssueKeys: [],
    },
    { key: "not match", summary: "not match" } as Issue satisfies Issue,
  ];
  let ret = reducer(getInitialState(), synchronizeIssuesFulfilled(issues));
  ret = reducer(ret, searchIssue("ke"));

  t.is(ret.matchedIssues.length, 1);
  t.deepEqual(ret.matchedIssues, [issues[0]]);
});
