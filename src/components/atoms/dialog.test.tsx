import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Dialog } from "./dialog";
import { Rect } from "@/util/basic";

afterEach(cleanup);

test("should be able to render", () => {
  render(
    <Dialog selector='body' opened={false} aligned='bottomLeft'>
      abc
    </Dialog>,
  );

  const child = screen.queryByText("abc");

  expect(child).not.toBeNull();
});

test("opened", () => {
  render(
    <Dialog selector='body' opened={true} aligned='bottomLeft'>
      abc
    </Dialog>,
  );

  const child = screen.getByTestId("dialog");

  expect(child.classList.contains("w-96")).toBe(true);
  expect(child.getAttribute("aria-hidden")).toBe("false");
});

test("calculate top by rect", () => {
  const rect = new Rect({ bottom: 10, right: 10, left: 0, top: 5 });
  render(
    <Dialog selector='body' parentRect={rect} opened={true} aligned='bottomLeft'>
      abc
    </Dialog>,
  );

  const child = screen.getByTestId("dialog");

  expect(child.style.top).toBe("calc(10px)");
});
