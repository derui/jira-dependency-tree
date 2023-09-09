import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Issue } from "./issue";

afterEach(cleanup);

test("should be able to render", () => {
  const issue = { key: "key", summary: "summary of issue" };

  render(<Issue issue={issue} />);

  const summary = screen.getByTestId("summary");

  expect(summary.textContent).toContain("summary of issue");
});

test("do not call onclick when it was not passed", async () => {
  expect.assertions(0);
  const issue = { key: "key", summary: "summary of issue" };

  render(<Issue issue={issue} />);

  await userEvent.click(screen.getByTestId("root"));
});

test("call onclick", async () => {
  expect.assertions(1);
  const issue = { key: "key", summary: "summary of issue" };

  render(<Issue issue={issue} onClick={(key) => expect(key).toBe("key")} />);

  await userEvent.click(screen.getByTestId("root"));
});

test("do not value issue type and status when there were not send", async () => {
  const issue = { key: "key", summary: "summary of issue" };

  render(<Issue issue={issue} onClick={(key) => expect(key).toBe("key")} />);

  const key = screen.getByTestId("key");
  const type = screen.getByTestId("type");
  const status = screen.getByTestId("status");
  const deleteButton = screen.queryByTestId("delete");

  expect(key.textContent).toContain("key");
  expect(type.textContent).toBe("");
  expect(status.textContent).toBe("");
  expect(deleteButton).toBeNull();
});

test("display value for type and status", async () => {
  const issue = {
    key: "key",
    summary: "summary of issue",
    issueStatus: {
      id: "id",
      name: "name",
      statusCategory: "DONE",
    },
    issueType: { id: "id", name: "Task", avatarUrl: "" },
  };

  render(<Issue issue={issue} onClick={(key) => expect(key).toBe("key")} />);

  const key = screen.getByTestId("key");
  const status = screen.getByTestId("status");

  expect(key.textContent).toContain("key");
  expect(status.textContent).toBe("DONE");
});

test("show delete button", async () => {
  expect.assertions(1);
  const issue = {
    key: "key",
    summary: "summary of issue",
    issueStatus: {
      id: "id",
      name: "name",
      statusCategory: "DONE",
    },
    issueType: { id: "id", name: "Task", avatarUrl: "" },
  };

  render(<Issue issue={issue} onDelete={(key) => expect(key).toBe("key")} />);

  const button = screen.getByTestId("delete");

  await userEvent.click(button);
});

test("do not propagate after click delete", async () => {
  expect.assertions(1);

  const issue = { key: "key", summary: "summary of issue" };

  render(
    <Issue
      issue={issue}
      onClick={() => expect.fail()}
      onDelete={(key) => {
        expect(key).toBe("key");
      }}
    />,
  );

  const deleteButton = screen.getByTestId("delete");

  await userEvent.click(deleteButton);
});
