import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Sinon from "sinon";
import { Panel } from "./panel";

const renderWrapper = (comp: React.ReactElement) => {
  return render(
    <>
      <div id="panel-root" />
      {comp}
    </>,
  );
};

afterEach(cleanup);

test("should be able to render", () => {
  renderWrapper(<Panel />);

  expect(screen.getByTestId("root").getAttribute("aria-hidden")).toEqual("true");
});

test("render children", () => {
  renderWrapper(<Panel>render children</Panel>);

  expect(screen.getByText("render", { exact: false }).textContent).toEqual("render children");
});

test("render title", () => {
  renderWrapper(<Panel opened={true} title="foobar"></Panel>);

  expect(screen.queryByText("foobar")).not.toBeNull();
});

test("call onClose", async () => {
  const user = userEvent.setup();
  const mock = Sinon.fake();

  renderWrapper(<Panel onClose={mock} opened={true} />);
  expect(screen.getByTestId("root").getAttribute("aria-hidden")).toEqual("false");

  await user.click(screen.getByRole("button"));

  expect(mock.calledOnce).toBeTruthy();
});
