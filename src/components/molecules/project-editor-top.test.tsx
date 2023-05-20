import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectEditorTop } from "./project-editor-top";

afterEach(cleanup);

test("should be able to render", () => {
  render(<ProjectEditorTop />);

  const key = screen.queryByTestId("root");

  expect(key).not.toBeNull();
});

test("initial project name if their are not set", () => {
  render(<ProjectEditorTop />);

  const elemenet = screen.queryByText("Select project");

  expect(elemenet).not.toBeNull();
});

test("show project name and key", async () => {
  render(<ProjectEditorTop name="name of project" projectKey="key" />);

  const element = screen.getByTestId("name");

  expect(element.textContent).toMatch("key | name of project");
});

test("handle event to require edit", async () => {
  expect.assertions(1);

  render(
    <ProjectEditorTop
      onRequireEdit={() => {
        expect(true);
      }}
    />,
  );

  await userEvent.click(screen.getByTestId("editButton"));
});
