import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { TopToolbar } from "./top-toolbar";
import { createStore } from "@/status/store";

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
});
