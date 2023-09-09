import { test, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { getWrapper } from "./hook-test-util";
import { useRelationEditor } from "./relation-editor";
import { useGenerateId } from "./_generate-id";
import { createStore } from "@/state/store";
import { createDeleting } from "@/model/relation-delta";
import { importIssues, selectIssueInGraph, submitApiCredentialFulfilled } from "@/state/actions";
import { randomCredential, randomIssue } from "@/mock/generators";
import { issueToIssueModel } from "@/view-models/issue";
import { Apis } from "@/apis/api";
import { toDeletingModel } from "@/view-models/relation-delta";

vi.mock("./_generate-id", () => {
  return {
    useGenerateId: vi.fn(),
  };
});

vi.mock("@/apis/api", () => {
  return {
    Apis: {
      createRelation: {
        call: vi.fn(),
      },
      removeRelation: {
        call: vi.fn(),
      },
    },
  };
});

afterEach(() => {
  vi.resetAllMocks();
});

test("initial hook state", () => {
  const store = createStore();

  const ret = renderHook(() => useRelationEditor(), { wrapper: getWrapper(store) });

  expect(ret.result.current.error).toBeUndefined();
  expect(ret.result.current.isLoading).toBeFalsy();
  expect(ret.result.current.state.drafts).toHaveLength(0);
});

test("create delta with keys", () => {
  const store = createStore();
  const mock = vi.mocked(useGenerateId);
  mock.mockReturnValue(() => "1");

  const { result, rerender } = renderHook(() => useRelationEditor(), { wrapper: getWrapper(store) });
  result.current.startPreparationToAdd();
  rerender();

  expect(result.current.state.drafts).toEqual([]);
  expect(result.current.state.preparationToAdd).toEqual({});
});

test("remove delta", () => {
  const store = createStore();
  const issues = [
    randomIssue({
      key: "in",
      relations: [{ id: "1", inwardIssue: "in", outwardIssue: "out" }],
    }),
    randomIssue({
      key: "out",
      relations: [{ id: "1", inwardIssue: "in", outwardIssue: "out" }],
    }),
  ];
  store.dispatch(importIssues({ issues }));
  const mock = vi.mocked(useGenerateId);
  mock.mockReturnValue(() => "id");

  const { result, rerender } = renderHook(() => useRelationEditor(), { wrapper: getWrapper(store) });
  expect(result.current.state.drafts).toEqual(
    expect.arrayContaining([
      {
        kind: "NoTouched",
        relation: {
          relationId: "1",
          inward: issueToIssueModel(issues[0]),
          outward: issueToIssueModel(issues[1]),
        },
      },
    ]),
  );

  result.current.remove("1");
  rerender();

  expect(result.current.state.drafts).toEqual(
    expect.arrayContaining([
      {
        kind: "Touched",
        delta: toDeletingModel(createDeleting("id", "1"), {
          "1": {
            relationId: "1",
            inward: issueToIssueModel(issues[0]),
            outward: issueToIssueModel(issues[1]),
          },
        }),
      },
    ]),
  );
});

test("undo delta", () => {
  const store = createStore();
  const mock = vi.mocked(useGenerateId);
  mock.mockReturnValue(() => "1");

  const { result, rerender } = renderHook(() => useRelationEditor(), { wrapper: getWrapper(store) });
  result.current.startPreparationToAdd();
  rerender();
  result.current.undo("1");
  rerender();

  expect(result.current.state.drafts).toEqual([]);
});

test("apply remove and append delta", async () => {
  const store = createStore();
  const issues = [
    randomIssue({
      key: "in",
      relations: [{ id: "1", inwardIssue: "in", outwardIssue: "out" }],
    }),
    randomIssue({
      key: "out",
      relations: [{ id: "1", inwardIssue: "in", outwardIssue: "out" }],
    }),
    randomIssue({
      key: "key1",
    }),
    randomIssue({
      key: "key2",
    }),
  ];
  const credentail = randomCredential();
  store.dispatch(importIssues({ issues }));
  store.dispatch(submitApiCredentialFulfilled(credentail));
  vi.mocked(useGenerateId).mockReturnValue(() => "id");

  const { result, rerender } = renderHook(() => useRelationEditor(), { wrapper: getWrapper(store) });
  result.current.remove("1");
  result.current.startPreparationToAdd();
  store.dispatch(selectIssueInGraph("key1"));
  store.dispatch(selectIssueInGraph("key2"));
  rerender();
  result.current.apply();
  rerender();

  const createRelation = vi.mocked(Apis.createRelation.call);
  const removeRelation = vi.mocked(Apis.removeRelation.call);

  expect(result.current.isLoading).toBeTruthy();
  expect(createRelation).toBeCalledWith(credentail, "key1", "key2");
  expect(removeRelation).toBeCalledWith(credentail, "1");
});
