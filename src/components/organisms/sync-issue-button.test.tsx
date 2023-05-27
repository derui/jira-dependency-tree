import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { SyncIssueButton } from "./sync-issue-button";
import { createPureStore } from "@/state/store";
import { submitApiCredentialFulfilled, submitProjectIdFulfilled } from "@/state/actions";
import { projectFactory } from "@/model/project";
import { Loading } from "@/type";

afterEach(cleanup);

test("initial state is disabled all", () => {
  render(
    <Provider store={createPureStore()}>
      <SyncIssueButton />
    </Provider>,
  );

  const button = screen.getByTestId("button") as HTMLBaseElement;

  expect(button.getAttribute("aria-disabled")).toBe("true");
});

test("do not disable if setup finished", () => {
  const store = createPureStore();
  store.dispatch(submitProjectIdFulfilled(projectFactory({ key: "key", id: "id", name: "name" })));
  store.dispatch(
    submitApiCredentialFulfilled({
      apiBaseUrl: "url",
      apiKey: "key",
      email: "email",
      token: "token",
      userDomain: "domain",
    }),
  );

  render(
    <Provider store={store}>
      <SyncIssueButton />
    </Provider>,
  );

  const button = screen.getByTestId("button") as HTMLBaseElement;
  expect(button.getAttribute("aria-disabled")).toBe("false");
});

test("dispatch action when click action", async () => {
  const store = createPureStore();
  store.dispatch(submitProjectIdFulfilled(projectFactory({ key: "key", id: "id", name: "name" })));
  store.dispatch(
    submitApiCredentialFulfilled({
      apiBaseUrl: "url",
      apiKey: "key",
      email: "email",
      token: "token",
      userDomain: "domain",
    }),
  );

  render(
    <Provider store={store}>
      <SyncIssueButton />
    </Provider>,
  );

  const button = screen.getByTestId("button") as HTMLBaseElement;

  await userEvent.click(button);

  expect(store.getState().issues.loading).toBe(Loading.Loading);
  expect(button.getAttribute("aria-disabled")).toBe("true");
});
