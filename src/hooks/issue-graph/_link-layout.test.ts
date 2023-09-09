import { test, expect } from "vitest";

import { calculateLinkLayout } from "./_link-layout";
import { ISSUE_SIZE, calculateIssueLayout } from "./_issue-layout";
import { emptyDirectedGraph } from "@/libs/depgraph/main";
import { randomIssue } from "@/mock/generators";

test("do not layout if given graph is empty", () => {
  // arrange
  const graph = emptyDirectedGraph();

  // do
  const layouts = calculateLinkLayout([], []);

  // verify
  expect(layouts).toHaveLength(0);
});

test("does not get layout if relation is empty", () => {
  // arrange
  const graph = emptyDirectedGraph().addVertices(["a", "b", "c"]);
  const issues = [randomIssue({ key: "a" }), randomIssue({ key: "b" }), randomIssue({ key: "c" })];
  const issueLayouts = calculateIssueLayout(graph, issues);

  // do
  const layout = calculateLinkLayout([], issueLayouts);

  // verify
  expect(layout).toHaveLength(0);
});

test("get same row link", () => {
  // arrange
  const graph = emptyDirectedGraph().addVertices(["a", "b", "c"]).directTo("a", "b").directTo("b", "c");
  const issues = [randomIssue({ key: "a" }), randomIssue({ key: "b" }), randomIssue({ key: "c" })];
  const issueLayouts = calculateIssueLayout(graph, issues);

  // do
  const layout = calculateLinkLayout(
    [
      { id: "1", inwardIssue: "a", outwardIssue: "b" },
      { id: "2", inwardIssue: "b", outwardIssue: "c" },
    ],
    issueLayouts,
  );

  // verify
  expect(layout).toHaveLength(2);

  const sortedLayout = layout.sort((v1, v2) => v1.meta.startIssue.localeCompare(v2.meta.startIssue));
  expect(sortedLayout[0].pathCommands.trim()).toEqual(`M 160,49 h 40`);
  expect(sortedLayout[1].pathCommands.trim()).toEqual(`M 360,49 h 40`);
});

test("get upper link", () => {
  // arrange
  const graph = emptyDirectedGraph().addVertices(["a", "b", "c"]).directTo("a", "b").directTo("c", "b");
  const issues = [randomIssue({ key: "a" }), randomIssue({ key: "b" }), randomIssue({ key: "c" })];
  const issueLayouts = calculateIssueLayout(graph, issues);

  // do
  const layout = calculateLinkLayout(
    [
      { id: "1", inwardIssue: "a", outwardIssue: "b" },
      { id: "2", inwardIssue: "c", outwardIssue: "b" },
    ],
    issueLayouts,
  );

  // verify
  expect(layout).toHaveLength(2);

  const sortedLayout = layout.sort((v1, v2) => v1.meta.startIssue.localeCompare(v2.meta.startIssue));
  expect(sortedLayout[0].pathCommands.trim()).toEqual(`M 160,49 h 40`);
  expect(sortedLayout[1].pathCommands.trim()).toContain(`M 160,169 h 16`);
  expect(sortedLayout[1].pathCommands.trim()).toContain(`s 4,0 4,0 4,-4`);
  expect(sortedLayout[1].pathCommands.trim()).toContain(`v -112`);
  expect(sortedLayout[1].pathCommands.trim()).toContain(`s 0,-4 0,-4 4,-4`);
  expect(sortedLayout[1].pathCommands.trim()).toContain(`h 16`);
});

test("get lower link", () => {
  // arrange
  const graph = emptyDirectedGraph().addVertices(["a", "b", "c"]).directTo("a", "b").directTo("a", "c");
  const issues = [randomIssue({ key: "a" }), randomIssue({ key: "b" }), randomIssue({ key: "c" })];
  const issueLayouts = calculateIssueLayout(graph, issues);

  // do
  const layout = calculateLinkLayout(
    [
      { id: "1", inwardIssue: "a", outwardIssue: "b" },
      { id: "2", inwardIssue: "a", outwardIssue: "c" },
    ],
    issueLayouts,
  );

  // verify
  expect(layout).toHaveLength(2);

  const sortedLayout = layout.sort((v1, v2) => v1.meta.startIssue.localeCompare(v2.meta.startIssue));
  expect(sortedLayout[0].pathCommands.trim()).toEqual(`M 160,49 h 40`);
  expect(sortedLayout[1].pathCommands.trim()).toContain(`M 160,49 h 16`);
  expect(sortedLayout[1].pathCommands.trim()).toContain(`s 4,0 4,0 4,4`);
  expect(sortedLayout[1].pathCommands.trim()).toContain(`v 112`);
  expect(sortedLayout[1].pathCommands.trim()).toContain(`s 0,4 0,4 4,4`);
  expect(sortedLayout[1].pathCommands.trim()).toContain(`h 16`);
});
