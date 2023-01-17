import { Epic } from "redux-observable";
import type { Action } from "@reduxjs/toolkit";
import { filter, map } from "rxjs/operators";
import type { RootState } from "../store";
import { focusIssueOnSearch, focusIssueOnSearchFulfilled } from "../actions";
import type { Dependencies } from "@/dependencies";
import { DependencyRegistrar } from "@/util/dependency-registrar";

type Epics = "sendIssueFocusingAction";

export const issueGraphEpic = (
  registrar: DependencyRegistrar<Dependencies>,
): Record<Epics, Epic<Action, Action, RootState>> => ({
  sendIssueFocusingAction: (action$) =>
    action$.pipe(
      filter(focusIssueOnSearch.match),
      map(({ payload }) => {
        registrar.resolve("sendCommandTo")({ kind: "AttentionIssue", key: payload });
      }),
      map(() => focusIssueOnSearchFulfilled()),
    ),
});
