// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import test from "ava";
import { render, screen, cleanup } from "@testing-library/react";
import { Suggestor } from "./suggestion-list";
import type { SuggestedItem } from "@/model/suggestion";

test.afterEach(cleanup);

const renderWrapper = (v: React.ReactElement) =>
  render(v, {
    wrapper(props) {
      return (
        <>
          {props.children}
          <div id='modal-root' />
        </>
      );
    },
  });

test.serial("should be able to render", (t) => {
  const element = document.createElement("div");

  renderWrapper(<Suggestor suggestionIdSelected='' suggestions={[]} parentElement={element} />);

  const root = screen.getByTestId("root/dialog");
  const empty = screen.queryByTestId("empty");

  t.is(root.getAttribute("aria-hidden"), "false");
  t.truthy(empty);
});

test.serial("do not render when did not pass parent", (t) => {
  renderWrapper(<Suggestor suggestionIdSelected='' suggestions={[]} />);

  const root = screen.queryByTestId("root/dialog");

  t.falsy(root);
});

test.serial("mark selected suggestion", (t) => {
  const element = document.createElement("div");

  const suggestions: SuggestedItem[] = [{ displayName: "display", value: "value", id: "value" }];
  renderWrapper(<Suggestor suggestionIdSelected='value' suggestions={suggestions} parentElement={element} />);

  const suggestion = screen.getByTestId("suggestion");

  t.is(suggestion.classList.contains("border-l-secondary1-300"), true);
});
