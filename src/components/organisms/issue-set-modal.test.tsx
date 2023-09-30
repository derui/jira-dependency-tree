import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { IssueSetModal } from "./issue-set-modal";
import { getWrapper } from "@/hooks/hook-test-util";
import { createStore } from "@/status/store";

afterEach(cleanup);

test("should be able to render", () => {
  const store = createStore();

  render(<IssueSetModal />, { wrapper: getWrapper(store) });

  expect(screen.queryAllByText("Default")).toHaveLength(2);
});

test("create new issue set", async () => {
  const user = userEvent.setup();
  const store = createStore();

  render(<IssueSetModal />, { wrapper: getWrapper(store) });

  await user.click(screen.getByTestId("creator/button"));
  await user.type(screen.getByTestId("creator/editor/input"), "new");
  await user.click(screen.getByTestId("creator/editor/submit"));

  expect(screen.getAllByTestId("issue-set/name")).toHaveLength(2);
  expect(screen.queryByText("new")).not.toBeNull();
  expect(screen.queryByTestId("creator/editor/input")).toBeNull();
  expect(screen.queryByTestId("creator/button")).not.toBeNull();
});

test("delete issue", async () => {
  const user = userEvent.setup();
  const store = createStore();

  render(<IssueSetModal />, { wrapper: getWrapper(store) });

  await user.click(screen.getByTestId("creator/button"));
  await user.type(screen.getByTestId("creator/editor/input"), "new");
  await user.click(screen.getByTestId("creator/editor/submit"));
  await user.click(screen.getAllByTestId("issue-set/delete-requester")[1]);
  await user.click(screen.getAllByTestId("issue-set/delete-confirm")[1]);

  expect(screen.getAllByTestId("issue-set/name")).toHaveLength(1);
  expect(screen.queryByText("new")).toBeNull();
  expect(screen.queryByTestId("creator/editor/input")).toBeNull();
  expect(screen.queryByTestId("creator/button")).not.toBeNull();
});

test("rename issue set", async () => {
  const user = userEvent.setup();
  const store = createStore();

  render(<IssueSetModal />, { wrapper: getWrapper(store) });

  await user.click(screen.getByTestId("creator/button"));
  await user.type(screen.getByTestId("creator/editor/input"), "new");
  await user.click(screen.getByTestId("creator/editor/submit"));
  await user.click(screen.getAllByTestId("issue-set/rename-requester")[1]);
  await user.type(screen.getByTestId("renamer/input"), "renamed");
  await user.click(screen.getByTestId("renamer/submit"));

  expect(screen.getAllByTestId("issue-set/name")).toHaveLength(1);
  expect(screen.queryByText("renamed")).toBeNull();
});
