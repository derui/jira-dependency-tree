import { test, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { getWrapper } from "./hook-test-util";
import { useRelationEditor } from "./relation-editor";
import { useGenerateId } from "./_generate-id";
import { useIssueSet } from "./issue-set";
import { createStore } from "@/status/store";
import { createDeleting } from "@/models/relation-delta";
import { importIssues, submitApiCredential } from "@/status/actions";
import { randomCredential, randomIssue } from "@/mock/generators";
import { issueToIssueModel } from "@/view-models/issue";
import { Apis } from "@/apis/api";
import { toDeletingModel } from "@/view-models/relation-delta";

afterEach(() => {
  vi.resetAllMocks();
});

test("initial hook state", () => {
  const store = createStore();

  const ret = renderHook(() => useIssueSet(), { wrapper: getWrapper(store) });

  expect(ret.result.current.state.current).toEqual({ name: "Default", keys: [] });
});

test("create issue set", () => {
  const store = createStore();

  const { result, rerender } = renderHook(() => useIssueSet(), { wrapper: getWrapper(store) });
  result.current.create("name");
  rerender();
  result.current.select("name");
  rerender();

  expect(result.current.state.current).toEqual({ name: "name", keys: [] });
});

test("delete issue set", () => {
  const store = createStore();

  const { result, rerender } = renderHook(() => useIssueSet(), { wrapper: getWrapper(store) });
  result.current.create("name");
  rerender();
  result.current.delete("name");
  rerender();

  expect(result.current.state.issueSets).toEqual(expect.not.arrayContaining(["name"]));
});

test("rename issue set", () => {
  const store = createStore();

  const { result, rerender } = renderHook(() => useIssueSet(), { wrapper: getWrapper(store) });
  result.current.rename("Default", "renamed");
  rerender();

  expect(result.current.state.current).toEqual({ name: "renamed", keys: [] });
});

test("select issue set", () => {
  const store = createStore();

  const { result, rerender } = renderHook(() => useIssueSet(), { wrapper: getWrapper(store) });
  result.current.create("new one");
  rerender();
  result.current.select("new one");
  rerender();

  expect(result.current.state.current).toEqual({ name: "new one", keys: [] });
});

test.each(["", "   ", "\n"])("invalid argument to create", (v) => {
  const store = createStore();

  const { result, rerender } = renderHook(() => useIssueSet(), { wrapper: getWrapper(store) });
  const ret = result.current.create(v);
  rerender();

  expect(ret).toEqual("InvalidArgument");
  expect(result.current.state.issueSets).toHaveLength(1);
});

test.each(["", "   ", "\n"])("invalid argument to rename", (v) => {
  const store = createStore();

  const { result, rerender } = renderHook(() => useIssueSet(), { wrapper: getWrapper(store) });
  result.current.create("new");
  rerender();
  const ret = result.current.rename("new", v);
  rerender();

  expect(ret).toEqual("InvalidArgument");
  expect(result.current.state.issueSets).toEqual(expect.arrayContaining(["Default", "new"]));
});
