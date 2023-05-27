import { test, expect } from "vitest";
import { TestScheduler } from "rxjs/testing";
import { StateObservable } from "redux-observable";
import { NEVER } from "rxjs";
import { createDependencyRegistrar } from "../../util/dependency-registrar";
import { Dependencies } from "../../dependencies";
import {
  submitApiCredentialFulfilled,
  submitProjectIdFulfilled,
  synchronizeIssues,
  synchronizeIssuesFulfilled,
} from "../actions";
import { createPureStore } from "../store";
import * as epic from "./issue";
import { randomCredential, randomProject } from "@/mock-data";

test("return empty action if no any credential", () => {
  const testScheduler = new TestScheduler((a, b) => {
    expect(a).toEqual(b);
  });
  const registrar = createDependencyRegistrar<Dependencies>();
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

test("get issues from response", () => {
  const testScheduler = new TestScheduler((a, b) => {
    expect(a).toEqual(b);
  });

  testScheduler.run(({ cold, hot, expectObservable: expect }) => {
    const registrar = createDependencyRegistrar<Dependencies>();
    registrar.register("postJSON", () => {
      return cold("--a", {
        a: [{ key: "key", summary: "summary", description: "description", subtasks: [], links: [] }],
      });
    });

    const store = createPureStore();
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));
    store.dispatch(submitProjectIdFulfilled(randomProject()));

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
          relations: [],
          selfUrl: "",
          statusId: "",
          typeId: "",
          subIssues: [],
        },
      ]),
    });
  });
});

test("apply relations", () => {
  const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b));

  testScheduler.run(({ cold, hot, expectObservable: expect }) => {
    const registrar = createDependencyRegistrar<Dependencies>();
    registrar.register("postJSON", () => {
      return cold("--a", {
        a: [
          { key: "key", summary: "summary", description: "description", subtasks: ["a", "b"], links: [] },
          {
            key: "a",
            summary: "summary",
            description: "description",
            subtasks: [],
            links: [
              {
                id: "id2",
                inwardIssue: "b",
                outwardIssue: "a",
              },
            ],
          },
          {
            key: "b",
            summary: "summary",
            description: "description",
            subtasks: [],
            links: [{ inwardIssue: "b", outwardIssue: "a", id: "id2" }],
          },
        ],
      });
    });

    const store = createPureStore();
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));
    store.dispatch(submitProjectIdFulfilled(randomProject()));

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
          relations: [],
          selfUrl: "",
          statusId: "",
          typeId: "",
          subIssues: ["a", "b"],
        },
        {
          key: "a",
          summary: "summary",
          description: "description",
          relations: [{ id: "id2", externalId: "id2", inwardIssue: "b", outwardIssue: "a" }],
          selfUrl: "",
          statusId: "",
          typeId: "",
          parentIssue: "key",
          subIssues: [],
        },
        {
          key: "b",
          summary: "summary",
          description: "description",
          relations: [{ id: "id2", externalId: "id2", inwardIssue: "b", outwardIssue: "a" }],
          selfUrl: "",
          statusId: "",
          typeId: "",
          parentIssue: "key",
          subIssues: [],
        },
      ]),
    });
  });
});

test("should be get event when error happened", () => {
  const testScheduler = new TestScheduler((a, b) => {
    expect(a).toEqual(b);
  });

  testScheduler.run(({ cold, hot, expectObservable: expect }) => {
    const registrar = createDependencyRegistrar<Dependencies>();
    registrar.register("postJSON", () => {
      return cold("--#", undefined, new Error("e"));
    });

    const store = createPureStore();
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));
    store.dispatch(submitProjectIdFulfilled(randomProject()));

    const epics = epic.issueEpic(registrar);

    const action$ = hot("-a", {
      a: synchronizeIssues(),
    });

    const state$ = new StateObservable(NEVER, store.getState());

    const ret$ = epics.synchronizeIssues(action$, state$, null);

    expect(ret$).toBe("---a", {
      a: synchronizeIssuesFulfilled([]),
    });
  });
});
