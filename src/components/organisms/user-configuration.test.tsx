import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { UserConfiguration } from "./user-configuration";
import { createStore } from "@/state/store";
import { submitApiCredentialFulfilled } from "@/state/actions";
import { createDependencyRegistrar } from "@/util/dependency-registrar";
import { Dependencies } from "@/dependencies";
import { RegistrarContext } from "@/registrar-context";

const registrar = createDependencyRegistrar<Dependencies>();
registrar.register("env", { apiKey: "key", apiBaseUrl: "url" });

afterEach(cleanup);

test("should be able to render", () => {
  const store = createStore();

  render(
    <RegistrarContext.Provider value={registrar}>
      <Provider store={store}>
        <UserConfiguration />
      </Provider>
    </RegistrarContext.Provider>,
  );

  const marker = screen.getByTestId("marker");

  expect(marker.classList.contains("visible"), "marker").toBeTruthy();
});

test("initial payload is empty", () => {
  const store = createStore();

  render(
    <RegistrarContext.Provider value={registrar}>
      <Provider store={store}>
        <UserConfiguration />
      </Provider>
    </RegistrarContext.Provider>,
    {
      wrapper(props) {
        return (
          <>
            {props.children}
            <div id="dialog-root" />
          </>
        );
      },
    },
  );

  const userDomain = screen.getByTestId("form/user-domain") as HTMLInputElement;
  const email = screen.getByTestId("form/email") as HTMLInputElement;
  const token = screen.getByTestId("form/token") as HTMLInputElement;

  expect(userDomain.value).toBe("");
  expect(email.value).toBe("");
  expect(token.value).toBe("");
});

test("initial payload inputted", () => {
  const store = createStore();
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
    <RegistrarContext.Provider value={registrar}>
      <Provider store={store}>
        <UserConfiguration />
      </Provider>
    </RegistrarContext.Provider>,
    {
      wrapper(props) {
        return (
          <>
            {props.children}
            <div id="dialog-root" />
          </>
        );
      },
    },
  );

  const userDomain = screen.getByTestId("form/user-domain") as HTMLInputElement;
  const email = screen.getByTestId("form/email") as HTMLInputElement;
  const token = screen.getByTestId("form/token") as HTMLInputElement;

  expect(userDomain.value).toBe("domain");
  expect(email.value).toBe("email");
  expect(token.value).toBe("token");
});

test("open dialog when opener clicked", async () => {
  const store = createStore();

  render(
    <RegistrarContext.Provider value={registrar}>
      <Provider store={store}>
        <UserConfiguration />
      </Provider>
    </RegistrarContext.Provider>,
    {
      wrapper(props) {
        return (
          <>
            {props.children}
            <div id="dialog-root" />
          </>
        );
      },
    },
  );

  const opener = screen.getByTestId("opener");
  await userEvent.click(opener);

  const dialog = screen.getByTestId("container/dialog");

  expect(dialog.getAttribute("aria-hidden")).toBe("false");
});

test("hide dialog when submitted", async () => {
  expect.assertions(1);
  const store = createStore();

  render(
    <RegistrarContext.Provider value={registrar}>
      <Provider store={store}>
        <UserConfiguration />
      </Provider>
    </RegistrarContext.Provider>,
    {
      wrapper(props) {
        return (
          <>
            {props.children}
            <div id="dialog-root" />
          </>
        );
      },
    },
  );

  const opener = screen.getByTestId("opener");
  await userEvent.click(opener);

  const userDomain = screen.getByTestId("form/user-domain") as HTMLInputElement;
  const email = screen.getByTestId("form/email") as HTMLInputElement;
  const token = screen.getByTestId("form/token") as HTMLInputElement;
  await userEvent.type(userDomain, "domain");
  await userEvent.type(email, "email");
  await userEvent.type(token, "token");

  await userEvent.click(screen.getByTestId("form/submit"));

  const dialog = screen.getByTestId("container/dialog");

  expect(dialog.getAttribute("aria-hidden")).toBe("true");
});

test("hide dialog when canceled on form", async () => {
  expect.assertions(1);
  const store = createStore();

  render(
    <RegistrarContext.Provider value={registrar}>
      <Provider store={store}>
        <UserConfiguration />
      </Provider>
    </RegistrarContext.Provider>,
    {
      wrapper(props) {
        return (
          <>
            {props.children}
            <div id="dialog-root" />
          </>
        );
      },
    },
  );
  const opener = screen.getByTestId("opener");
  await userEvent.click(opener);

  await userEvent.click(screen.getByTestId("form/cancel"));

  const dialog = screen.getByTestId("container/dialog");

  expect(dialog.getAttribute("aria-hidden")).toBe("true");
});
