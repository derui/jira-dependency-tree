import { test, expect, vi, Mock, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { getWrapper } from "./hook-test-util";
import { useRelationEditor } from "./relation-editor";
import { useGenerateId } from "./_generate-id";
import { createStore } from "@/state/store";
import { createAppending, createDeleting } from "@/model/relation-delta";
import { importIssues, synchronizeIssuesFulfilled } from "@/state/actions";
import { randomIssue } from "@/mock-data";
import { issueToIssueModel } from "@/view-models/issue";

vi.mock("./_generate-id", () => {
  return {
    useGenerateId: vi.fn(),
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
  result.current.create("key1", "key2");
  rerender();

  expect(result.current.state.drafts).toEqual(
    expect.arrayContaining([{ kind: "Touched", delta: createAppending("1", "key1", "key2") }]),
  );
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
    expect.arrayContaining([{ kind: "Touched", delta: createDeleting("id", "1") }]),
  );
});

test("undo delta", () => {
  const store = createStore();
  const mock = vi.mocked(useGenerateId);
  mock.mockReturnValue(() => "1");

  const { result, rerender } = renderHook(() => useRelationEditor(), { wrapper: getWrapper(store) });
  result.current.create("key1", "key2");
  rerender();
  result.current.undo("1");
  rerender();

  expect(result.current.state.drafts).toEqual([]);
});
