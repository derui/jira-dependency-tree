import test from "ava";
import { TestScheduler } from "rxjs/testing";
import { StateObservable } from "redux-observable";
import { NEVER, of } from "rxjs";
import { createDependencyRegistrar } from "../../util/dependency-registrar";
import { Dependencies } from "../../dependencies";
import {
  submitApiCredentialFulfilled,
  submitProjectKeyFulfilled,
  synchronizeIssues,
  synchronizeIssuesFulfilled,
} from "../actions";
import { createPureStore } from "../store";
import * as epic from "./issue";
import { Issue } from "@/model/issue";
import { randomCredential, randomProject } from "@/mock-data";

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

test("get issues from response", (t) => {
  t.plan(1);
  const testScheduler = new TestScheduler((a, b) => {
    t.deepEqual(a, b);
  });

  testScheduler.run(({ cold, hot, expectObservable: expect }) => {
    registrar.register("postJSON", () => {
      return cold("--a", {
        a: [{ key: "key", summary: "summary", description: "description", subtasks: [], links: [] }],
      });
    });

    const store = createPureStore();
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));
    store.dispatch(submitProjectKeyFulfilled(randomProject()));

    const epics = epic.issueEpic(registrar);

    const action$ = hot("-a", {
      a: synchronizeIssues(),
    });

    const state$ = new StateObservable(NEVER, store.getState());

    const ret$ = epics.synchronizeIssues(action$, state$, null);

    expect(ret$).toBe("---a", {
      a: synchronizeIssuesFulfilled([
        {
          key: "key",
          summary: "summary",
          description: "description",
          outwardIssueKeys: [],
          selfUrl: "",
          statusId: "",
          typeId: "",
        },
      ]),
    });
  });
});
