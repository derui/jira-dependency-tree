import { test, expect } from "vitest";
import { relations } from "../actions";
import { getInitialState, reducer } from "./relation-delta";
import { createAppending, createDeleting } from "@/model/relation-delta";

test("initial state", () => {
  expect(getInitialState()).toEqual({ appendingDelta: {}, deletingDelta: {} });
});

test("add appending delta", () => {
  // Arrange
  const delta = relations.appendDelta(createAppending("1", "2", "3"));
  const state = reducer(getInitialState(), delta);

  // Act

  // Assert
  expect(state.appendingDelta).toStrictEqual({ 1: delta.payload });
  expect(state.deletingDelta).toStrictEqual({});
});

test("add deleting delta", () => {
  // Arrange
  const delta = relations.appendDelta(createDeleting("1", "2"));
  const state = reducer(getInitialState(), delta);

  // Act

  // Assert
  expect(state.appendingDelta).toStrictEqual({});
  expect(state.deletingDelta).toStrictEqual({ "1": delta.payload });
});

test("do not append delta for appending same key", () => {
  // Arrange
  const delta = relations.appendDelta(createAppending("1", "2", "3"));
  const delta2 = relations.appendDelta(createAppending("2", "2", "3"));
  let state = reducer(getInitialState(), delta);
  state = reducer(state, delta2);

  // Act

  // Assert
  expect(state.appendingDelta).toStrictEqual({ 1: delta.payload });
  expect(state.deletingDelta).toStrictEqual({});
});

test("do not append delta for deleting same relation", () => {
  // Arrange
  const delta = relations.appendDelta(createDeleting("1", "2"));
  const delta2 = relations.appendDelta(createDeleting("2", "2"));
  let state = reducer(getInitialState(), delta);
  state = reducer(state, delta2);

  // Act

  // Assert
  expect(state.appendingDelta).toStrictEqual({});
  expect(state.deletingDelta).toStrictEqual({ "1": delta.payload });
});
