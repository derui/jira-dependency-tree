import { test, expect, afterEach, vi, Mock } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Provider } from "react-redux";
import { SyncIssueButton } from "./sync-issue-button";
import { createPureStore } from "@/state/store";
import { submitApiCredentialFulfilled } from "@/state/actions";
import { randomCredential } from "@/mock-data";
import { Apis } from "@/apis/api";

vi.mock("@/apis/api", () => {
  return {
    Apis: {
      getIssues: {
        call: vi.fn(),
      },
    },
  };
});

afterEach(cleanup);
afterEach(() => {
  vi.clearAllMocks();
});

test("initial state is disabled all", () => {
  render(
    <Provider store={createPureStore()}>
      <SyncIssueButton />
    </Provider>,
  );

  const button = screen.getByTestId("button") as HTMLBaseElement;

  expect(button.getAttribute("aria-disabled")).toBe("true");
});

test("do not disable if setup finished", () => {
  const store = createPureStore();
  store.dispatch(submitApiCredentialFulfilled(randomCredential()));

  render(
    <Provider store={store}>
      <SyncIssueButton />
    </Provider>,
  );

  const button = screen.getByTestId("button") as HTMLBaseElement;
  expect(button.getAttribute("aria-disabled")).toBe("false");
});

test("dispatch action when click action", async () => {
  vi.mocked(Apis.getIssues.call).mockResolvedValue([]);

  const user = userEvent.setup();
  const store = createPureStore();
  const cred = randomCredential();
  store.dispatch(submitApiCredentialFulfilled(cred));

  render(
    <Provider store={store}>
      <SyncIssueButton />
    </Provider>,
  );

  const button = screen.getByTestId("button") as HTMLBaseElement;

  await user.click(button);

  expect(Apis.getIssues.call as Mock).toBeCalledWith(cred, []);
});
