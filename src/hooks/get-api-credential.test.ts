import { test, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGetApiCredential } from "./get-api-credential";
import { getWrapper } from "./hook-test-util";
import { createStore } from "@/status/store";
import { submitApiCredential } from "@/status/actions";

test("get undefined if credential is not setupped", () => {
  const store = createStore();

  const ret = renderHook(() => useGetApiCredential(), { wrapper: getWrapper(store) });

  expect(ret.result.current).toBeUndefined();
});

test("get api credential", () => {
  const credential = {
    apiBaseUrl: "aa",
    apiKey: "key",
    email: "email",
    token: "token",
    userDomain: "domain",
  };

  const store = createStore();

  const ret = renderHook(() => useGetApiCredential(), { wrapper: getWrapper(store) });

  expect(ret.result.current).toBeUndefined();

  store.dispatch(submitApiCredential(credential));
  ret.rerender();

  expect(ret.result.current).toEqual(credential);
});
