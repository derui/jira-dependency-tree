import { test, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { useGetApiCredential } from "./get-api-credential";
import { getWrapper } from "./hook-test-util";
import { createPureStore } from "@/state/store";
import { submitApiCredentialFulfilled } from "@/state/actions";

test("get undefined if credential is not setupped", () => {
  const store = createPureStore();

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

  const store = createPureStore();

  const ret = renderHook(() => useGetApiCredential(), { wrapper: getWrapper(store) });

  expect(ret.result.current).toBeUndefined();

  act(() => {
    store.dispatch(submitApiCredentialFulfilled(credential));
  });

  expect(ret.result.current).toEqual(credential);
});
