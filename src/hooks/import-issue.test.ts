import { renderHook } from "@testing-library/react";
import { test, expect } from "vitest";
import { useImportIssues } from "./import-issues";
import { getWrapper } from "./hook-test-util";
import { createPureStore } from "@/state/store";
import { importIssues } from "@/state/actions";

test("return empty state", () => {
  // Arrange
  const store = createPureStore();

  // Act
  const ret = renderHook(() => useImportIssues(), { wrapper: getWrapper(store) });

  // Assert
  expect(ret.result.current.selectedIssues).toEqual([]);
});

test("add issue key", async () => {
  // Arrange
  const store = createPureStore();
  const { result, rerender } = renderHook(() => useImportIssues(), { wrapper: getWrapper(store) });

  // Act
  result.current.select("abc");

  rerender();

  // Assert
  expect(result.current.selectedIssues).toEqual(["abc"]);
});

test("remove issue key", async () => {
  // Arrange
  const store = createPureStore();
  const { result, rerender } = renderHook(() => useImportIssues(), { wrapper: getWrapper(store) });

  // Act
  result.current.select("abc");
  rerender();
  expect(result.current.selectedIssues).toEqual(["abc"]);

  result.current.unselect("abc");
  rerender();

  // Assert
  expect(result.current.selectedIssues).toEqual([]);
});

test("execute import with selected issues", async () => {
  // Arrange
  expect.assertions(1);

  const store = createPureStore();
  store.replaceReducer((state, action) => {
    if (action.type === importIssues.type) {
      expect(action).toEqual(importIssues({ issues: ["abc"] }));
    }

    return state!;
  });

  const { result, rerender } = renderHook(() => useImportIssues(), { wrapper: getWrapper(store) });

  // Act
  result.current.select("abc");
  rerender();

  result.current.execute();
  rerender();

  // Assert
});
