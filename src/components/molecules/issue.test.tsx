import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Issue } from "./issue";
import { StatusCategory } from "@/type";

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

  expect(key.textContent).toContain("key");
  expect(type.textContent).toBe("");
  expect(status.textContent).toBe("");
});

test("display value for type and status", async () => {
  const issue = {
    key: "key",
    summary: "summary of issue",
    issueStatus: {
      id: "id",
      name: "name",
      statusCategory: StatusCategory.DONE,
    },
    issueType: { id: "id", name: "Task", avatarUrl: "" },
  };

  render(<Issue issue={issue} onClick={(key) => expect(key).toBe("key")} />);

  const key = screen.getByTestId("key");
  const type = screen.getByTestId("type");
  const status = screen.getByTestId("status");

  expect(key.textContent).toContain("key");
  expect(type.textContent).toBe("Task");
  expect(status.textContent).toBe("DONE");
});
