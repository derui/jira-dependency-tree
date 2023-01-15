import test from "ava";
import { TestScheduler } from "rxjs/testing";
import { StateObservable } from "redux-observable";
import { NEVER } from "rxjs";
import { focusIssueOnSearch, focusIssueOnSearchFulfilled } from "../actions";
import { Dependencies } from "../../dependencies";
import { createDependencyRegistrar } from "../../util/dependency-registrar";
import { RootState } from "../store";
import * as epic from "./issue-graph";

test("send command to issue graph", async (t) => {
  t.plan(3);
  const registrar = createDependencyRegistrar<Dependencies>();
  registrar.register("sendCommandTo", (payload) => {
    t.is(payload.kind, "AttentionIssue");
    t.is(payload.key, "key");
  });
  const scheduler = new TestScheduler(t.deepEqual);

  scheduler.run(({ hot, expectObservable }) => {
    const action$ = hot("-a", { a: focusIssueOnSearch("key") });
    const state$ = new StateObservable(NEVER, {} as RootState);

    const ret$ = epic.issueGraphEpic(registrar).sendIssueFocusingAction(action$, state$, null);

    expectObservable(ret$).toBe("-a", { a: focusIssueOnSearchFulfilled() });
  });
});
