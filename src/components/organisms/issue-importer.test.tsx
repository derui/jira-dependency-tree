import { test, expect, afterEach, beforeAll, afterAll, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import Sinon from "sinon";
import { IssueImporter } from "./issue-importer";
import { createPureStore } from "@/state/store";
import { setupMockServer } from "@/mock/server";
import { submitApiCredentialFulfilled } from "@/state/actions";
import { randomApiIssue, randomCredential } from "@/mock-data";

const server = setupMockServer();

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(cleanup);
afterEach(() => {
  server.reset();
});
afterEach(() => {
  vi.useRealTimers();
});

test("should be able to render", () => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <IssueImporter />
    </Provider>,
  );

  const root = screen.getByTestId("root");

  expect(root.getAttribute("aria-hidden")).toBe("true");
});

test("open and close panel", async () => {
  const user = userEvent.setup();
  const store = createPureStore();
  const onClose = Sinon.fake.returns(null);

  render(
    <Provider store={store}>
      <IssueImporter opened onClose={onClose} />
    </Provider>,
  );

  const root = screen.getByTestId("root");

  expect(root.getAttribute("aria-hidden")).toBe("false");
  expect(screen.queryByTestId("issue-list/empty")).not.toBeNull();

  await user.click(screen.getByTestId("close"));

  expect(onClose.called).toBeTruthy();
});

test("change loading state of input query and search", async () => {
  const user = userEvent.setup();
  const store = createPureStore();
  store.dispatch(submitApiCredentialFulfilled(randomCredential()));

  render(
    <Provider store={store}>
      <IssueImporter opened />
    </Provider>,
  );

  server.use({
    searchIssues(_, res, ctx) {
      return res(ctx.delay(1000), ctx.json({ issues: [] }));
    },
  });

  await user.type(screen.getByTestId("query-input/input"), "sample jql");
  await user.click(screen.getByTestId("query-input/button"));

  expect(screen.getByTestId("query-input/button").getAttribute("aria-disabled")).toBe("true");
  expect(screen.getAllByTestId("issue-list/skeleton/root-skeleton")).toHaveLength(3);
});

test("display empty list", async () => {
  const user = userEvent.setup();
  const store = createPureStore();
  store.dispatch(submitApiCredentialFulfilled(randomCredential()));

  render(
    <Provider store={store}>
      <IssueImporter opened />
    </Provider>,
  );

  server.use({
    searchIssues(_, res, ctx) {
      return res(ctx.json({ issues: [] }));
    },
  });

  await user.type(screen.getByTestId("query-input/input"), "sample jql");
  await user.click(screen.getByTestId("query-input/button"));

  expect(screen.getByTestId("query-input/button").getAttribute("aria-disabled")).toBe("false");
  expect(screen.queryByTestId("issue-list/empty")).not.toBeNull();
});

test("display error when API is failed", async () => {
  const user = userEvent.setup();
  const store = createPureStore();
  store.dispatch(submitApiCredentialFulfilled(randomCredential()));

  render(
    <Provider store={store}>
      <IssueImporter opened />
    </Provider>,
  );

  server.use({
    searchIssues(_, res, ctx) {
      return res(ctx.status(400), ctx.json({ message: "invalid syntax" }));
    },
  });

  await user.type(screen.getByTestId("query-input/input"), "sample jql");
  await user.click(screen.getByTestId("query-input/button"));

  expect(screen.getByTestId("query-input/button").getAttribute("aria-disabled")).toBe("false");
  expect(screen.getByTestId("query-input/error").textContent).toContain("invalid syntax");
});

test("display issues when API returns some issues", async () => {
  const user = userEvent.setup();
  const store = createPureStore();
  store.dispatch(submitApiCredentialFulfilled(randomCredential()));

  render(
    <Provider store={store}>
      <IssueImporter opened />
    </Provider>,
  );

  server.use({
    searchIssues(_, res, ctx) {
      return res(ctx.json({ issues: [randomApiIssue({ key: "key" })] }));
    },
  });

  await user.type(screen.getByTestId("query-input/input"), "sample jql");
  await user.click(screen.getByTestId("query-input/button"));

  expect(screen.getAllByTestId("issue-list/issue/root")).toHaveLength(1);
  expect(screen.getAllByTestId("issue-list/issue/root")[0].textContent).toContain("key");
});