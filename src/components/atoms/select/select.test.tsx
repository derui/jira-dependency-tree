import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Select } from "./select";

afterEach(cleanup);

test("should be able to render", () => {
  render(<Select options={[]} />);

  expect(screen.getByTestId("option-list-container/root").className).toContain("hidden");
});

test("show no option message when focus", async () => {
  const user = userEvent.setup();
  render(<Select options={[]} />);

  await user.click(screen.getByTestId("completions/input"));

  expect(screen.getByTestId("option-list-container/root").className).not.toContain("hidden");
  expect(screen.getByTestId("option-list-container/root").textContent).toContain("No Options");
});

test("show label when focus", async () => {
  const user = userEvent.setup();
  render(
    <Select
      options={[
        { label: "label", value: 1 },
        { label: "new", value: 2 },
      ]}
    />,
  );

  await user.click(screen.getByTestId("completions/input"));

  expect(screen.getByTestId("option-list-container/root").className).not.toContain("hidden");
  expect(screen.queryByText("label")).not.toBeNull();
  expect(screen.queryByText("new")).not.toBeNull();
});

test("select option", async () => {
  const user = userEvent.setup();
  render(
    <Select
      options={[
        { label: "label", value: 1 },
        { label: "new", value: 2 },
      ]}
    />,
  );

  await user.click(screen.getByTestId("completions/input"));
  await user.click(screen.getByText("label"));

  expect(screen.getByTestId("completions/display").textContent).toEqual("label");
});

test("close menu before select", async () => {
  const user = userEvent.setup();
  render(
    <>
      <div data-testid="other" />
      <Select
        options={[
          { label: "label", value: 1 },
          { label: "new", value: 2 },
        ]}
      />
    </>,
  );

  await user.click(screen.getByTestId("completions/input"));
  await user.click(screen.getByTestId("other"));

  expect(screen.getByTestId("option-list-container/root").className).toContain("hidden");
});

test("auto focus input when opened", async () => {
  const user = userEvent.setup();
  render(
    <Select
      options={[
        { label: "label", value: 1 },
        { label: "new", value: 2 },
      ]}
    />,
  );

  await user.click(screen.getByTestId("select-root"));

  const el = screen.getByTestId<HTMLInputElement>("completions/input");
  expect(el.matches(":focus")).toEqual(true);
});
