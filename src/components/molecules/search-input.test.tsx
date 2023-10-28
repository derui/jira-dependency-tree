import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sinon from "sinon";
import { SearchInput } from "./search-input";

afterEach(cleanup);

test("should be able to render", () => {
  render(<SearchInput loading />);

  const opener = screen.getByTestId<HTMLButtonElement>("opener");

  expect(opener.disabled).toBe(true);
});

test("should be clickable after setup finished", async () => {
  render(<SearchInput />);

  const opener = screen.getByRole<HTMLButtonElement>("button");

  expect(opener.disabled).toBe(false);
  expect(screen.getByTestId("input-wrapper").getAttribute("aria-hidden")).toBe("true");
});

test("open term input after opener clicked", async () => {
  render(<SearchInput />);

  await userEvent.click(screen.getByTestId("opener"));

  const term = screen.getByTestId("input-wrapper");

  expect(term.getAttribute("aria-hidden")).toBe("false");
});

test("open term input after opener clicked", async () => {
  const user = userEvent.setup();
  const mock = Sinon.fake();

  render(<SearchInput onSearch={mock} />);

  await user.click(screen.getByTestId("opener"));
  await user.type(screen.getByTestId("input"), "term");

  expect(mock.calledWith("term")).toBeTruthy();
});

test("reset after click cancel", async () => {
  const mock = Sinon.fake();
  render(<SearchInput onCancel={mock} />);

  await userEvent.click(screen.getByTestId("opener"));
  await userEvent.type(screen.getByTestId("input"), "TES");
  await userEvent.click(screen.getByTestId("cancel"));
  const term = screen.getByTestId("input") as HTMLInputElement;

  expect(term.value).toBe("");
  expect(mock.called).toBeTruthy();
});
