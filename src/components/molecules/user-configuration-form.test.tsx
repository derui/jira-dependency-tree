// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UserConfigurationForm } from "./user-configuration-form";

test.afterEach(cleanup);

test.serial("should be able to render", (t) => {
  render(<UserConfigurationForm onEndEdit={() => {}} />);

  const userDomain = screen.getByPlaceholderText("e.g. your-domain") as HTMLInputElement;
  const email = screen.getByPlaceholderText("e.g. your@example.com") as HTMLInputElement;
  const token = screen.getByPlaceholderText("required") as HTMLInputElement;

  t.is(userDomain.value, "");
  t.is(email.value, "");
  t.is(token.value, "");
});

test.serial("set initial payload as initial value", (t) => {
  render(
    <UserConfigurationForm
      initialPayload={{ email: "email", token: "token", userDomain: "userdomain" }}
      onEndEdit={() => {}}
    />,
  );

  const userDomain = screen.getByPlaceholderText("e.g. your-domain") as HTMLInputElement;
  const email = screen.getByPlaceholderText("e.g. your@example.com") as HTMLInputElement;
  const token = screen.getByPlaceholderText("required") as HTMLInputElement;

  t.is(userDomain.value, "userdomain");
  t.is(email.value, "email");
  t.is(token.value, "token");
});

test.serial("get payload when typed", async (t) => {
  t.plan(3);
  render(
    <UserConfigurationForm
      onEndEdit={(obj) => {
        t.is(obj?.email, "email");
        t.is(obj?.token, "token");
        t.is(obj?.userDomain, "userDomain");
      }}
    />,
  );

  const userDomain = screen.getByPlaceholderText("e.g. your-domain") as HTMLInputElement;
  const email = screen.getByPlaceholderText("e.g. your@example.com") as HTMLInputElement;
  const token = screen.getByPlaceholderText("required") as HTMLInputElement;

  await userEvent.type(userDomain, "userDomain");
  await userEvent.type(email, "email");
  await userEvent.type(token, "token");

  await userEvent.click(screen.getByTestId("submit/button"));
});

test.serial("do not send payload if canceled", async (t) => {
  t.plan(1);
  render(
    <UserConfigurationForm
      onEndEdit={(obj) => {
        t.is(obj, undefined);
      }}
    />,
  );

  const userDomain = screen.getByPlaceholderText("e.g. your-domain") as HTMLInputElement;
  const email = screen.getByPlaceholderText("e.g. your@example.com") as HTMLInputElement;
  const token = screen.getByPlaceholderText("required") as HTMLInputElement;

  await userEvent.type(userDomain, "userDomain");
  await userEvent.type(email, "email");
  await userEvent.type(token, "token");

  await userEvent.click(screen.getByTestId("cancel/button"));
});
