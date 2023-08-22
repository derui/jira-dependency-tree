import { test, expect, vi, afterEach, Mock } from "vitest";
import { renderHook } from "@testing-library/react";
import { getWrapper, waitForNextUpdate } from "./hook-test-util";
import { useSearchIssues } from "./search-issues";
import { createPureStore } from "@/state/store";
import { submitApiCredentialFulfilled } from "@/state/actions";
import { Apis } from "@/apis/api";

vi.mock("@/apis/api", () => {
  return {
    Apis: {
      searchIssues: {
        call: vi.fn(),
      },
    },
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

const credential = {
  apiBaseUrl: "aa",
  apiKey: "key",
  email: "email",
  token: "token",
  userDomain: "domain",
};

test("initial state is loading", async () => {
  const store = createPureStore();

  const ret = renderHook(() => useSearchIssues("jql"), { wrapper: getWrapper(store) });

  expect(ret.result.current).toEqual({ isLoading: true });

  await waitForNextUpdate();

  expect(ret.result.current).toEqual({ isLoading: true });
});

test("get result if jql and api credential are given and success API", async () => {
  (Apis.searchIssues.call as Mock).mockResolvedValue([[]]);

  const store = createPureStore();

  const ret = renderHook(() => useSearchIssues("jql"), { wrapper: getWrapper(store) });

  expect(ret.result.current).toEqual({ isLoading: true });

  store.dispatch(submitApiCredentialFulfilled(credential));

  await waitForNextUpdate();

  expect(ret.result.current).toEqual({ isLoading: false, data: [] });
});

test("get error if api failed", async () => {
  (Apis.searchIssues.call as Mock).mockRejectedValue({ message: "error" });

  const store = createPureStore();

  const ret = renderHook(() => useSearchIssues("jql"), { wrapper: getWrapper(store) });

  expect(ret.result.current).toEqual({ isLoading: true });

  store.dispatch(submitApiCredentialFulfilled(credential));

  await waitForNextUpdate();

  expect(ret.result.current).toEqual({ isLoading: false, error: "Error occurred" });
});
