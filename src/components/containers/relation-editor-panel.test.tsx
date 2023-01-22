import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { RelationEditorPanel } from "./relation-editor-panel";
import { createPureStore } from "@/state/store";
import { selectIssueInGraph } from "@/state/actions";

afterEach(cleanup);

test("do not open panel first", () => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <RelationEditorPanel />
    </Provider>,
  );

  const panel = screen.getByTestId("root");

  expect(panel.getAttribute("aria-hidden")).toBe("true");
});

test("open panel after select issue", async () => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <RelationEditorPanel />
    </Provider>,
  );
  store.dispatch(selectIssueInGraph("key"));

  const panel = await screen.findByTestId("root");

  expect(panel.getAttribute("aria-hidden")).toBe("false");
});

test("close panel after click close button", async () => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <RelationEditorPanel />
    </Provider>,
  );
  store.dispatch(selectIssueInGraph("key"));

  await userEvent.click(screen.getByTestId("close/button"));

  const panel = await screen.findByTestId("root");

  expect(panel.getAttribute("aria-hidden")).toBe("true");
});

test("display selected key", async () => {
  const store = createPureStore();
  store.dispatch(selectIssueInGraph("key"));

  render(
    <Provider store={store}>
      <RelationEditorPanel />
    </Provider>,
  );

  const header = screen.getByTestId("header");

  expect(header.textContent).toContain("key");
});
