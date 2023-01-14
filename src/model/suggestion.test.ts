import test from "ava";
import { mergeSuggestion, suggestionFactory } from "@/model/suggestion";

test("empty sprints", (t) => {
  // arrange

  // do
  const suggestion = suggestionFactory({});

  // verify
  t.deepEqual(suggestion, {});
});

test("use given sprint with id", (t) => {
  // arrange
  const suggestions = [
    { value: "foo", displayName: "bar" },
    { value: "value", displayName: "display" },
  ];

  // do
  const suggestion = suggestionFactory({ suggestions: suggestions });

  // verify
  t.deepEqual(suggestion, {
    foo: { id: "foo", value: "foo", displayName: "bar" },
    value: { id: "value", value: "value", displayName: "display" },
  });
});

test("merge two suggestion", (t) => {
  // arrange
  const suggestion1 = suggestionFactory({ suggestions: [{ value: "foo", displayName: "bar" }] });
  const suggestion2 = suggestionFactory({ suggestions: [{ value: "value", displayName: "display" }] });

  // do
  const suggestions = mergeSuggestion(suggestion1, suggestion2);

  // verify
  t.deepEqual(suggestions, {
    foo: { id: "foo", value: "foo", displayName: "bar" },
    value: { id: "value", value: "value", displayName: "display" },
  });
});
