import { test, expect } from "vitest";
import { emptyDirectedGraph } from "./main";
import { emptyUndirectedGraph, fromDirectedGraph } from "./undirected";

test("create empty graph", () => {
  const graph = emptyUndirectedGraph();

  expect(graph.edges).empty;
  expect(graph.vertices).empty;
});

test("add vertices but no edges", () => {
  const graph = emptyUndirectedGraph().addVertex("a").addVertex("b");

  expect(graph.vertices).contains("a").and.contain("b");
  expect(graph.edges).empty;
});

test("should error when vertex is null", () => {
  expect(() => emptyUndirectedGraph().addVertex("")).toThrow();
});

test("add edge", () => {
  const graph = emptyUndirectedGraph().addVertices(["a", "b"]).edge("a", "b");

  expect(graph.vertices).contain("a").and.contain("b");
  expect(graph.edges).toHaveLength(1);
});

test("edges should unique", () => {
  const graph = emptyUndirectedGraph().addVertices(["a", "b", "c"]).edge("a", "b").edge("b", "a").edge("a", "c");

  expect(graph.vertices).contain("a").and.contain("b").and.contain("c");
  expect(graph.edges).toHaveLength(2);
});

test("throw error to add edge with vertices are not in graph", () => {
  const graph = emptyUndirectedGraph().addVertices(["a", "b"]);

  expect(() => graph.edge("", "b")).toThrow();
  expect(() => graph.edge("", "")).toThrow();
  expect(() => graph.edge("a", "")).toThrow();
  expect(() => graph.edge("c", "b")).toThrow();
  expect(() => graph.edge("b", "b")).toThrow();
});

test("get subgraph orphan vertex", () => {
  const graph = emptyUndirectedGraph().addVertices(["a", "b"]).subgraphOf("a");

  expect(graph.vertices).toEqual(["a"]);
  expect(graph.edges).empty;
});

test("get subgraph related edges", () => {
  const graph = emptyUndirectedGraph().addVertices(["a", "b", "c", "d"]).edge("a", "b").edge("b", "c").subgraphOf("c");

  expect(graph.vertices).contain("a").and.contain("b").contain("c").and.lengthOf(3);
  expect(graph.edges).toHaveLength(2);
  expect(graph.edges).toContainEqual(["a", "b"]);
  expect(graph.edges).toContainEqual(["b", "c"]);
});

test("get subgraph with other root", () => {
  const graph = emptyUndirectedGraph()
    .addVertices(["a", "b", "c", "d", "e", "f"])
    .edge("a", "b")
    .edge("b", "c")
    .edge("e", "d")
    .edge("a", "d")
    .subgraphOf("b");

  expect(graph.vertices).toEqual(expect.arrayContaining(["a", "b", "c", "d", "e"]));
  expect(graph.edges).toHaveLength(4);
  expect(graph.edges).toEqual(
    expect.arrayContaining([
      ["a", "b"],
      ["b", "c"],
      ["a", "d"],
      ["d", "e"],
    ]),
  );
});

test("make undirected graph with directed graph ", () => {
  const directed = emptyDirectedGraph().addVertices(["a", "b", "c", "d"]).directTo("a", "b").directTo("c", "d");
  const undirected = fromDirectedGraph(directed);

  expect(undirected.vertices).toEqual(expect.arrayContaining(["a", "b", "c", "d"]));
  expect(undirected.edges).toEqual(
    expect.arrayContaining([
      ["a", "b"],
      ["c", "d"],
    ]),
  );
  expect(undirected.edges).toHaveLength(2);
});
