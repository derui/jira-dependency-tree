import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectInformationEditor } from "./project-information-editor";

afterEach(cleanup);

test("should be able to render", () => {
  render(<ProjectInformationEditor onSelectProject={() => {}} />);

  const key = screen.getByPlaceholderText("Project Key") as HTMLInputElement;

  expect(key.value).toBe("");
});

test("set initial payload as initial value", () => {
  render(<ProjectInformationEditor initialPayload={{ projectKey: "KEY" }} onSelectProject={() => {}} />);

  const key = screen.getByPlaceholderText("Project Key") as HTMLInputElement;

  expect(key.value).toBe("KEY");
});

test("get payload when typed", async () => {
  expect.assertions(1);

  render(
    <ProjectInformationEditor
      onSelectProject={(obj) => {
        expect(obj?.projectKey).toBe("KEY");
      }}
    />,
  );

  const key = screen.getByPlaceholderText("Project Key") as HTMLInputElement;

  await userEvent.type(key, "KEY");

  await userEvent.click(screen.getByTestId("submit"));
});

test("do not send payload if canceled", async () => {
  expect.assertions(1);

  render(
    <ProjectInformationEditor
      onSelectProject={(obj) => {
        expect(obj).toBeUndefined();
      }}
    />,
  );

  const token = screen.getByPlaceholderText("Project Key") as HTMLInputElement;

  await userEvent.type(token, "KEY");

  await userEvent.click(screen.getByTestId("cancel"));
});
