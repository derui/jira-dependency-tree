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
