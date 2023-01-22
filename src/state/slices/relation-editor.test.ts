import { test, expect } from "vitest";
import {
  addRelationAccepted,
  addRelationSucceeded,
  deselectIssueInGraph,
  removeRelation,
  removeRelationSucceeded,
  selectIssueInGraph,
  synchronizeIssuesFulfilled,
} from "../actions";
import { getInitialState, reducer } from "./relation-editor";
import { Loading } from "@/type";
import { randomIssue } from "@/mock-data";

test("initial state", () => {
  expect(getInitialState()).toEqual({ loading: Loading.Completed, draft: {}, relations: {}, opened: false });
});

test("fulfill relations", () => {
  const state = reducer(
    getInitialState(),
    synchronizeIssuesFulfilled([
      randomIssue({ key: "a", relations: [{ id: "id", externalId: "id", inwardIssue: "b", outwardIssue: "a" }] }),
      randomIssue({ key: "b", relations: [{ id: "id", externalId: "id", inwardIssue: "b", outwardIssue: "a" }] }),
    ]),
  );

  expect(state.loading).toEqual(Loading.Completed);
  expect(state.draft).toEqual({});
  expect(state.relations).toEqual({
    a: { id: { id: "id", externalId: "id", inwardIssue: "b", outwardIssue: "a" } },
    b: { id: { id: "id", externalId: "id", inwardIssue: "b", outwardIssue: "a" } },
  });
});

test("add relation to draft", () => {
  let state = reducer(
    getInitialState(),
    synchronizeIssuesFulfilled([randomIssue({ key: "a", relations: [] }), randomIssue({ key: "b", relations: [] })]),
  );
  state = reducer(state, addRelationAccepted({ fromKey: "a", toKey: "b", relationId: "id" }));

  expect(state.draft).toEqual({
    a: { id: Loading.Loading },
    b: { id: Loading.Loading },
  });
});

test("add relation after succeeded", () => {
  const relation = { id: "id", externalId: "foo", inwardIssue: "a", outwardIssue: "b" };
  let state = reducer(
    getInitialState(),
    synchronizeIssuesFulfilled([randomIssue({ key: "a", relations: [] }), randomIssue({ key: "b", relations: [] })]),
  );
  state = reducer(state, addRelationAccepted({ fromKey: "a", toKey: "b", relationId: "id" }));
  state = reducer(state, addRelationSucceeded(relation));

  expect(state.draft).toEqual({
    a: {},
    b: {},
  });
  expect(state.relations).toEqual({
    a: { id: relation },
    b: { id: relation },
  });
});

test("remove relation to draft", () => {
  const relationAtoB = { id: "id", externalId: "id", inwardIssue: "a", outwardIssue: "b" };
  const relationAtoC = { id: "id2", externalId: "id2", inwardIssue: "a", outwardIssue: "c" };
  let state = reducer(
    getInitialState(),
    synchronizeIssuesFulfilled([
      randomIssue({ key: "a", relations: [relationAtoB, relationAtoC] }),
      randomIssue({ key: "b", relations: [relationAtoB] }),
      randomIssue({ key: "c", relations: [relationAtoC] }),
    ]),
  );
  state = reducer(state, removeRelation({ fromKey: "a", toKey: "b" }));

  expect(state.draft).toEqual({
    a: { id: Loading.Loading },
    b: { id: Loading.Loading },
  });
  expect(state.relations).toEqual({
    a: { id: relationAtoB, id2: relationAtoC },
    b: { id: relationAtoB },
    c: { id2: relationAtoC },
  });
});

test("remove relation after succeeded", () => {
  const relationAtoB = { id: "id", externalId: "id", inwardIssue: "a", outwardIssue: "b" };
  const relationAtoC = { id: "id2", externalId: "id2", inwardIssue: "a", outwardIssue: "c" };
  let state = reducer(
    getInitialState(),
    synchronizeIssuesFulfilled([
      randomIssue({ key: "a", relations: [relationAtoB, relationAtoC] }),
      randomIssue({ key: "b", relations: [relationAtoB] }),
      randomIssue({ key: "c", relations: [relationAtoC] }),
    ]),
  );
  state = reducer(state, removeRelation({ fromKey: "a", toKey: "b" }));
  state = reducer(state, removeRelationSucceeded({ relationId: relationAtoB.id }));

  expect(state.draft).toEqual({
    a: {},
    b: {},
  });
  expect(state.relations).toEqual({
    a: { id2: relationAtoC },
    b: {},
    c: { id2: relationAtoC },
  });
});
test("select and deselect", () => {
  let state = reducer(getInitialState(), selectIssueInGraph("key"));

  expect(state.selectedIssueKey).toBe("key");
  expect(state.opened).toBe(true);

  state = reducer(state, deselectIssueInGraph());

  expect(state.selectedIssueKey).toBeUndefined();
  expect(state.opened).toBe(false);
});
