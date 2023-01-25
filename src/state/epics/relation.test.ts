import { test, expect, describe } from "vitest";
import { TestScheduler } from "rxjs/testing";
import { StateObservable } from "redux-observable";
import { NEVER, of } from "rxjs";
import { createDependencyRegistrar } from "../../util/dependency-registrar";
import { Dependencies } from "../../dependencies";
import { createPureStore } from "../store";
import {
  addRelation,
  addRelationAccepted,
  addRelationSucceeded,
  removeRelation,
  removeRelationError,
  removeRelationSucceeded,
  submitApiCredentialFulfilled,
  synchronizeIssuesFulfilled,
} from "../actions";
import * as epic from "./relation";
import { randomCredential, randomIssue } from "@/mock-data";

test("get with internal id", async () => {
  const registrar = createDependencyRegistrar<Dependencies>();
  registrar.register("generateId", () => "id");

  const store = createPureStore();
  store.dispatch(submitApiCredentialFulfilled(randomCredential()));

  const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b));

  testScheduler.run(({ hot, expectObservable }) => {
    const action$ = hot("-a", { a: addRelation({ fromKey: "a", toKey: "b" }) });

    const state$ = new StateObservable(NEVER, store.getState());

    const ret$ = epic.relationEpic(registrar).addRelation(action$, state$, null);

    expectObservable(ret$).toBe("-a", {
      a: addRelationAccepted({ relationId: "id", fromKey: "a", toKey: "b" }),
    });
  });
});

test("call API and return with external id", async () => {
  const registrar = createDependencyRegistrar<Dependencies>();
  registrar.register("postJSON", () => of({ id: "external" }));

  const store = createPureStore();
  store.dispatch(submitApiCredentialFulfilled(randomCredential()));

  const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b));

  testScheduler.run(({ hot, expectObservable }) => {
    const action$ = hot("-a", { a: addRelationAccepted({ relationId: "id", fromKey: "a", toKey: "b" }) });

    const state$ = new StateObservable(NEVER, store.getState());

    const ret$ = epic.relationEpic(registrar).addRelationAccepted(action$, state$, null);

    expectObservable(ret$).toBe("-a", {
      a: addRelationSucceeded({ id: "id", inwardIssue: "a", outwardIssue: "b", externalId: "external" }),
    });
  });
});

describe("removeRelation", () => {
  test("call API and return with external id", async () => {
    const registrar = createDependencyRegistrar<Dependencies>();

    const store = createPureStore();
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));
    store.dispatch(
      synchronizeIssuesFulfilled([
        randomIssue({ key: "a", relations: [{ externalId: "id", id: "other", inwardIssue: "a", outwardIssue: "b" }] }),
      ]),
    );

    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b));

    testScheduler.run(({ hot, cold, expectObservable }) => {
      registrar.register("post", () => cold<void>("--a", { a: undefined }));

      const action$ = hot("-a", { a: removeRelation({ fromKey: "a", toKey: "b" }) });

      const state$ = new StateObservable(NEVER, store.getState());

      const ret$ = epic.relationEpic(registrar).removeRelation(action$, state$, null);

      expectObservable(ret$).toBe("---a", {
        a: removeRelationSucceeded({ relationId: "other" }),
      });
    });
  });

  test("error when raise error", async () => {
    const registrar = createDependencyRegistrar<Dependencies>();

    const store = createPureStore();
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));
    store.dispatch(
      synchronizeIssuesFulfilled([
        randomIssue({ key: "a", relations: [{ externalId: "id", id: "other", inwardIssue: "a", outwardIssue: "b" }] }),
      ]),
    );

    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b));

    testScheduler.run(({ hot, cold, expectObservable }) => {
      registrar.register("post", () => cold<void>("--#", {}, ""));

      const action$ = hot("-a", { a: removeRelation({ fromKey: "a", toKey: "b" }) });

      const state$ = new StateObservable(NEVER, store.getState());

      const ret$ = epic.relationEpic(registrar).removeRelation(action$, state$, null);

      expectObservable(ret$).toBe("---a", {
        a: removeRelationError({ fromKey: "a", toKey: "b" }),
      });
    });
  });
});
