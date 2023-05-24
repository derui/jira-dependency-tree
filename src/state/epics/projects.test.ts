import { test, expect, describe } from "vitest";
import { TestScheduler } from "rxjs/testing";
import { StateObservable } from "redux-observable";
import { NEVER } from "rxjs";
import { createDependencyRegistrar } from "../../util/dependency-registrar";
import { Dependencies } from "../../dependencies";
import { createPureStore } from "../store";
import { projects, submitApiCredentialFulfilled } from "../actions";
import * as epic from "./projects";
import { randomCredential } from "@/mock-data";

describe("load projects", () => {
  test("get error if credential was not setupeped", async () => {
    const registrar = createDependencyRegistrar<Dependencies>();

    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b));
    const store = createPureStore();

    testScheduler.run(({ hot, expectObservable: expect }) => {
      const epics = epic.projectsEpic(registrar);

      const action$ = hot("-a", {
        a: projects.loadProjects(),
      });
      const state$ = new StateObservable(NEVER, store.getState());

      const ret$ = epics.loadProjects(action$, state$, null);

      expect(ret$).toBe("-a", {
        a: projects.loadProjectsError({ reason: "Can not run with no credential" }),
      });
    });
  });

  test("get project", () => {
    const registrar = createDependencyRegistrar<Dependencies>();

    const testScheduler = new TestScheduler((a, b) => expect(a).toEqual(b));
    const store = createPureStore();
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));

    testScheduler.run(({ hot, cold, expectObservable: expect }) => {
      const response = {
        values: [
          {
            id: "foo",
            key: "bar",
            name: "name",
          },
          {
            id: "id2",
            key: "baz",
            name: "second",
          },
        ],
      };
      registrar.register("postJSON", () => {
        return cold("--a", { a: response });
      });
      const epics = epic.projectsEpic(registrar);

      const action$ = hot("-a", {
        a: projects.loadProjects(),
      });
      const state$ = new StateObservable(NEVER, store.getState());

      const ret$ = epics.loadProjects(action$, state$, null);

      expect(ret$).toBe("---a", {
        a: projects.loadProjectsSucceeded({
          projects: [
            { id: "foo", key: "bar", name: "name" },
            { id: "id2", key: "baz", name: "second" },
          ],
        }),
      });
    });
  });
});
