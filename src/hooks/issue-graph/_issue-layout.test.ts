import { test, expect } from "vitest";

import { ISSUE_SIZE, ISSUE_X_GAP, ISSUE_Y_GAP, calculateIssueLayout } from "./_issue-layout";
import { emptyDirectedGraph } from "@/libs/depgraph/main";
import { randomIssue } from "@/mock/generators";
import { issueToIssueModel } from "@/view-models/issue";

test("do not layout if given graph is empty", () => {
  // arrange
  const graph = emptyDirectedGraph();

  // do
  const layouts = calculateIssueLayout(graph, []);

  // verify
  expect(layouts).toHaveLength(0);
});

test("layout graphs having only an issue", () => {
  // arrange
  const graph = emptyDirectedGraph().addVertices(["a", "b", "c"]);
  const issues = [randomIssue({ key: "a" }), randomIssue({ key: "b" }), randomIssue({ key: "c" })].map(
    issueToIssueModel,
  );

  // do
  const layout = calculateIssueLayout(graph, issues);

  // verify
  expect(layout).toHaveLength(3);

  const sortedLayout = layout.sort((v1, v2) => v1.issue.key.localeCompare(v2.issue.key));
  expect(sortedLayout[0]).toEqual({
    issue: issues[0],
    position: { x: 0, y: 0 },
    size: ISSUE_SIZE,
    meta: { colIndex: 0, rowIndex: 0 },
  });
  expect(sortedLayout[1]).toEqual({
    issue: issues[1],
    position: { x: 0, y: ISSUE_Y_GAP + ISSUE_SIZE.height },
    size: ISSUE_SIZE,
    meta: { colIndex: 0, rowIndex: 1 },
  });
  expect(sortedLayout[2]).toEqual({
    issue: issues[2],
    position: { x: 0, y: 2 * (ISSUE_Y_GAP + ISSUE_SIZE.height) },
    size: ISSUE_SIZE,
    meta: { colIndex: 0, rowIndex: 2 },
  });
});

test("layout directed graph", () => {
  // arrange
  const graph = emptyDirectedGraph().addVertices(["a", "b", "c"]).directTo("a", "b").directTo("c", "b");
  const issues = [randomIssue({ key: "a" }), randomIssue({ key: "b" }), randomIssue({ key: "c" })].map(
    issueToIssueModel,
  );

  // do
  const layout = calculateIssueLayout(graph, issues);

  // verify
  expect(layout).toHaveLength(3);

  const sortedLayout = layout.sort((v1, v2) => v1.issue.key.localeCompare(v2.issue.key));
  expect(sortedLayout[0]).toEqual({
    issue: issues[0],
    position: { x: 0, y: 0 },
    size: ISSUE_SIZE,
    meta: { colIndex: 0, rowIndex: 0 },
  });
  expect(sortedLayout[1]).toEqual({
    issue: issues[1],
    position: { x: ISSUE_X_GAP + ISSUE_SIZE.width, y: 0 },
    size: ISSUE_SIZE,
    meta: { colIndex: 1, rowIndex: 0 },
  });
  expect(sortedLayout[2]).toEqual({
    issue: issues[2],
    position: { x: 0, y: ISSUE_Y_GAP + ISSUE_SIZE.height },
    size: ISSUE_SIZE,
    meta: { colIndex: 0, rowIndex: 1 },
  });
});

test("layout subgraphs", () => {
  // arrange
  const graph = emptyDirectedGraph()
    .addVertices(["a", "b", "c", "d", "e"])
    .directTo("a", "b")
    .directTo("b", "c")
    .directTo("d", "e");
  const issues = [
    randomIssue({ key: "a" }),
    randomIssue({ key: "b" }),
    randomIssue({ key: "c" }),
    randomIssue({ key: "d" }),
    randomIssue({ key: "e" }),
  ].map(issueToIssueModel);

  // do
  const layout = calculateIssueLayout(graph, issues);

  // verify
  expect(layout).toHaveLength(5);

  const sortedLayout = layout.sort((v1, v2) => v1.issue.key.localeCompare(v2.issue.key));
  expect(sortedLayout[0]).toEqual({
    issue: issues[0],
    position: { x: 0, y: 0 },
    size: ISSUE_SIZE,
    meta: { colIndex: 0, rowIndex: 0 },
  });
  expect(sortedLayout[1]).toEqual({
    issue: issues[1],
    position: { x: ISSUE_X_GAP + ISSUE_SIZE.width, y: 0 },
    size: ISSUE_SIZE,
    meta: { colIndex: 1, rowIndex: 0 },
  });
  expect(sortedLayout[2]).toEqual({
    issue: issues[2],
    position: { x: 2 * (ISSUE_X_GAP + ISSUE_SIZE.width), y: 0 },
    size: ISSUE_SIZE,
    meta: { colIndex: 2, rowIndex: 0 },
  });
  expect(sortedLayout[3]).toEqual({
    issue: issues[3],
    position: { x: 0, y: ISSUE_Y_GAP + ISSUE_SIZE.height },
    size: ISSUE_SIZE,
    meta: { colIndex: 0, rowIndex: 1 },
  });
  expect(sortedLayout[4]).toEqual({
    issue: issues[4],
    position: { x: ISSUE_X_GAP + ISSUE_SIZE.width, y: ISSUE_Y_GAP + ISSUE_SIZE.height },
    size: ISSUE_SIZE,
    meta: { colIndex: 1, rowIndex: 1 },
  });
});

