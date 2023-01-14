import test from "ava";
import { mergeSuggestion, suggestionFactory } from "@/model/suggestion";

test("empty sprints", (t) => {
  // arrange

  // do
  const setting = suggestionFactory({});

  // verify
  t.deepEqual(setting.sprints, {});
});

test("use given sprint with id", (t) => {
  // arrange
  const sprints = [
    { value: "foo", displayName: "bar" },
    { value: "value", displayName: "display" },
  ];

  // do
  const setting = suggestionFactory({ sprints });

  // verify
  t.deepEqual(setting.sprints, {
    foo: { id: "foo", value: "foo", displayName: "bar" },
    value: { id: "value", value: "value", displayName: "display" },
  });
});

test("merge two suggestion", (t) => {
  // arrange
  const suggestion1 = suggestionFactory({ sprints: [{ value: "foo", displayName: "bar" }] });
  const suggestion2 = suggestionFactory({ sprints: [{ value: "value", displayName: "display" }] });

  // do
  const suggestions = mergeSuggestion(suggestion1, suggestion2);

  // verify
  t.deepEqual(suggestions.sprints, {
    foo: { id: "foo", value: "foo", displayName: "bar" },
    value: { id: "value", value: "value", displayName: "display" },
  });
});
