import { test, expect } from "vitest";
import { TestScheduler } from "rxjs/testing";
import { StateObservable } from "redux-observable";
import { NEVER } from "rxjs";
import { attentionIssue, attentionIssueFulfilled } from "../actions";
import { Dependencies } from "../../dependencies";
import { createDependencyRegistrar } from "../../util/dependency-registrar";
import { RootState } from "../store";
import * as epic from "./issue-graph";

test("send command to issue graph", async () => {
  expect.assertions(3);

  const registrar = createDependencyRegistrar<Dependencies>();
  registrar.register("sendCommandTo", (payload) => {
    expect(payload.kind).toBe("AttentionIssue");
    expect(payload.key).toBe("key");
  });
  const scheduler = new TestScheduler((a, b) => expect(a).toEqual(b));

  scheduler.run(({ hot, expectObservable }) => {
    const action$ = hot("-a", { a: attentionIssue("key") });
    const state$ = new StateObservable(NEVER, {} as RootState);

    const ret$ = epic.issueGraphEpic(registrar).sendIssueFocusingAction(action$, state$, null);

    expectObservable(ret$).toBe("-a", { a: attentionIssueFulfilled() });
  });
});
