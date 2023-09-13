import { test, expect, afterEach, beforeAll, afterAll, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import Sinon from "sinon";
import { IssueImporter } from "./issue-importer";
import { createStore } from "@/status/store";
import { setupMockServer } from "@/mock/server";
import { submitApiCredential } from "@/status/actions";
import { randomApiIssue, randomCredential } from "@/mock/generators";

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

const renderWrapper = (comp: React.ReactElement) => {
  return render(
    <>
      <div id="panel-root" />
      {comp}
    </>,
  );
};

test("should be able to render", () => {
  const store = createStore();

  renderWrapper(
    <Provider store={store}>
      <IssueImporter />
    </Provider>,
  );

  const root = screen.getByTestId("root");

  expect(root.getAttribute("aria-hidden")).toBe("true");
});

test("open and close panel", async () => {
  const user = userEvent.setup();
  const store = createStore();
  const onClose = Sinon.fake.returns(null);

  renderWrapper(
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
  const store = createStore();
  store.dispatch(submitApiCredential(randomCredential()));

  renderWrapper(
    <Provider store={store}>
      <IssueImporter opened />
    </Provider>,
  );

  server.use({
    searchIssues(_, res, ctx) {
      return res(ctx.delay(1000), ctx.json([]));
    },
  });

  await user.type(screen.getByTestId("query-input/input"), "sample jql");
  await user.click(screen.getByTestId("query-input/button"));

  expect(screen.getByTestId("query-input/button").getAttribute("aria-disabled")).toBe("true");
  expect(screen.getAllByTestId("issue-list/skeleton/root-skeleton")).toHaveLength(3);
  expect(screen.getAllByTestId("paginator/skeleton")).toHaveLength(2);
});

test("display empty list", async () => {
  const user = userEvent.setup();
  const store = createStore();
  store.dispatch(submitApiCredential(randomCredential()));

  renderWrapper(
    <Provider store={store}>
      <IssueImporter opened />
    </Provider>,
  );

  server.use({
    searchIssues(_, res, ctx) {
      return res(ctx.json([]));
    },
  });

  await user.type(screen.getByTestId("query-input/input"), "sample jql");
  await user.click(screen.getByTestId("query-input/button"));

  expect(screen.getByTestId("query-input/button").getAttribute("aria-disabled")).toBe("false");
  expect(screen.queryByTestId("issue-list/empty")).not.toBeNull();
});

test("display error when API is failed", async () => {
  const user = userEvent.setup();
  const store = createStore();
  store.dispatch(submitApiCredential(randomCredential()));

  renderWrapper(
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
  const store = createStore();
  store.dispatch(submitApiCredential(randomCredential()));

  renderWrapper(
    <Provider store={store}>
      <IssueImporter opened />
    </Provider>,
  );

  server.use({
    searchIssues(_, res, ctx) {
      return res(ctx.json([randomApiIssue({ key: "key" })]));
    },
  });

  await user.type(screen.getByTestId("query-input/input"), "sample jql");
  await user.click(screen.getByTestId("query-input/button"));

  expect(screen.getAllByTestId("issue-list/key/root")).toHaveLength(1);
  expect(screen.getAllByTestId("issue-list/key/root")[0].textContent).toContain("key");
});

test("disable backward pagination after initial search", async () => {
  const user = userEvent.setup();
  const store = createStore();
  store.dispatch(submitApiCredential(randomCredential()));

  renderWrapper(
    <Provider store={store}>
      <IssueImporter opened />
    </Provider>,
  );

  server.use({
    searchIssues(_, res, ctx) {
      return res(ctx.json([randomApiIssue({ key: "key" })]));
    },
  });

  await user.type(screen.getByTestId("query-input/input"), "sample jql");
  await user.click(screen.getByTestId("query-input/button"));

  expect(screen.getByTestId("paginator/backward").getAttribute("aria-disabled")).toBe("true");
  expect(screen.getByTestId("paginator/forward").getAttribute("aria-disabled")).toBe("false");
});

test("change page after search", async () => {
  const user = userEvent.setup();
  const store = createStore();
  store.dispatch(submitApiCredential(randomCredential()));

  renderWrapper(
    <Provider store={store}>
      <IssueImporter opened />
    </Provider>,
  );

  server.use({
    async searchIssues(_, res, ctx) {
      return res(ctx.json([randomApiIssue({ key: "key" })]));
    },
  });

  await user.type(screen.getByTestId("query-input/input"), "sample jql");
  await user.click(screen.getByTestId("query-input/button"));

  server.use({
    async searchIssues(req, res, ctx) {
      const json = await req.json();

      expect(json.page).toBe(2);

      return res(ctx.json([randomApiIssue({ key: "key2" })]));
    },
  });

  await user.click(screen.getByTestId("paginator/forward"));

  expect(screen.getByTestId("paginator/backward").getAttribute("aria-disabled")).toBe("false");
  expect(screen.getByTestId("paginator/forward").getAttribute("aria-disabled")).toBe("false");
  expect(screen.getByTestId("paginator/page").textContent).toContain("Page 2");
  expect(screen.getByTestId("issue-list/key2/root").textContent).toContain("key2");
});

test("select issue to mark to import after", async () => {
  const user = userEvent.setup();
  const store = createStore();
  store.dispatch(submitApiCredential(randomCredential()));

  renderWrapper(
    <Provider store={store}>
      <IssueImporter opened />
    </Provider>,
  );

  server.use({
    async searchIssues(_, res, ctx) {
      return res(ctx.json([randomApiIssue({ key: "key" })]));
    },
  });

  await user.type(screen.getByTestId("query-input/input"), "sample jql");
  await user.click(screen.getByTestId("query-input/button"));
  await user.click(screen.getByTestId("issue-list/key/root"));

  expect(screen.getByTestId("issue-list/check-key/root").getAttribute("aria-selected")).toEqual("true");
  expect(screen.getByTestId("paginator/import").getAttribute("disabled")).toBeNull();
  await user.click(screen.getByTestId("issue-list/key/root"));

  expect(screen.getByTestId("issue-list/check-key/root").getAttribute("aria-selected")).toEqual("false");
  expect(screen.getByTestId("paginator/import").getAttribute("disabled")).not.toBeNull();
});

test("execute import when some issues are selected", async () => {
  expect.assertions(1);

  const user = userEvent.setup();
  const store = createStore();
  store.dispatch(submitApiCredential(randomCredential()));

  renderWrapper(
    <Provider store={store}>
      <IssueImporter opened />
    </Provider>,
  );

  server.use({
    async searchIssues(_, res, ctx) {
      return res(ctx.json([randomApiIssue({ key: "key" })]));
    },
    async getIssues(req, res, ctx) {
      const json = await req.json();
      expect(json.issues).toContain("key");

      return res(ctx.json([randomApiIssue({ key: "key" })]));
    },
  });

  await user.type(screen.getByTestId("query-input/input"), "sample jql");
  await user.click(screen.getByTestId("query-input/button"));
  await user.click(screen.getByTestId("issue-list/key/root"));
  await user.click(screen.getByTestId("paginator/import"));
});
