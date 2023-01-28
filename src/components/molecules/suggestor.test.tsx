import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { Suggestor } from "./suggestor";
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

test("do not display suggestion on init", () => {
  renderWrapper(<Suggestor suggestions={[]} focusOnInit={false} />);

  const root = screen.getByTestId("root/dialog");
  const empty = screen.queryByTestId("empty");

  expect(root.getAttribute("aria-hidden")).toBe("true");
  expect(empty).not.toBeNull();
});

test("display list when term is inputted", async () => {
  renderWrapper(<Suggestor focusOnInit={false} suggestions={[{ displayName: "test", value: "value", id: "value" }]} />);

  await userEvent.type(screen.getByTestId("term"), "t");

  const root = screen.queryByTestId("root/dialog");
  const suggestions = screen.getAllByTestId("suggestion").map((v) => v.textContent);

  expect(root?.getAttribute("aria-hidden")).toBe("false");
  expect(suggestions).toHaveLength(1);
  expect(suggestions[0]).toContain("test");
});

test("filter suggestions by term", async () => {
  const suggestions: SuggestedItem[] = [
    { displayName: "foo", value: "value", id: "1" },
    { displayName: "bar", value: "value", id: "2" },
    { displayName: "foobar", value: "value", id: "3" },
  ];

  renderWrapper(<Suggestor focusOnInit={false} suggestions={suggestions} />);

  await userEvent.type(screen.getByTestId("term"), "fo");

  const suggestion = screen.getAllByTestId("suggestion").map((v) => v.dataset.id);

  expect(suggestion).toHaveLength(2);
  expect(suggestion).includes("1").include("3");
});

test("get term when no selection", async () => {
  expect.assertions(1);

  const suggestions: SuggestedItem[] = [
    { displayName: "display", value: "value", id: "value" },
    { displayName: "display2", value: "value2", id: "value2" },
  ];

  renderWrapper(<Suggestor focusOnInit={false} suggestions={suggestions} onConfirmed={(v) => expect(v).toBe("tes")} />);

  await userEvent.type(screen.getByTestId("term"), "tes{enter}");
});

test("get value of suggestion which is clicked", async () => {
  expect.assertions(1);

  const suggestions: SuggestedItem[] = [
    { displayName: "bar", value: "clicked", id: "value" },
    { displayName: "foo", value: "failed", id: "value2" },
  ];

  renderWrapper(
    <Suggestor focusOnInit={false} suggestions={suggestions} onConfirmed={(v) => expect(v).toBe("clicked")} />,
  );

  await userEvent.type(screen.getByTestId("term"), "b");
  await userEvent.click(screen.getByTestId("suggestion"));
});

test("focus first item when key down pressed", async () => {
  expect.assertions(2);

  const suggestions: SuggestedItem[] = [
    { displayName: "bar", value: "clicked", id: "value" },
    { displayName: "bar2", value: "failed", id: "value2" },
  ];

  renderWrapper(<Suggestor focusOnInit={false} suggestions={suggestions} />);

  await userEvent.type(screen.getByTestId("term"), "b{ArrowDown}");

  const suggestion = screen.getAllByTestId("suggestion");

  expect(suggestion.map((v) => v.textContent)).toEqual(["bar", "bar2"]);
  expect(suggestion.map((v) => v.dataset.selected)).toEqual(["true", "false"]);
});

test("focus last item when key up pressed", async () => {
  expect.assertions(2);

  const suggestions: SuggestedItem[] = [
    { displayName: "bar", value: "1", id: "value" },
    { displayName: "bar2", value: "2", id: "value2" },
    { displayName: "bar3", value: "3", id: "value3" },
  ];

  renderWrapper(<Suggestor focusOnInit={false} suggestions={suggestions} />);

  await userEvent.type(screen.getByTestId("term"), "b{ArrowUp}");

  const suggestion = screen.getAllByTestId("suggestion");

  expect(suggestion.map((v) => v.textContent)).toEqual(["bar", "bar2", "bar3"]);
  expect(suggestion.map((v) => v.dataset.selected)).toEqual(["false", "false", "true"]);
});

test("keep last position typing arrow down a lot", async () => {
  const suggestions: SuggestedItem[] = [
    { displayName: "bar", value: "1", id: "value" },
    { displayName: "bar2", value: "2", id: "value2" },
  ];

  renderWrapper(<Suggestor focusOnInit={false} suggestions={suggestions} />);

  await userEvent.type(screen.getByTestId("term"), "b{ArrowDown}{ArrowDown}{ArrowDown}");

  const suggestion = screen.getAllByTestId("suggestion");

  expect(suggestion.map((v) => v.dataset.selected)).toEqual(["false", "true"]);
});

test("keep last position typing arrow up a lot", async () => {
  const suggestions: SuggestedItem[] = [
    { displayName: "bar", value: "1", id: "value" },
    { displayName: "bar2", value: "2", id: "value2" },
  ];

  renderWrapper(<Suggestor focusOnInit={false} suggestions={suggestions} />);

  await userEvent.type(screen.getByTestId("term"), "b{ArrowUp}{ArrowUp}{ArrowUp}");

  const suggestion = screen.getAllByTestId("suggestion");

  expect(suggestion.map((v) => v.dataset.selected)).toEqual(["true", "false"]);
});

test("do not keep select if selected suggestion filtered after typing", async () => {
  const suggestions: SuggestedItem[] = [
    { displayName: "foobar", value: "1", id: "value" },
    { displayName: "foo", value: "2", id: "value2" },
  ];

  renderWrapper(<Suggestor focusOnInit={false} suggestions={suggestions} />);

  await userEvent.type(screen.getByTestId("term"), "foo{ArrowUp}bar");

  const suggestion = screen.getAllByTestId("suggestion");

  expect(suggestion.map((v) => v.dataset.selected)).toEqual(["false"]);
});

test("keep selection after term changed", async () => {
  const suggestions: SuggestedItem[] = [
    { displayName: "foobar", value: "1", id: "value" },
    { displayName: "foo", value: "2", id: "value2" },
  ];

  renderWrapper(<Suggestor focusOnInit={false} suggestions={suggestions} />);

  await userEvent.type(screen.getByTestId("term"), "foob{ArrowUp}{Backspace}");

  const suggestion = screen.getAllByTestId("suggestion");

  expect(suggestion.map((v) => v.dataset.selected)).toEqual(["true", "false"]);
});

test("get value of selected suggestion", async () => {
  expect.assertions(1);

  const suggestions: SuggestedItem[] = [
    { displayName: "bar", value: "1", id: "value" },
    { displayName: "bar2", value: "2", id: "value2" },
    { displayName: "bar3", value: "3", id: "value3" },
  ];

  renderWrapper(<Suggestor focusOnInit={false} suggestions={suggestions} onConfirmed={(v) => expect(v).toBe("1")} />);

  await userEvent.type(screen.getByTestId("term"), "b{ArrowDown}{Enter}");
});

test("call suggestion callback when can not get any suggestion from given suggestions", async () => {
  expect.assertions(1);

  const suggestions: SuggestedItem[] = [
    { displayName: "foobar", value: "1", id: "value" },
    { displayName: "foo", value: "2", id: "value2" },
  ];

  renderWrapper(
    <Suggestor focusOnInit={false} suggestions={suggestions} onEmptySuggestion={(v) => expect(v).toBe("foog")} />,
  );

  await userEvent.type(screen.getByTestId("term"), "foog");
});
