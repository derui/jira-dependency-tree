import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { GraphUnroller } from "./graph-unroller";
import { createPureStore } from "@/state/store";
import { expandIssue, synchronizeIssuesFulfilled } from "@/state/actions";
import { randomIssue } from "@/mock-data";

afterEach(cleanup);

test("should be able to render", () => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <GraphUnroller />
    </Provider>,
  );

  const icon = screen.getByTestId("icon") as HTMLSpanElement;

  expect(icon.dataset.active).toBe("false");
});

test("should active icon when graph expanding", () => {
  const store = createPureStore();
  store.dispatch(synchronizeIssuesFulfilled([randomIssue({ key: "key" })]));
  store.dispatch(expandIssue("key"));

  render(
    <Provider store={store}>
      <GraphUnroller />
    </Provider>,
  );

  const icon = screen.getByTestId("icon") as HTMLSpanElement;

  expect(icon.dataset.active).toBe("true");
});

test("narrow and inactive icon", async () => {
  const store = createPureStore();
  store.dispatch(synchronizeIssuesFulfilled([randomIssue({ key: "key" })]));
  store.dispatch(expandIssue("key"));

  render(
    <Provider store={store}>
      <GraphUnroller />
    </Provider>,
  );

  const button = screen.getByTestId("unroller");
  await userEvent.click(button);

  const icon = screen.getByTestId("icon") as HTMLSpanElement;

  expect(icon.dataset.active).toBe("false");
  expect(store.getState().issues.projectionTarget.kind).toBe("Root");
});
