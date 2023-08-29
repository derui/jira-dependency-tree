import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { IssueGraphLayouter } from "./issue-graph-layouter";
import { createStore } from "@/state/store";

afterEach(cleanup);

test("should be able to render", () => {
  const store = createStore();

  render(
    <Provider store={store}>
      <IssueGraphLayouter />
    </Provider>,
  );

  const icon = screen.getByTestId("graph-layout");

  expect(icon.dataset.active).toBe("false");
});

test("active when layouter clicked", async () => {
  const store = createStore();

  render(
    <Provider store={store}>
      <IssueGraphLayouter />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("graph-layout"));

  const icon = screen.getByTestId("graph-layout");
  const horizontal = screen.getByTestId("horizontal-layouter");
  const vertical = screen.getByTestId("vertical-layouter");

  expect(icon.dataset.active).toBe("true");
  expect(horizontal.dataset.active).toBe("true");
  expect(vertical.dataset.active).toBe("false");
  expect(screen.getByTestId("layouter").classList.contains("visible")).toBe(true);
});

test("change layout when clicked", async () => {
  const store = createStore();

  render(
    <Provider store={store}>
      <IssueGraphLayouter />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("graph-layout"));
  await userEvent.click(screen.getByTestId("vertical-layouter"));

  const icon = screen.getByTestId("graph-layout");
  const horizontal = screen.getByTestId("horizontal-layouter");
  const vertical = screen.getByTestId("vertical-layouter");

  expect(icon.dataset.active).toBe("false");
  expect(horizontal.dataset.active).toBe("false");
  expect(vertical.dataset.active).toBe("true");
});

test("toggle layouter", async () => {
  const store = createStore();

  render(
    <Provider store={store}>
      <IssueGraphLayouter />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("graph-layout"));
  await userEvent.click(screen.getByTestId("graph-layout"));

  const icon = screen.getByTestId("graph-layout");

  expect(icon.dataset.active).toBe("false");
  expect(screen.getByTestId("layouter").classList.contains("visible")).toBe(false);
});
