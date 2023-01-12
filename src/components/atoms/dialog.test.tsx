// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup } from "@testing-library/react";
import { Dialog } from "./dialog";
import { Rect } from "@/util/basic";

test.afterEach(cleanup);

test.serial("should be able to render", (t) => {
  render(
    <Dialog selector='body' opened={false} aligned='bottomLeft'>
      abc
    </Dialog>,
  );

  const child = screen.queryByText("abc");

  t.not(child, null);
});

test.serial("opened", (t) => {
  render(
    <Dialog selector='body' opened={true} aligned='bottomLeft'>
      abc
    </Dialog>,
  );

  const child = screen.getByTestId("dialog");

  t.is(child.classList.contains("w-96"), true, "width");
  t.is(child.classList.contains("left-0"), true, "position");
});

test.serial("calculate top by rect", (t) => {
  const rect = new Rect({ bottom: 10, right: 10, left: 0, top: 5 });
  render(
    <Dialog selector='body' parentRect={rect} opened={true} aligned='bottomLeft'>
      abc
    </Dialog>,
  );

  const child = screen.getByTestId("dialog");

  t.is(child.style.top, "calc(10px)", "calc");
});
