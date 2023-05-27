import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectInformationEditor } from "./project-information-editor";

afterEach(cleanup);

test("should be able to render", () => {
  render(<ProjectInformationEditor />);

  const cancel = screen.queryByTestId("cancel");
  const submit = screen.queryByTestId("cancel");

  expect(cancel).not.toBeNull();
  expect(submit).not.toBeNull();
});

test("can not edit anything when list of suggestion is empty", async () => {
  render(<ProjectInformationEditor />);

  const el = screen.queryByText("No project to select");
  const submit = screen.getByTestId("submit");

  expect(el).not.toBeNull();
  expect(submit.getAttribute("aria-disabled")).toBe("true");
});

test("can cancel when list of suggestion is empty", async () => {
  expect.assertions(1);

  render(
    <ProjectInformationEditor
      onCancel={() => {
        expect(true);
      }}
    />,
  );

  await userEvent.click(screen.getByTestId("cancel"));
});

test("open suggestor and select", async () => {
  expect.assertions(1);

  render(
    <ProjectInformationEditor
      suggestions={[{ id: "id", value: "id", displayName: "name" }]}
      onSelectProject={(obj) => {
        expect(obj).toBe("id");
      }}
    />,
    {
      wrapper(props) {
        return (
          <>
            {props.children}
            <div id="dialog-root" />
          </>
        );
      },
    },
  );

  await userEvent.click(screen.getByTestId("suggestor/open"));
  await userEvent.type(screen.getByTestId("suggestor/main/term"), "name");
  await userEvent.click(screen.getByTestId("suggestor/main/suggestion"));
  await userEvent.click(screen.getByTestId("submit"));
});
