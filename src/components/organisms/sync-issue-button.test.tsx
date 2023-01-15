// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { SyncIssueButton } from "./sync-issue-button";
import { createPureStore } from "@/state/store";
import { submitApiCredentialFulfilled, submitProjectKeyFulfilled } from "@/state/actions";
import { projectFactory } from "@/model/project";
import { Loading } from "@/type";

test.afterEach(cleanup);

test.serial("initial state is disabled all", (t) => {
  render(
    <Provider store={createPureStore()}>
      <SyncIssueButton />
    </Provider>,
  );

  const button = screen.getByTestId("button/button") as HTMLBaseElement;

  t.is(button.getAttribute("aria-disabled"), "true");
});

test.serial("do not disable if setup finished", (t) => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(projectFactory({ key: "key", id: "id", name: "name" })));
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

  const button = screen.getByTestId("button/button") as HTMLBaseElement;
  t.is(button.getAttribute("aria-disabled"), "false");
});

test.serial("dispatch action when click action", async (t) => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(projectFactory({ key: "key", id: "id", name: "name" })));
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

  const button = screen.getByTestId("button/button") as HTMLBaseElement;

  await userEvent.click(button);

  t.is(store.getState().issues.loading, Loading.Loading);
  t.is(button.getAttribute("aria-disabled"), "true");
});
