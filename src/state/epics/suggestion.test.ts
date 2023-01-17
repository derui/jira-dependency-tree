import test from "ava";
import { TestScheduler } from "rxjs/testing";
import { StateObservable } from "redux-observable";
import { NEVER } from "rxjs";
import { createDependencyRegistrar } from "../../util/dependency-registrar";
import { Dependencies } from "../../dependencies";
import { createPureStore } from "../store";
import {
  requestSuggestion,
  requestSuggestionAccepted,
  requestSuggestionFulfilled,
  submitApiCredentialFulfilled,
  submitProjectKeyFulfilled,
} from "../actions";
import * as epic from "./suggestion";
import { SuggestionKind } from "@/type";
import { randomCredential, randomProject } from "@/mock-data";
import { suggestionFactory } from "@/model/suggestion";

const registrar = createDependencyRegistrar<Dependencies>();
const env = {
  apiBaseUrl: "http://base.url",
  apiKey: "key",
};
registrar.register("env", env);

test("do not request when did not credential setupeed", async (t) => {
  const testScheduler = new TestScheduler((a, b) => {
    t.deepEqual(a, b);
  });

  testScheduler.run(({ cold, hot, expectObservable: expect }) => {
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

test("send request when setupped", async (t) => {
  const testScheduler = new TestScheduler((a, b) => {
    t.deepEqual(a, b);
  });

  testScheduler.run(({ cold, hot, expectObservable: expect }) => {
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
    store.dispatch(submitProjectKeyFulfilled(randomProject()));

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

test("return accepted event", async (t) => {
  const testScheduler = new TestScheduler((a, b) => {
    t.deepEqual(a, b);
  });

  testScheduler.run(({ hot, expectObservable: expect }) => {
    const store = createPureStore();
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));
    store.dispatch(submitProjectKeyFulfilled(randomProject()));

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
