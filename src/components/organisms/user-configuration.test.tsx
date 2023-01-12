// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { UserConfiguration } from "./user-configuration";
import { createPureStore } from "@/state/store";
import { submitApiCredentialFulfilled } from "@/state/actions";

test.afterEach(cleanup);

test.serial("should be able to render", (t) => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <UserConfiguration />
    </Provider>,
  );

  const marker = screen.getByTestId("marker");

  t.true(marker.classList.contains("visible"), "marker");
});

test.serial("initial payload is empty", (t) => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <UserConfiguration />
    </Provider>,
    {
      wrapper(props) {
        return (
          <>
            {props.children}
            <div id='modal-root' />
          </>
        );
      },
    },
  );

  const userDomain = screen.getByTestId("form/user-domain/input") as HTMLInputElement;
  const email = screen.getByTestId("form/email/input") as HTMLInputElement;
  const token = screen.getByTestId("form/token/input") as HTMLInputElement;

  t.is(userDomain.value, "");
  t.is(email.value, "");
  t.is(token.value, "");
});

test.serial("initial payload inputted", (t) => {
  const store = createPureStore();
  store.dispatch(
    submitApiCredentialFulfilled({
      apiBaseUrl: "url",
      apiKey: "key",
      email: "email",
      token: "token",
      userDomain: "domain",
    }),
  );

  render(
    <Provider store={store}>
      <UserConfiguration />
    </Provider>,
    {
      wrapper(props) {
        return (
          <>
            {props.children}
            <div id='modal-root' />
          </>
        );
      },
    },
  );

  const userDomain = screen.getByTestId("form/user-domain/input") as HTMLInputElement;
  const email = screen.getByTestId("form/email/input") as HTMLInputElement;
  const token = screen.getByTestId("form/token/input") as HTMLInputElement;

  t.is(userDomain.value, "domain");
  t.is(email.value, "email");
  t.is(token.value, "token");
});

test.serial("open dialog when opener clicked", async (t) => {
  const store = createPureStore();

  render(
    <Provider store={store}>
      <UserConfiguration />
    </Provider>,
    {
      wrapper(props) {
        return (
          <>
            {props.children}
            <div id='modal-root' />
          </>
        );
      },
    },
  );

  const opener = screen.getByTestId("opener");
  await userEvent.click(opener);

  const dialog = screen.getByTestId("container/dialog");

  t.is(dialog.getAttribute("aria-hidden"), "false");
});

test.serial("hide dialog when submitted", async (t) => {
  t.plan(1);
  const store = createPureStore();

  render(
    <Provider store={store}>
      <UserConfiguration />
    </Provider>,
    {
      wrapper(props) {
        return (
          <>
            {props.children}
            <div id='modal-root' />
          </>
        );
      },
    },
  );

  const opener = screen.getByTestId("opener");
  await userEvent.click(opener);

  const userDomain = screen.getByTestId("form/user-domain/input") as HTMLInputElement;
  const email = screen.getByTestId("form/email/input") as HTMLInputElement;
  const token = screen.getByTestId("form/token/input") as HTMLInputElement;
  await userEvent.type(userDomain, "domain");
  await userEvent.type(email, "email");
  await userEvent.type(token, "token");

  await userEvent.click(screen.getByTestId("form/submit/button"));

  const dialog = screen.getByTestId("container/dialog");

  t.is(dialog.getAttribute("aria-hidden"), "true");
});

test.serial("hide dialog when canceled on form", async (t) => {
  t.plan(1);
  const store = createPureStore();

  render(
    <Provider store={store}>
      <UserConfiguration />
    </Provider>,
    {
      wrapper(props) {
        return (
          <>
            {props.children}
            <div id='modal-root' />
          </>
        );
      },
    },
  );
  const opener = screen.getByTestId("opener");
  await userEvent.click(opener);

  await userEvent.click(screen.getByTestId("form/cancel/button"));

  const dialog = screen.getByTestId("container/dialog");

  t.is(dialog.getAttribute("aria-hidden"), "true");
});
