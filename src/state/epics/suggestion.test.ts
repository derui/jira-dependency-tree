import { test, expect } from "vitest";
import { TestScheduler } from "rxjs/testing";
import { StateObservable } from "redux-observable";
import { NEVER } from "rxjs";
import { createDependencyRegistrar } from "../../util/dependency-registrar";
import { Dependencies } from "../../dependencies";
import { createPureStore } from "../store";
import {
  requestSuggestion,
  requestSuggestionAccepted,
  requestSuggestionError,
  requestSuggestionFulfilled,
  submitApiCredentialFulfilled,
  submitProjectIdFulfilled,
} from "../actions";
import * as epic from "./suggestion";
import { SuggestionKind } from "@/type";
import { randomCredential, randomProject } from "@/mock-data";
import { suggestionFactory } from "@/model/suggestion";

test("do not request when did not credential setupeed", async () => {
  const testScheduler = new TestScheduler((a, b) => {
    expect(a).toEqual(b);
  });

  testScheduler.run(({ hot, expectObservable: expect }) => {
    const registrar = createDependencyRegistrar<Dependencies>();
    const store = createPureStore();

    const epics = epic.suggestionEpic(registrar);

    const action$ = hot("-a", {
      a: requestSuggestionAccepted({ kind: SuggestionKind.Sprint, term: "term" }),
    });

    const state$ = new StateObservable(NEVER, store.getState());

    const ret$ = epics.getSuggestion(action$, state$, null);

    expect(ret$).toBe("-a", {
      a: requestSuggestionFulfilled({ kind: SuggestionKind.Sprint, suggestion: {} }),
    });
  });
});

test("send request when setupped", async () => {
  const testScheduler = new TestScheduler((a, b) => {
    expect(a).toEqual(b);
  });

  testScheduler.run(({ cold, hot, expectObservable: expect }) => {
    const registrar = createDependencyRegistrar<Dependencies>();
    registrar.register("postJSON", () => {
      return cold("--a", {
        a: {
          sprints: [
            { value: "value", displayName: "string" },
            { value: "v2", displayName: "version 2" },
          ],
        },
      });
    });

    const store = createPureStore();
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));
    store.dispatch(submitProjectIdFulfilled(randomProject()));

    const epics = epic.suggestionEpic(registrar);

    const action$ = hot("-a", {
      a: requestSuggestionAccepted({ kind: SuggestionKind.Sprint, term: "term" }),
    });

    const state$ = new StateObservable(NEVER, store.getState());

    const ret$ = epics.getSuggestion(action$, state$, null);

    expect(ret$).toBe("---a", {
      a: requestSuggestionFulfilled({
        kind: SuggestionKind.Sprint,
        suggestion: suggestionFactory({
          suggestions: [
            { value: "value", displayName: "string" },
            { value: "v2", displayName: "version 2" },
          ],
        }),
      }),
    });
  });
});

test("return accepted event", async () => {
  const testScheduler = new TestScheduler((a, b) => {
    expect(a).toEqual(b);
  });

  testScheduler.run(({ hot, expectObservable: expect }) => {
    const registrar = createDependencyRegistrar<Dependencies>();
    const store = createPureStore();
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));
    store.dispatch(submitProjectIdFulfilled(randomProject()));

    const epics = epic.suggestionEpic(registrar);

    const action$ = hot("-a", {
      a: requestSuggestion({ kind: SuggestionKind.Sprint, term: "term" }),
    });

    const state$ = new StateObservable(NEVER, store.getState());

    const ret$ = epics.acceptSuggestion(action$, state$, null);

    expect(ret$).toBe(`-${"-".repeat(500)}a`, {
      a: requestSuggestionAccepted({
        kind: SuggestionKind.Sprint,
        term: "term",
      }),
    });
  });
});

test("return error when API send error", async () => {
  const testScheduler = new TestScheduler((a, b) => {
    expect(a).toEqual(b);
  });

  testScheduler.run(({ hot, cold, expectObservable: expect }) => {
    const registrar = createDependencyRegistrar<Dependencies>();

    const store = createPureStore();
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));
    store.dispatch(submitProjectIdFulfilled(randomProject()));

    registrar.register("postJSON", () => {
      return cold("--#", undefined, new Error("have error"));
    });

    const epics = epic.suggestionEpic(registrar);

    const action$ = hot("-a", {
      a: requestSuggestionAccepted({ kind: SuggestionKind.Sprint, term: "should error" }),
    });

    const state$ = new StateObservable(NEVER, store.getState());

    const ret$ = epics.getSuggestion(action$, state$, null);

    expect(ret$).toBe(`---a`, {
      a: requestSuggestionError("Have error"),
    });
  });
});
