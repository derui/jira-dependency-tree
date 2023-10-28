import { test, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

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