test("should layout large subgraph to top", () => {
  // arrange
  const graph = emptyDirectedGraph()
    .addVertices(["a", "b", "c", "d", "e"])
    .directTo("a", "b")
    .directTo("d", "c")
    .directTo("d", "e");
  const issues = [
    randomIssue({ key: "a" }),
    randomIssue({ key: "b" }),
    randomIssue({ key: "c" }),
    randomIssue({ key: "d" }),
    randomIssue({ key: "e" }),
  ].map(issueToIssueModel);

  // do
  const layout = calculateIssueLayout(graph, issues);

  // verify
  expect(layout).toHaveLength(5);

  const sortedLayout = layout.sort((v1, v2) => v1.issue.key.localeCompare(v2.issue.key));
  expect(sortedLayout[0].meta).toEqual({ colIndex: 0, rowIndex: 2 });
  expect(sortedLayout[1].meta).toEqual({ colIndex: 1, rowIndex: 2 });
  expect(sortedLayout[2].meta).toEqual({ colIndex: 1, rowIndex: 0 });
  expect(sortedLayout[3].meta).toEqual({ colIndex: 0, rowIndex: 0 });
  expect(sortedLayout[4].meta).toEqual({ colIndex: 1, rowIndex: 1 });
});

test("layout complex subgraph", () => {
  // arrange
  const graph = emptyDirectedGraph()
    .addVertices(["a", "b", "c", "d", "e"])
    .directTo("a", "b")
    .directTo("b", "c")
    .directTo("d", "c")
    .directTo("b", "e");
  const issues = [
    randomIssue({ key: "a" }),
    randomIssue({ key: "b" }),
    randomIssue({ key: "c" }),
    randomIssue({ key: "d" }),
    randomIssue({ key: "e" }),
  ].map(issueToIssueModel);

  // do
  const layout = calculateIssueLayout(graph, issues);

  // verify
  const sortedLayout = layout.sort((v1, v2) => v1.issue.key.localeCompare(v2.issue.key));
  expect(sortedLayout[0].meta).toEqual({ colIndex: 0, rowIndex: 0 });
  expect(sortedLayout[1].meta).toEqual({ colIndex: 1, rowIndex: 0 });
  expect(sortedLayout[2].meta).toEqual({ colIndex: 2, rowIndex: 0 });
  expect(sortedLayout[3].meta).toEqual({ colIndex: 0, rowIndex: 2 });
  expect(sortedLayout[4].meta).toEqual({ colIndex: 2, rowIndex: 1 });
});

test("layout skip-contained graph", () => {
  // arrange
  const graph = emptyDirectedGraph()
    .addVertices(["a", "b", "c", "d", "e"])
    .directTo("a", "b")
    .directTo("b", "c")
    .directTo("b", "d")
    .directTo("b", "e")
    .directTo("d", "c");
  const issues = [
    randomIssue({ key: "a" }),
    randomIssue({ key: "b" }),
    randomIssue({ key: "c" }),
    randomIssue({ key: "d" }),
    randomIssue({ key: "e" }),
  ].map(issueToIssueModel);

  // do
  const layout = calculateIssueLayout(graph, issues);

  // verify
  const sortedLayout = layout.sort((v1, v2) => v1.issue.key.localeCompare(v2.issue.key));
  expect(sortedLayout[0].meta).toEqual({ colIndex: 0, rowIndex: 0 });
  expect(sortedLayout[1].meta).toEqual({ colIndex: 1, rowIndex: 0 });
  expect(sortedLayout[2].meta).toEqual({ colIndex: 3, rowIndex: 0 });
  expect(sortedLayout[3].meta).toEqual({ colIndex: 2, rowIndex: 1 });
  expect(sortedLayout[4].meta).toEqual({ colIndex: 2, rowIndex: 2 });
});

test("layout 2-subgraphs graph", () => {
  // arrange
  const graph = emptyDirectedGraph()
    .addVertices(["a", "b", "c", "d", "e", "f"])
    .directTo("a", "b")
    .directTo("b", "c")
    .directTo("b", "d")
    .directTo("d", "c")
    .directTo("e", "c")
    .directTo("c", "f")
    .directTo("e", "f");
  const issues = [
    randomIssue({ key: "a" }),
    randomIssue({ key: "b" }),
    randomIssue({ key: "c" }),
    randomIssue({ key: "d" }),
    randomIssue({ key: "e" }),
    randomIssue({ key: "f" }),
  ].map(issueToIssueModel);

  // do
  const layout = calculateIssueLayout(graph, issues);

  // verify
  const sortedLayout = layout.sort((v1, v2) => v1.issue.key.localeCompare(v2.issue.key));
  expect(sortedLayout[0].meta).toEqual({ colIndex: 0, rowIndex: 0 });
  expect(sortedLayout[1].meta).toEqual({ colIndex: 1, rowIndex: 0 });
  expect(sortedLayout[2].meta).toEqual({ colIndex: 3, rowIndex: 0 });
  expect(sortedLayout[3].meta).toEqual({ colIndex: 2, rowIndex: 1 });
  expect(sortedLayout[4].meta).toEqual({ colIndex: 0, rowIndex: 2 });
  expect(sortedLayout[5].meta).toEqual({ colIndex: 4, rowIndex: 0 });
});
