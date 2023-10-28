import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sinon from "sinon";
import { Checkbox } from "./checkbox";

afterEach(() => {
  cleanup();
});

test("should be able to render", () => {
  render(<Checkbox />);

  const element = screen.getByRole("checkbox");

  expect(element.getAttribute("aria-disabled")).toBe("false");
  expect(element.getAttribute("aria-checked")).toBe("false");
});

test("disable checkbox", () => {
  render(<Checkbox disabled />);

  const element = screen.getByRole("checkbox");

  expect(element.getAttribute("aria-disabled")).toBe("true");
  expect(element.getAttribute("aria-checked")).toBe("false");
});

test("checked checkbox", () => {
  render(<Checkbox checked />);

  const element = screen.getByRole("checkbox");

  expect(element.getAttribute("aria-disabled")).toBe("false");
  expect(element.getAttribute("aria-checked")).toBe("true");
});

test("toggle checkbox", async () => {
  const user = userEvent.setup();
  const spy = Sinon.fake();

  render(<Checkbox onChange={spy} />);

  const element = screen.getByRole("checkbox");

  await user.click(element);

  expect(spy.calledWith(true)).toBe(true);
});

test("toggle checkbox with checked", async () => {
  const user = userEvent.setup();
  const spy = Sinon.fake();

  render(<Checkbox onChange={spy} checked />);

  const element = screen.getByRole("checkbox");

  await user.click(element);

  expect(spy.calledWith(false)).toBe(true);
});
