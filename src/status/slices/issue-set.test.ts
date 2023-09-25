import { test, expect } from "vitest";
import { importIssues, issueSet, removeNode } from "../actions";
import { getInitialState, reducer } from "./issue-set";
import { randomIssue } from "@/mock/generators";

test("initial state", () => {
  expect(getInitialState()).toEqual({
    currentIssueSetKey: "Default",
    issueSets: { Default: { name: "Default", issueKeys: [] } },
  });
});

test("import issues", () => {
  // Arrange
  const issues = [randomIssue(), randomIssue()];

  // Act
  const ret = reducer(getInitialState(), importIssues({ issues }));

  // Assert
  expect(ret.issueSets["Default"].issueKeys).toEqual(expect.arrayContaining(issues.map((v) => v.key)));
});

test("do not import twice", () => {
  // Arrange
  const issues = [randomIssue(), randomIssue()];

  // Act
  let ret = reducer(getInitialState(), importIssues({ issues }));
  ret = reducer(ret, importIssues({ issues }));

  // Assert
  expect(ret.issueSets["Default"].issueKeys).toHaveLength(2);
  expect(ret.issueSets["Default"].issueKeys).toEqual(expect.arrayContaining(issues.map((v) => v.key)));
});

test("delete issue from current issue set", () => {
  // Arrange
  const issues = [randomIssue(), randomIssue()];

  // Act
  let ret = reducer(getInitialState(), importIssues({ issues }));
  ret = reducer(ret, removeNode(issues[0].key));

  // Assert
  expect(ret.issueSets["Default"].issueKeys).toHaveLength(1);
  expect(ret.issueSets["Default"].issueKeys).toEqual([issues[1].key]);
});

test("add new issue set", () => {
  // Arrange

  // Act
  const ret = reducer(getInitialState(), issueSet.create("name"));

  // Assert
  expect(ret.currentIssueSetKey).toEqual("Default");
  expect(ret.issueSets).toEqual({
    Default: { name: "Default", issueKeys: [] },
    name: { name: "name", issueKeys: [] },
  });
});

test("delete issue set", () => {
  // Arrange

  // Act
  let ret = reducer(getInitialState(), issueSet.create("name"));
  ret = reducer(ret, issueSet.delete("name"));

  // Assert
  expect(ret.issueSets).toEqual({
    Default: { name: "Default", issueKeys: [] },
  });
});

test("can not delete non existent issue set", () => {
  // Arrange

  // Act
  const ret = reducer(getInitialState(), issueSet.delete("name"));

  // Assert
  expect(ret.issueSets).toEqual({
    Default: { name: "Default", issueKeys: [] },
  });
});

test("can not delete current issue set", () => {
  // Arrange

  // Act
  const ret = reducer(getInitialState(), issueSet.delete("Default"));

  // Assert
  expect(ret.issueSets).toEqual({
    Default: { name: "Default", issueKeys: [] },
  });
});

test("rename issue set", () => {
  // Arrange

  // Act
  const ret = reducer(getInitialState(), issueSet.rename({ from: "Default", to: "changed" }));

  // Assert
  expect(ret.currentIssueSetKey).toEqual("changed");
  expect(ret.issueSets).toEqual({
    changed: { name: "changed", issueKeys: [] },
  });
});

test("rename other issue set", () => {
  // Arrange

  // Act
  let ret = reducer(getInitialState(), issueSet.create("name"));
  ret = reducer(ret, issueSet.rename({ from: "name", to: "changed" }));

  // Assert
  expect(ret.currentIssueSetKey).toEqual("Default");
  expect(ret.issueSets).toEqual({
    Default: { name: "Default", issueKeys: [] },
    changed: { name: "changed", issueKeys: [] },
  });
});
