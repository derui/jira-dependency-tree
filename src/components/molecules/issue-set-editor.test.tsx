import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Sinon from "sinon";
import { IssueSetEditor } from "./issue-set-editor";

afterEach(cleanup);

test("should be able to render", () => {
  render(<IssueSetEditor name="name" />);

  expect(screen.queryByDisplayValue("name")).not.toBeNull();
});

test("call handler after submit", async () => {
  const user = userEvent.setup();

  render(
    <IssueSetEditor
      name="name"
      onRename={(from, to) => {
        expect(from).toEqual("name");
        expect(to).toEqual("renamed");
      }}
    />,
  );

  await user.clear(screen.getByTestId("input"));
  await user.type(screen.getByTestId("input"), "renamed");
  await user.click(screen.getByTestId("submit"));
});

test("call handerl after cancel", async () => {
  const user = userEvent.setup();
  const mock = Sinon.fake();

  render(<IssueSetEditor name="name" onCancel={mock} />);

  await user.click(screen.getByTestId("cancel"));

  expect(mock.calledOnce).toEqual(true);
});
