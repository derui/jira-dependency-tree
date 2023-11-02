import { test, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { getWrapper } from "./hook-test-util";
import { useLoadIssue } from "./load-issue";
import { useImportIssues } from "./_import-issues";
import { createStore } from "@/status/store";
import { submitApiCredential } from "@/status/actions";
import { randomCredential } from "@/mock/generators";

vi.mock("./_import-issues", () => {
  const mock = vi.fn();
  return {
    useImportIssues: () => mock,
  };
});

afterEach(() => {
  vi.resetAllMocks();
});

test("do not anything when api credential not setupped", () => {
  const store = createStore();

  const ret = renderHook(() => useLoadIssue(), { wrapper: getWrapper(store) });
  const mock = vi.mocked(useImportIssues());

  ret.result.current("key");

  expect(mock).not.toBeCalled();
});

test.each([
  "http://test.com",
  "https://example.com",
  "foo.co.jp",
  "ftp://192.168.11.1",
  "https://test.atlassian.net/project/TEST",
])("If it is not the URL of a JIRA issue, nothing is done", (arg) => {
  const store = createStore();
  store.dispatch(submitApiCredential(randomCredential({ userDomain: "foo" })));

  const { result, rerender } = renderHook(() => useLoadIssue(), { wrapper: getWrapper(store) });
  const mock = vi.mocked(useImportIssues());

  result.current(arg);
  rerender();

  expect(mock).not.toBeCalled();
});

test("call import issue if URL is matched", () => {
  const store = createStore();
  store.dispatch(submitApiCredential(randomCredential({ userDomain: "foo" })));

  const { result, rerender } = renderHook(() => useLoadIssue(), { wrapper: getWrapper(store) });
  const mock = vi.mocked(useImportIssues());

  result.current("https://foo.atlassian.net/browse/KEY-3");
  rerender();

  expect(mock).toBeCalledWith(["KEY-3"]);
});
