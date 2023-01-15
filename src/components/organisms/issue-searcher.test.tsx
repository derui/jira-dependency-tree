// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { IssueSearcher } from "./issue-searcher";
import { createPureStore } from "@/state/store";
import {
  focusIssueOnSearch,
  submitApiCredentialFulfilled,
  submitProjectKeyFulfilled,
  synchronizeIssuesFulfilled,
} from "@/state/actions";
import { randomCredential, randomProject } from "@/mock-data";
import { Issue } from "@/model/issue";

test.afterEach(cleanup);

test.serial("should be able to render", (t) => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <IssueSearcher />
    </Provider>,
  );

  const opener = screen.getByTestId("opener");

  t.is(opener.getAttribute("aria-disabled"), "true");
});

test.serial("should be clickable after setup finished", async (t) => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <IssueSearcher />
    </Provider>,
  );

  const opener = screen.getByTestId("opener");

  act(() => {
    store.dispatch(submitProjectKeyFulfilled(randomProject()));
    store.dispatch(submitApiCredentialFulfilled(randomCredential()));
  });

  t.is(opener.getAttribute("aria-disabled"), "false");
  t.is(screen.getByTestId("input-wrapper").getAttribute("aria-hidden"), "true");
});

test.serial("open term input after opener clicked", async (t) => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(randomProject()));
  store.dispatch(submitApiCredentialFulfilled(randomCredential()));

  render(
    <Provider store={store}>
      <IssueSearcher />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("opener"));

  const term = screen.getByTestId("input-wrapper");

  t.is(term.getAttribute("aria-hidden"), "false");
});

test.serial("show issue are matched with inputted term", async (t) => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(randomProject()));
  store.dispatch(submitApiCredentialFulfilled(randomCredential()));
  store.dispatch(
    synchronizeIssuesFulfilled([
      { key: "TES-10", summary: "summary" } as Issue,
      { key: "TES-11", summary: "other" } as Issue,
      { key: "OTHER-11", summary: "not match" } as Issue,
    ]),
  );

  render(
    <Provider store={store}>
      <IssueSearcher />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("opener"));
  await userEvent.type(screen.getByTestId("input"), "TES");

  const issues = screen.getAllByTestId("issue");

  t.is(issues.length, 2);
  t.is(
    issues.some((v) => v.textContent?.includes("TES-10")),
    true,
  );
  t.is(
    issues.some((v) => v.textContent?.includes("TES-11")),
    true,
  );
});

test.serial("reset after click cancel", async (t) => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(randomProject()));
  store.dispatch(submitApiCredentialFulfilled(randomCredential()));
  store.dispatch(
    synchronizeIssuesFulfilled([
      { key: "TES-10", summary: "summary" } as Issue,
      { key: "TES-11", summary: "other" } as Issue,
      { key: "OTHER-11", summary: "not match" } as Issue,
    ]),
  );

  render(
    <Provider store={store}>
      <IssueSearcher />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("opener"));
  await userEvent.type(screen.getByTestId("input"), "TES");
  await userEvent.click(screen.getByTestId("cancel"));

  const issues = screen.queryAllByTestId("issue");
  const term = screen.getByTestId("input") as HTMLInputElement;

  t.is(issues.length, 0);
  t.is(term.value, "");
});

test.serial("send action when issue click", async (t) => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(randomProject()));
  store.dispatch(submitApiCredentialFulfilled(randomCredential()));
  store.dispatch(
    synchronizeIssuesFulfilled([
      { key: "TES-10", summary: "summary" } as Issue,
      { key: "TES-11", summary: "other" } as Issue,
      { key: "OTHER-11", summary: "not match" } as Issue,
    ]),
  );

  render(
    <Provider store={store}>
      <IssueSearcher />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("opener"));
  await userEvent.type(screen.getByTestId("input"), "TES-10");

  const issue = screen.getByTestId("issue");
  await userEvent.click(issue);
  t.pass();
});
