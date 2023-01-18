import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UserConfigurationForm } from "./user-configuration-form";

afterEach(cleanup);

test("should be able to render", () => {
  render(<UserConfigurationForm onEndEdit={() => {}} />);

  const userDomain = screen.getByPlaceholderText("e.g. your-domain") as HTMLInputElement;
  const email = screen.getByPlaceholderText("e.g. your@example.com") as HTMLInputElement;
  const token = screen.getByPlaceholderText("required") as HTMLInputElement;

  expect(userDomain.value).toBe("");
  expect(email.value).toBe("");
  expect(token.value).toBe("");
});

test("set initial payload as initial value", () => {
  render(
    <UserConfigurationForm
      initialPayload={{ email: "email", token: "token", userDomain: "userdomain" }}
      onEndEdit={() => {}}
    />,
  );

  const userDomain = screen.getByPlaceholderText("e.g. your-domain") as HTMLInputElement;
  const email = screen.getByPlaceholderText("e.g. your@example.com") as HTMLInputElement;
  const token = screen.getByPlaceholderText("required") as HTMLInputElement;

  expect(userDomain.value).toBe("userdomain");
  expect(email.value).toBe("email");
  expect(token.value).toBe("token");
});

test("get payload when typed", async () => {
  expect.assertions(3);

  render(
    <UserConfigurationForm
      onEndEdit={(obj) => {
        expect(obj?.email).toBe("email");
        expect(obj?.token).toBe("token");
        expect(obj?.userDomain).toBe("userDomain");
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

test("do not send payload if canceled", async () => {
  expect.assertions(1);

  render(
    <UserConfigurationForm
      onEndEdit={(obj) => {
        expect(obj).toBeUndefined();
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
