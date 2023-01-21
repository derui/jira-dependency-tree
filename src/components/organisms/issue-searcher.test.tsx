import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { IssueSearcher } from "./issue-searcher";
import { createPureStore } from "@/state/store";
import { submitApiCredentialFulfilled, submitProjectKeyFulfilled, synchronizeIssuesFulfilled } from "@/state/actions";
import { randomCredential, randomIssue, randomProject } from "@/mock-data";

afterEach(cleanup);

test("should be able to render", () => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <IssueSearcher />
    </Provider>,
  );

  const opener = screen.getByTestId("opener");

  expect(opener.getAttribute("aria-disabled")).toBe("true");
});

test("should be clickable after setup finished", async () => {
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

  expect(opener.getAttribute("aria-disabled")).toBe("false");
  expect(screen.getByTestId("input-wrapper").getAttribute("aria-hidden")).toBe("true");
});

test("open term input after opener clicked", async () => {
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

  expect(term.getAttribute("aria-hidden")).toBe("false");
});

test("show issue are matched with inputted term", async () => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(randomProject()));
  store.dispatch(submitApiCredentialFulfilled(randomCredential()));
  store.dispatch(
    synchronizeIssuesFulfilled([
      randomIssue({ key: "TES-10", summary: "summary" }),
      randomIssue({ key: "TES-11", summary: "other" }),
      randomIssue({ key: "OTHER-11", summary: "not match" }),
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

  expect(issues).toHaveLength(2);
  expect(issues.some((v) => v.textContent?.includes("TES-10"))).toBeTruthy();
  expect(issues.some((v) => v.textContent?.includes("TES-11"))).toBeTruthy();
});

test("reset after click cancel", async () => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(randomProject()));
  store.dispatch(submitApiCredentialFulfilled(randomCredential()));
  store.dispatch(
    synchronizeIssuesFulfilled([
      randomIssue({ key: "TES-10", summary: "summary" }),
      randomIssue({ key: "TES-11", summary: "other" }),
      randomIssue({ key: "OTHER-11", summary: "not match" }),
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

  expect(issues).toHaveLength(0);
  expect(term.value).toBe("");
});

test("send action when issue click", async () => {
  const store = createPureStore();
  store.dispatch(submitProjectKeyFulfilled(randomProject()));
  store.dispatch(submitApiCredentialFulfilled(randomCredential()));
  store.dispatch(
    synchronizeIssuesFulfilled([
      randomIssue({ key: "TES-10", summary: "summary" }),
      randomIssue({ key: "TES-11", summary: "other" }),
      randomIssue({ key: "OTHER-11", summary: "not match" }),
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
});
