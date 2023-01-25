import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SuggestionList } from "./suggestion-list";
import type { SuggestedItem } from "@/model/suggestion";

afterEach(cleanup);

const renderWrapper = (v: React.ReactElement) =>
  render(v, {
    wrapper(props) {
      return (
        <>
          {props.children}
          <div id='dialog-root' />
        </>
      );
    },
  });

test("should be able to render", () => {
  const element = document.createElement("div");

  renderWrapper(<SuggestionList opened={true} suggestionIdSelected='' suggestions={[]} parentElement={element} />);

  const root = screen.getByTestId("root/dialog");
  const empty = screen.queryByTestId("empty");

  expect(root.getAttribute("aria-hidden")).toBe("false");
  expect(empty).toBeTruthy();
});

test("do not render when did not pass parent", () => {
  renderWrapper(<SuggestionList opened={true} suggestionIdSelected='' suggestions={[]} />);

  const root = screen.queryByTestId("root/dialog");

  expect(root).toBeFalsy();
});

test("mark selected suggestion", () => {
  const element = document.createElement("div");

  const suggestions: SuggestedItem[] = [{ displayName: "display", value: "value", id: "value" }];
  renderWrapper(
    <SuggestionList opened={true} suggestionIdSelected='value' suggestions={suggestions} parentElement={element} />,
  );

  const suggestion = screen.getByTestId("suggestion");

  expect(suggestion.classList.contains("border-l-secondary1-300")).toBe(true);
});

test("return id when clicked", async () => {
  expect.assertions(1);

  const element = document.createElement("div");

  const suggestions: SuggestedItem[] = [
    { displayName: "display", value: "value", id: "value" },
    { displayName: "display2", value: "value2", id: "value2" },
  ];

  renderWrapper(
    <SuggestionList
      opened={true}
      suggestionIdSelected='value'
      suggestions={suggestions}
      parentElement={element}
      onSelect={(id) => {
        expect(id).toBe("value2");
      }}
    />,
  );

  const suggestion = screen.getByText("display2");

  await userEvent.click(suggestion);
});
