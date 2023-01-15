import test from "ava";
import { TestScheduler } from "rxjs/testing";
import { StateObservable } from "redux-observable";
import { NEVER } from "rxjs";
import { Dependencies } from "../../dependencies";
import { createDependencyRegistrar } from "../../util/dependency-registrar";
import { createPureStore } from "../store";
import {
  submitApiCredentialFulfilled,
  submitProjectKey,
  submitProjectKeyError,
  submitProjectKeyFulfilled,
} from "../actions";
import * as epic from "./project";
import { ProjectArgument, projectFactory } from "@/model/project";
import { randomCredential } from "@/mock-data";

test("get error if credential was not setupeped", async (t) => {
  t.plan(1);
  const registrar = createDependencyRegistrar<Dependencies>();

  const testScheduler = new TestScheduler((a, b) => t.deepEqual(a, b));
  const store = createPureStore();

  testScheduler.run(({ hot, expectObservable: expect }) => {
    const epics = epic.projectEpic(registrar);

    const action$ = hot("-a", {
      a: submitProjectKey("key"),
    });
    const state$ = new StateObservable(NEVER, store.getState());

    const ret$ = epics.loadProject(action$, state$, null);

    expect(ret$).toBe("-a", {
      a: submitProjectKeyError(),
    });
  });
});

test("get project", async (t) => {
  t.plan(1);
  const registrar = createDependencyRegistrar<Dependencies>();

  const testScheduler = new TestScheduler((a, b) => t.deepEqual(a, b));
  const store = createPureStore();
  store.dispatch(submitApiCredentialFulfilled(randomCredential()));

  testScheduler.run(({ hot, cold, expectObservable: expect }) => {
    const response = {
      id: "foo",
      key: "bar",
      name: "name",
      statuses: [{ id: "id", name: "type", statusCategory: "TODO" }],
      statusCategories: [{ id: "1", name: "category", colorName: "red" }],
      issueTypes: [{ id: "id", name: "issuetype", avatarUrl: null }],
    };
    registrar.register("postJSON", () => {
      return cold("--a", { a: response });
    });
    const epics = epic.projectEpic(registrar);

    const action$ = hot("-a", {
      a: submitProjectKey("key"),
    });
    const state$ = new StateObservable(NEVER, store.getState());

    const ret$ = epics.loadProject(action$, state$, null);

    expect(ret$).toBe("---a", {
      a: submitProjectKeyFulfilled(
        projectFactory({
          id: response.id,
          key: response.key,
          name: response.name,
          statuses: response.statuses,
          statusCategories: response.statusCategories,
          issueTypes: response.issueTypes,
        } as ProjectArgument),
      ),
    });
  });
});
