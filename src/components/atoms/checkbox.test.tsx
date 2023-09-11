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

  const element = screen.getByTestId<HTMLInputElement>("checkbox");

  expect(element.getAttribute("aria-disabled")).toBe("false");
  expect(element.disabled).toBe(false);
  expect(element.checked).toBe(false);
});

test("disable checkbox", () => {
  render(<Checkbox disabled />);

  const element = screen.getByTestId<HTMLInputElement>("checkbox");

  expect(element.getAttribute("aria-disabled")).toBe("true");
  expect(element.disabled).toBe(true);
  expect(element.checked).toBe(false);
});
test("checked checkbox", () => {
  render(<Checkbox checked />);

  const element = screen.getByTestId<HTMLInputElement>("checkbox");

  expect(element.getAttribute("aria-disabled")).toBe("false");
  expect(element.disabled).toBe(false);
  expect(element.checked).toBe(true);
});
test("toggle checkbox", async () => {
  const user = userEvent.setup();
  const spy = Sinon.fake();

  render(<Checkbox onChange={spy} />);

  const element = screen.getByTestId("root");

  await user.click(element);

  expect(spy.calledWith(true)).toBe(true);
});

test("toggle checkbox with checked", async () => {
  const user = userEvent.setup();
  const spy = Sinon.fake();

  render(<Checkbox onChange={spy} checked />);

  const element = screen.getByTestId("root");

  await user.click(element);

  expect(spy.calledWith(false)).toBe(true);
});
