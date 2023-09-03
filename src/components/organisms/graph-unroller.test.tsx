import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { GraphUnroller } from "./graph-unroller";
import { createStore } from "@/state/store";
import { expandIssue, importIssues } from "@/state/actions";
import { randomIssue } from "@/mock-data";

afterEach(cleanup);

test("should be able to render", () => {
  const store = createStore();

  render(
    <Provider store={store}>
      <GraphUnroller />
    </Provider>,
  );

  const icon = screen.getByTestId("unroller");

  expect(icon.dataset.active).toBe("false");
});

test("should active icon when graph expanding", () => {
  const store = createStore();
  store.dispatch(importIssues({ issues: [randomIssue({ key: "key" })] }));
  store.dispatch(expandIssue("key"));

  render(
    <Provider store={store}>
      <GraphUnroller />
    </Provider>,
  );

  const icon = screen.getByTestId("unroller");

  expect(icon.dataset.active).toBe("true");
});

test("narrow and inactive icon", async () => {
  const store = createStore();
  store.dispatch(importIssues({ issues: [randomIssue({ key: "key" })] }));
  store.dispatch(expandIssue("key"));

  render(
    <Provider store={store}>
      <GraphUnroller />
    </Provider>,
  );

  const button = screen.getByTestId("unroller");
  await userEvent.click(button);

  const icon = screen.getByTestId("unroller");

  expect(icon.dataset.active).toBe("false");
  expect(store.getState().issues.projectionTarget.kind).toBe("Root");
});
