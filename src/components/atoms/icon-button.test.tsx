import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { IconButton } from "./icon-button";

afterEach(() => {
  cleanup();
});

test("should be able to render", () => {
  render(<IconButton color="primary" onClick={() => {}} />);

  const element = screen.getByTestId<HTMLButtonElement>("button");

  expect(element.disabled).toBe(false);
  expect(element.type).toBe("button");
});

test("render submit button", () => {
  render(<IconButton color="primary" type="submit" onClick={() => {}} />);

  const element = screen.getByTestId<HTMLButtonElement>("button");

  expect(element.disabled).toBe(false);
  expect(element.type).toBe("submit");
});

test("should emit click event", async () => {
  expect.assertions(1);

  render(
    <IconButton
      color="primary"
      onClick={() => {
        expect(true).toBeTruthy();
      }}
    />,
  );

  await userEvent.click(screen.getByTestId("button"));
});

test("change color schema", () => {
  render(<IconButton color="primary" type="submit" onClick={() => {}} />);

  const element = screen.getByTestId<HTMLButtonElement>("button");

  expect(Array.from(element.classList.values()).some((v) => v.includes("primary-"))).toBeTruthy();
});

test("change disabled", () => {
  render(<IconButton color="primary" disabled onClick={() => {}} />);

  const element = screen.getByTestId<HTMLButtonElement>("button");

  expect(element.disabled).toBe(true);
});

test("use given testid directly", () => {
  render(<IconButton color="primary" testid="foo" />);

  const element = screen.queryByTestId<HTMLButtonElement>("foo");

  expect(element).not.toBeNull();
});
