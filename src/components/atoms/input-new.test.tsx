// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InputNew } from "./input-new";

test.afterEach(cleanup);

test.serial("should be able to render", (t) => {
  render(<InputNew value="" />);

  const element = screen.getByTestId<HTMLInputElement>("input");

  t.is(element.value, "");
  t.is(screen.queryByTestId("label"), null);
});

test.serial("render label if specified", (t) => {
  render(<InputNew value="" label="A label" />);

  const element = screen.getByTestId<HTMLInputElement>("input");

  t.is(element.value, "");
  t.truthy(screen.queryByText("A label"));
});

test.serial("default value", (t) => {
  render(<InputNew value="default" placeholder="some" />);

  const element = screen.getByTestId<HTMLInputElement>("input");

  t.is(element.value, "default");
  t.is(element.placeholder, "some");
});

test.serial("change input values", async (t) => {
  t.plan(2);

  render(
    <InputNew
      value=""
      onInput={(v) => {
        t.is(v, "changed");
      }}
    />,
  );

  const element = screen.getByTestId<HTMLInputElement>("input");

  fireEvent.input(element, { target: { value: "changed" } });

  t.is(element.value, "changed");
});

test.serial("get key of key up", async (t) => {
  t.plan(1);

  render(
    <InputNew
      value=""
      onKeypress={(key) => {
        t.is(key, "Enter");
      }}
    />,
  );

  const element = screen.getByTestId<HTMLInputElement>("input");

  await userEvent.type(element, "{Enter}");
});
