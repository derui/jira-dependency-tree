import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Sinon from "sinon";
import { IssueSetItem } from "./issue-set-item";

afterEach(cleanup);

test("should be able to render", () => {
  render(<IssueSetItem name="name" />);

  expect(screen.queryByText("name")).not.toBeNull();
});

test("call handler after confirmation", async () => {
  const user = userEvent.setup();
  const onDelete = Sinon.fake();

  render(<IssueSetItem name="name" onDelete={onDelete} />);

  await user.click(screen.getByTestId("delete-requester"));
  await user.click(screen.getByTestId("delete-confirm"));

  expect(screen.getByTestId("confirmation").getAttribute("aria-disabled")).toEqual("false");
  expect(onDelete.calledOnce).toEqual(true);
});

test("do not call handler when cancel confirmation", async () => {
  const user = userEvent.setup();
  const onDelete = Sinon.fake();

  render(<IssueSetItem name="name" onDelete={onDelete} />);

  await user.click(screen.getByTestId("delete-requester"));
  await user.click(screen.getByTestId("delete-canceler"));

  expect(screen.getByTestId("confirmation").getAttribute("aria-disabled")).toEqual("true");
  expect(onDelete.calledOnce).toEqual(false);
});

test("call rename request handler", async () => {
  const user = userEvent.setup();
  const mock = Sinon.fake();

  render(<IssueSetItem name="name" onRenameRequested={mock} />);

  await user.click(screen.getByTestId("rename-requester"));

  expect(mock.calledOnce).toEqual(true);
});

test("call select handler", async () => {
  const user = userEvent.setup();
  const mock = Sinon.fake();

  render(<IssueSetItem name="name" onSelect={mock} />);

  await user.click(screen.getByTestId("name"));

  expect(mock.calledOnce).toEqual(true);
});
