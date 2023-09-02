import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { RelationEditor } from "./relation-editor";
import { createStore } from "@/state/store";
import { randomIssue } from "@/mock-data";

afterEach(cleanup);

const renderWrapper = (v: React.ReactElement) =>
  render(v, {
    wrapper(props) {
      return (
        <>
          {props.children}
          <div id="dialog-root" />
        </>
      );
    },
  });

test("should be able to render", async () => {
  const store = createStore();
  renderWrapper(
    <Provider store={store}>
      <RelationEditor />
    </Provider>,
  );

  const issues = screen.queryAllByTestId("issue/root");

  expect(issues).toHaveLength(0);
});
