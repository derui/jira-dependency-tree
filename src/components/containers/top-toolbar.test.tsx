import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { TopToolbar } from "./top-toolbar";
import { createStore } from "@/state/store";

afterEach(cleanup);

const renderWrapper = (comp: React.ReactElement) => {
  return render(
    <>
      <div id="panel-root" />
      {comp}
    </>,
  );
};

test("should be able to render", async () => {
  const store = createStore();

  renderWrapper(
    <Provider store={store}>
      <TopToolbar />
    </Provider>,
  );

  const panel = screen.getByTestId("importer/root");
  const button = screen.getByTestId("importer-opener");
  const relationEditorButton = screen.getByTestId("relation-editor-opener");

  expect(panel.getAttribute("aria-hidden")).toBe("true");
  expect(button.getAttribute("aria-disabled")).toEqual("false");
  expect(relationEditorButton.getAttribute("aria-disabled")).toEqual("false");
});

test("open panel after clicked", async () => {
  const store = createStore();

  renderWrapper(
    <Provider store={store}>
      <TopToolbar />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("importer-opener"));

  const panel = screen.getByTestId("importer/root");
  const button = screen.getByTestId("importer-opener");
  const relationEditorButton = screen.getByTestId("relation-editor-opener");

  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(relationEditorButton.getAttribute("aria-disabled")).toBe("true");
  expect(panel.getAttribute("aria-hidden")).toBe("false");
});

test("close panel", async () => {
  const store = createStore();

  renderWrapper(
    <Provider store={store}>
      <TopToolbar />
    </Provider>,
  );

  await userEvent.click(screen.getByTestId("importer-opener"));
  await userEvent.click(screen.getByTestId("importer/close"));

  const panel = screen.getByTestId("importer/root");
  const button = screen.getByTestId("importer-opener");
  const relationEditorButton = screen.getByTestId("relation-editor-opener");

  expect(button.getAttribute("aria-disabled")).toBe("false");
  expect(relationEditorButton.getAttribute("aria-disabled")).toBe("false");
  expect(panel.getAttribute("aria-hidden")).toBe("true");
});
