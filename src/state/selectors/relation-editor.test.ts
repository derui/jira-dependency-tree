import exp from "constants";
import { test, expect, describe } from "vitest";
import { selectIssueInGraph, submitProjectKeyFulfilled, synchronizeIssuesFulfilled } from "../actions";
import { createPureStore } from "../store";
import * as s from "./relation-editor";
import { Loading } from "@/type";
import { randomIssue, randomProject } from "@/mock-data";

describe("queryCurrentRelatedIssuesWithKind", () => {
  test("do not return any issues if store is not setupped", () => {
    const store = createPureStore();

    const ret = s.queryCurrentRelatedIssuesWithKind("inward")(store.getState());

    expect(ret).toEqual([Loading.Completed, []]);
  });

  test("do not get any relation when user did not select any issue", () => {
    const issue = randomIssue({
      key: "key",
      relations: [{ externalId: "id", id: "id", inwardIssue: "foo", outwardIssue: "key" }],
    });
    const store = createPureStore();
    store.dispatch(submitProjectKeyFulfilled(randomProject()));
    store.dispatch(synchronizeIssuesFulfilled([issue]));

    const ret = s.queryCurrentRelatedIssuesWithKind("inward")(store.getState());

    expect(ret).toEqual([Loading.Completed, []]);
  });

  test("get unknown issue when related issue key is not found in issues", () => {
    const issue = randomIssue({
      key: "key",
      relations: [{ externalId: "id", id: "id", inwardIssue: "foo", outwardIssue: "key" }],
    });
    const store = createPureStore();
    store.dispatch(submitProjectKeyFulfilled(randomProject()));
    store.dispatch(synchronizeIssuesFulfilled([issue]));
    store.dispatch(selectIssueInGraph("key"));

    const ret = s.queryCurrentRelatedIssuesWithKind("inward")(store.getState());

    expect(ret).toEqual([Loading.Completed, [{ key: "foo", summary: "Unknown issue" }]]);
  });

  test("get inward issues", () => {
    const issue = randomIssue({
      key: "key",
      relations: [{ externalId: "id", id: "id", inwardIssue: "foo", outwardIssue: "key" }],
    });
    const inwardIssue = randomIssue({
      key: "foo",
      relations: [{ externalId: "id", id: "id", inwardIssue: "foo", outwardIssue: "key" }],
      typeId: "",
      statusId: "",
    });
    const store = createPureStore();
    store.dispatch(submitProjectKeyFulfilled(randomProject()));
    store.dispatch(synchronizeIssuesFulfilled([issue, inwardIssue]));
    store.dispatch(selectIssueInGraph("key"));

    const ret = s.queryCurrentRelatedIssuesWithKind("inward")(store.getState());

    expect(ret).toEqual([Loading.Completed, [{ key: "foo", summary: inwardIssue.summary }]]);
  });

  test("get outward issues", () => {
    const issue = randomIssue({
      key: "key",
      relations: [{ externalId: "id", id: "id", inwardIssue: "key", outwardIssue: "foo" }],
    });
    const outwardIssue = randomIssue({
      key: "foo",
      relations: [{ externalId: "id", id: "id", inwardIssue: "key", outwardIssue: "foo" }],
      typeId: "",
      statusId: "",
    });
    const store = createPureStore();
    store.dispatch(submitProjectKeyFulfilled(randomProject()));
    store.dispatch(synchronizeIssuesFulfilled([issue, outwardIssue]));
    store.dispatch(selectIssueInGraph("key"));

    const ret = s.queryCurrentRelatedIssuesWithKind("outward")(store.getState());

    expect(ret).toEqual([Loading.Completed, [{ key: "foo", summary: outwardIssue.summary }]]);
  });
});
