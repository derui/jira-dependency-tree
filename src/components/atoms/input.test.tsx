import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Input } from "./input";

afterEach(cleanup);

test("should be able to render", () => {
  render(<Input value="" />);

  const element = screen.getByTestId<HTMLInputElement>("input");

  expect(element.value).toBe("");
  expect(screen.queryByTestId("label")).toBe(null);
});

test("render label if specified", () => {
  render(<Input value="" label="A label" />);

  const element = screen.getByTestId<HTMLInputElement>("input");

  expect(element.value).toBe("");
  expect(screen.queryByText("A label")).not.toBeNull();
});

test("default value", () => {
  render(<Input value="default" placeholder="some" />);

  const element = screen.getByTestId<HTMLInputElement>("input");

  expect(element.value).toBe("default");
  expect(element.placeholder).toBe("some");
});

test("change input values", async () => {
  expect.assertions(2);

  render(
    <Input
      value=""
      onInput={(v) => {
        expect(v).toBe("changed");
      }}
    />,
  );

  const element = screen.getByTestId<HTMLInputElement>("input");

  fireEvent.input(element, { target: { value: "changed" } });

  expect(element.value).toBe("changed");
});

test("get key of key up", async () => {
  expect.assertions(1);

  render(
    <Input
      value=""
      onKeypress={(key) => {
        expect(key).toBe("Enter");
      }}
    />,
  );

  const element = screen.getByTestId<HTMLInputElement>("input");

  await userEvent.type(element, "{Enter}");
});

test("use testid directly", async () => {
  render(<Input value="" testid="foo" label="label" />);

  const element = screen.queryByTestId<HTMLInputElement>("foo");
  const label = screen.queryByTestId("foo/label");

  expect(element).not.toBeNull();
  expect(label).not.toBeNull();
});
