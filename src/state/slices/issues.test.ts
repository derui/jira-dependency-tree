import test from "ava";
import { synchronizeIssues, synchronizeIssuesFulfilled } from "../actions";
import { getInitialState, reducer } from "./issues";
import { ApiCredential, SearchCondition } from "@/model/event";

test("initial state", (t) => {
  t.deepEqual(getInitialState(), { issues: [], loading: false });
});
test("loading", (t) => {
  const ret = reducer(
    getInitialState(),
    synchronizeIssues({
      apiCredential: {} as ApiCredential,
      searchCondition: {} as SearchCondition,
    }),
  );

  t.is(ret.loading, true);
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
  t.is(ret.loading, false);
});
