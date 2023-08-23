import { test, expect, describe } from "vitest";
import { removeRelation, selectIssueInGraph, submitProjectIdFulfilled, synchronizeIssuesFulfilled } from "../actions";
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
      relations: [{ id: "id", inwardIssue: "foo", outwardIssue: "key" }],
    });
    const store = createPureStore();
    store.dispatch(submitProjectIdFulfilled(randomProject()));
    store.dispatch(synchronizeIssuesFulfilled([issue]));

    const ret = s.queryCurrentRelatedIssuesWithKind("inward")(store.getState());

    expect(ret).toEqual([Loading.Completed, []]);
  });

  test("get unknown issue when related issue key is not found in issues", () => {
    const issue = randomIssue({
      key: "key",
      relations: [{ id: "id", inwardIssue: "foo", outwardIssue: "key" }],
    });
    const store = createPureStore();
    store.dispatch(submitProjectIdFulfilled(randomProject()));
    store.dispatch(synchronizeIssuesFulfilled([issue]));
    store.dispatch(selectIssueInGraph("key"));

    const ret = s.queryCurrentRelatedIssuesWithKind("inward")(store.getState());

    expect(ret).toEqual([Loading.Completed, [[Loading.Completed, { key: "foo", summary: "Unknown issue" }]]]);
  });

  test("get inward issues", () => {
    const issue = randomIssue({
      key: "key",
      relations: [{ id: "id", inwardIssue: "foo", outwardIssue: "key" }],
    });
    const inwardIssue = randomIssue({
      key: "foo",
      relations: [{ id: "id", inwardIssue: "foo", outwardIssue: "key" }],
    });
    const store = createPureStore();
    store.dispatch(submitProjectIdFulfilled(randomProject()));
    store.dispatch(synchronizeIssuesFulfilled([issue, inwardIssue]));
    store.dispatch(selectIssueInGraph("key"));

    const ret = s.queryCurrentRelatedIssuesWithKind("inward")(store.getState());

    expect(ret).toEqual([Loading.Completed, [[Loading.Completed, { key: "foo", summary: inwardIssue.summary }]]]);
  });

  test("get outward issues", () => {
    const issue = randomIssue({
      key: "key",
      relations: [{ externalId: "id", id: "id", inwardIssue: "key", outwardIssue: "foo" }],
    });
    const outwardIssue = randomIssue({
      key: "foo",
      relations: [{ externalId: "id", id: "id", inwardIssue: "key", outwardIssue: "foo" }],
      type: "",
      status: "",
    });
    const store = createPureStore();
    store.dispatch(submitProjectIdFulfilled(randomProject()));
    store.dispatch(synchronizeIssuesFulfilled([issue, outwardIssue]));
    store.dispatch(selectIssueInGraph("key"));

    const ret = s.queryCurrentRelatedIssuesWithKind("outward")(store.getState());

    expect(ret).toEqual([Loading.Completed, [[Loading.Completed, { key: "foo", summary: outwardIssue.summary }]]]);
  });

  test("add loading state when a relation is draft", () => {
    const issue = randomIssue({
      key: "key",
      relations: [{ externalId: "id", id: "id", inwardIssue: "key", outwardIssue: "foo" }],
    });
    const outwardIssue = randomIssue({
      key: "foo",
      relations: [{ externalId: "id", id: "id", inwardIssue: "key", outwardIssue: "foo" }],
      type: "",
      status: "",
    });
    const store = createPureStore();
    store.dispatch(submitProjectIdFulfilled(randomProject()));
    store.dispatch(synchronizeIssuesFulfilled([issue, outwardIssue]));
    store.dispatch(selectIssueInGraph("key"));
    store.dispatch(removeRelation({ fromKey: "key", toKey: "foo" }));

    const ret = s.queryCurrentRelatedIssuesWithKind("outward")(store.getState());

    expect(ret).toEqual([Loading.Completed, [[Loading.Loading, { key: "foo", summary: outwardIssue.summary }]]]);
  });
});
