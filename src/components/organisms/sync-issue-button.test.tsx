// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { SyncIssueButton } from "./sync-issue-button";
import { createStore } from "@/state/store";
import { env } from "@/env";
import { createDependencyRegistrar } from "@/util/dependency-registrar";
import { Dependencies } from "@/dependencies";
import { submitApiCredentialFulfilled, submitProjectKeyFulfilled } from "@/state/actions";
import { projectFactory } from "@/model/project";
import { Loading } from "@/type";

test.afterEach(cleanup);

const registrar = createDependencyRegistrar<Dependencies>();

test.before(() => {
  registrar.register("env", env);
});

test.serial("initial state is disabled all", (t) => {
  render(
    <Provider store={createStore(registrar)}>
      <SyncIssueButton />
    </Provider>,
  );

  const button = screen.getByTestId("button/button") as HTMLBaseElement;

  t.is(button.getAttribute("aria-disabled"), "true");
});

test.serial("do not disable if setup finished", (t) => {
  const store = createStore(registrar);
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
  const store = createStore(registrar);
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
});
