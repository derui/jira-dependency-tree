// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ButtonNew } from "./button-new";

test.afterEach(() => {
  cleanup();
});

test.serial("should be able to render", (t) => {
  render(<ButtonNew schema="primary" onClick={() => {}} />);

  const element = screen.getByTestId<HTMLButtonElement>("button");

  t.is(element.disabled, false);
  t.is(element.type, "button");
});

test.serial("render submit button", (t) => {
  render(<ButtonNew schema="primary" type="submit" onClick={() => {}} />);

  const element = screen.getByTestId<HTMLButtonElement>("button");

  t.is(element.disabled, false);
  t.is(element.type, "submit");
});

test.serial("should emit click event", async (t) => {
  t.plan(1);

  render(
    <ButtonNew
      schema="primary"
      onClick={() => {
        t.pass("called");
      }}
    />,
  );

  await userEvent.click(screen.getByTestId("button"));
});

test.serial("change color schema", (t) => {
  render(<ButtonNew schema="secondary1" type="submit" onClick={() => {}} />);

  const element = screen.getByTestId<HTMLButtonElement>("button");

  t.true(Array.from(element.classList.values()).some((v) => v.includes("secondary1-")));
});

test.serial("change disabled", (t) => {
  render(<ButtonNew schema="primary" disabled onClick={() => {}} />);

  const element = screen.getByTestId<HTMLButtonElement>("button");

  t.true(element.disabled);
});
