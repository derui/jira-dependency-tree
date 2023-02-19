import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "./button";

afterEach(() => {
  cleanup();
});

test("should be able to render", () => {
  render(<Button schema="primary" onClick={() => {}} />);

  const element = screen.getByTestId<HTMLButtonElement>("button");

  expect(element.getAttribute("aria-disabled")).toBe("false");
  expect(element.type).toBe("button");
});

test("render submit button", () => {
  render(<Button schema="primary" type="submit" onClick={() => {}} />);

  const element = screen.getByTestId<HTMLButtonElement>("button");

  expect(element.getAttribute("aria-disabled")).toBe("false");
  expect(element.type).toBe("submit");
});

test("should emit click event", async () => {
  expect.assertions(1);

  render(
    <Button
      schema="primary"
      onClick={() => {
        expect(true).toBeTruthy();
      }}
    />,
  );

  await userEvent.click(screen.getByTestId("button"));
});

test("change color schema", () => {
  render(<Button schema="primary" type="submit" onClick={() => {}} />);

  const element = screen.getByTestId<HTMLButtonElement>("button");

  expect(Array.from(element.classList.values()).some((v) => v.includes("secondary1-"))).toBeTruthy();
});

test("change disabled", () => {
  render(<Button schema="primary" disabled onClick={() => {}} />);

  const element = screen.getByTestId<HTMLButtonElement>("button");

  expect(element.getAttribute("aria-disabled")).toBeTruthy();
});

test("use given testid directly", () => {
  render(<Button schema="primary" testid="foo" />);

  const element = screen.queryByTestId<HTMLButtonElement>("foo");

  expect(element).not.toBeNull();
});
