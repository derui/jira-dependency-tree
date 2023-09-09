import { test, expect } from "vitest";
import { mergeSuggestion, suggestionFactory } from "@/models/suggestion";

test("empty sprints", () => {
  // arrange

  // do
  const suggestion = suggestionFactory({});

  // verify
  expect(suggestion).toEqual({});
});

test("use given sprint with id", () => {
  // arrange
  const suggestions = [
    { value: "foo", displayName: "bar" },
    { value: "value", displayName: "display" },
  ];

  // do
  const suggestion = suggestionFactory({ suggestions: suggestions });

  // verify
  expect(suggestion).toEqual({
    foo: { id: "foo", value: "foo", displayName: "bar" },
    value: { id: "value", value: "value", displayName: "display" },
  });
});

test("merge two suggestion", () => {
  // arrange
  const suggestion1 = suggestionFactory({ suggestions: [{ value: "foo", displayName: "bar" }] });
  const suggestion2 = suggestionFactory({ suggestions: [{ value: "value", displayName: "display" }] });

  // do
  const suggestions = mergeSuggestion(suggestion1, suggestion2);

  // verify
  expect(suggestions).toEqual({
    foo: { id: "foo", value: "foo", displayName: "bar" },
    value: { id: "value", value: "value", displayName: "display" },
  });
});
