import { test, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { getWrapper } from "./hook-test-util";
import { useIssueSet } from "./issue-set";
import { createStore } from "@/status/store";

afterEach(() => {
  vi.resetAllMocks();
});

test("initial hook state", () => {
  const store = createStore();

  const ret = renderHook(() => useIssueSet(), { wrapper: getWrapper(store) });

  expect(ret.result.current.state.currentIssueSetName).toEqual("Default");
});

test("create issue set", () => {
  const store = createStore();

  const { result, rerender } = renderHook(() => useIssueSet(), { wrapper: getWrapper(store) });
  result.current.create("name");
  rerender();
  result.current.change("name");
  rerender();

  expect(result.current.state.currentIssueSetName).toEqual("Default");
  expect(result.current.state.changedIssueSetName).toEqual("name");
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

  expect(result.current.state.currentIssueSetName).toEqual("renamed");
});

test("select issue set", () => {
  const store = createStore();

  const { result, rerender } = renderHook(() => useIssueSet(), { wrapper: getWrapper(store) });
  result.current.create("new one");
  rerender();
  result.current.change("new one");
  rerender();
  result.current.select();
  rerender();

  expect(result.current.state.currentIssueSetName).toEqual("new one");
  expect(result.current.state.changedIssueSetName).toEqual("new one");
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
