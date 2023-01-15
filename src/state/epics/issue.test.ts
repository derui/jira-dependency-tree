import test from "ava";
import { TestScheduler } from "rxjs/testing";
import { StateObservable } from "redux-observable";
import { NEVER, of } from "rxjs";
import { createDependencyRegistrar } from "../../util/dependency-registrar";
import { Dependencies } from "../../dependencies";
import { synchronizeIssues, synchronizeIssuesFulfilled } from "../actions";
import { createPureStore } from "../store";
import * as epic from "./issue";

const registrar = createDependencyRegistrar<Dependencies>();
const env = {
  apiBaseUrl: "http://base.url",
  apiKey: "key",
};
registrar.register("env", env);

test("return empty action if no any credential", (t) => {
  t.plan(1);
  const testScheduler = new TestScheduler((a, b) => {
    t.deepEqual(a, b);
  });

  const store = createPureStore();
  const epics = epic.issueEpic(registrar);

  testScheduler.run(({ hot, expectObservable: expect }) => {
    const action$ = hot("-a", {
      a: synchronizeIssues(),
    });

    const state$ = new StateObservable(NEVER, store.getState());

    const ret$ = epics.synchronizeIssues(action$, state$, null);

    expect(ret$).toBe("-a", {
      a: synchronizeIssuesFulfilled([]),
    });
  });
});
