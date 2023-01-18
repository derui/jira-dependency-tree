import { test, expect } from "vitest";

import { ContainCycle, emptyGraph, Graph } from "@/depgraph/main";

const diagrams = (diagrams: string[]): Graph => {
  const vertexDirections = diagrams.map((diagram) => diagram.split(/>/).map((v) => v.trim()));

  if (!(vertexDirections.length > 0 && vertexDirections.every((v) => v.length > 1))) {
    throw "invalid state";
  }

  const vertices = new Set(vertexDirections.flat());
  let graph = emptyGraph();

  graph = graph.addVertices([...vertices]);

  vertexDirections.forEach((vertexDirection) => {
    for (let i = 0; i < vertexDirection.length - 1; i++) {
      graph = graph.directTo(vertexDirection[i], vertexDirection[i + 1]);
    }
  });

  return graph;
};

test("make empty depgraph", () => {
  // arrange

  // do
  const graph = emptyGraph();

  // verify
  expect(graph.edges).toHaveLength(0);
  expect(graph.vertices).toHaveLength(0);
});

test("add a vertex to graph", () => {
  // arrange

  // do
  const graph = emptyGraph().addVertex("a");

  // verify
  expect(graph.edges).toHaveLength(0);
  expect(graph.vertices).toHaveLength(1);
  expect(graph.levelAt(0)).toEqual(["a"]);
});

test("can not add same vertex twice", () => {
  // arrange

  // do
  const graph = emptyGraph().addVertex("a").addVertex("a");

  // verify
  expect(graph.edges).toHaveLength(0);
  expect(graph.vertices).toHaveLength(1);
});

test("add adjacent between two vertices", () => {
  // arrange

  // do
  const graph = emptyGraph().addVertex("a").addVertex("b").directTo("a", "b");

  // verify
  expect(graph.edges).toHaveLength(1);
  expect(graph.vertices).toHaveLength(2);
  expect(graph.levelAt(0)).toEqual(["a"]);
});

test("can not accept empty or blank vertex", () => {
  // arrange

  // do
  const graph = emptyGraph();

  // verify
  expect(() => graph.addVertex("")).toThrow();
  expect(() => graph.addVertex("   ")).toThrow();
});

test("level must be greater equal 0", () => {
  // arrange

  // do
  const graph = emptyGraph();

  // verify
  expect(() => graph.levelAt(-1)).toThrow();
});

test("level get from multiple root", () => {
  // arrange

  // do
  const graph = emptyGraph().addVertex("a").addVertex("b").addVertex("c").directTo("a", "b");

  // verify
  expect(graph.edges).toHaveLength(1);
  expect(graph.vertices).toHaveLength(3);
  expect(graph.levelAt(0)).toEqual(["a", "c"]);
  expect(graph.levelAt(1)).toEqual(["b"]);
  expect(graph.levelAt(2)).toEqual([]);
});

test("should be largest level ", () => {
  // arrange

  // do
  const graph = emptyGraph()
    .addVertices(["a", "b", "c", "d"])
    .directTo("a", "d")
    .directTo("b", "d")
    .directTo("b", "c")
    .directTo("c", "d");

  // verify
  expect(graph.adjacent("c")).toEqual(["d"]);
  expect(graph.levelAt(0)).toEqual(["a", "b"]);
  expect(graph.levelAt(1)).toEqual(["c"]);
  expect(graph.levelAt(2)).toEqual(["d"]);
});

test("level get from multiple edges", () => {
  // arrange

  // do
  const graph = emptyGraph().addVertices(["a", "b", "c", "d"]).directTo("a", "b").directTo("b", "c").directTo("d", "c");

  // verify
  expect(graph.edges).toHaveLength(3);
  expect(graph.vertices).toHaveLength(4);
  expect(graph.levelAt(0)).toEqual(["a", "d"]);
  expect(graph.levelAt(1)).toEqual(["b"]);
  expect(graph.levelAt(2)).toEqual(["c"]);
});

test("get adjacent vertices from given vertex", () => {
  // arrange

  // do
  const graph = diagrams(["a > b > c", "b > d > c"]);

  // verify
  expect(graph.edges).toHaveLength(4);
  expect(graph.vertices).toHaveLength(4);
  expect(graph.adjacent("a")).toEqual(["b"]);
  expect(graph.adjacent("b")).toEqual(["c", "d"]);
  expect(graph.adjacent("d")).toEqual(["c"]);
  expect(graph.adjacent("c")).toEqual([]);
});

test("ignore empty or blank vertices when add multiple vertices to graph at once", () => {
  // arrange

  // do
  const graph = emptyGraph().addVertices(["    ", "", "c", "d"]);

  // verify
  expect(graph.edges).toHaveLength(0);
  expect(new Set(graph.vertices)).toEqual(new Set(["c", "d"]));
});

test("ignore vertex that is not included in graph", () => {
  // arrange

  // do
  const graph = emptyGraph().addVertices(["c", "d"]);

  // verify
  expect(graph.adjacent("e")).toEqual([]);
});

test("get subgraph from given root vertex", () => {
  // arrange
  const graph = diagrams(["a > b > c", "b > d > c", "e > c"]);

  // do
  const [subgraphA] = graph.subgraphOf("a");
  const [subgraphE] = graph.subgraphOf("e");

  // verify
  expect(subgraphA.edges).toHaveLength(4);
  expect(subgraphA.vertices).toHaveLength(4);
  expect(subgraphE.edges).toHaveLength(1);
  expect(subgraphE.vertices).toHaveLength(2);
  expect(subgraphA.adjacent("a")).toEqual(["b"]);
  expect(subgraphA.adjacent("b")).toEqual(["c", "d"]);
  expect(subgraphA.adjacent("d")).toEqual(["c"]);
  expect(subgraphA.adjacent("c")).toEqual([]);
  expect(subgraphE.adjacent("e")).toEqual(["c"]);
  expect(subgraphE.adjacent("c")).toEqual([]);
  expect(subgraphE.adjacent("a")).toEqual([]);
});

test("get subgraph from given inter-graph vertex", () => {
  // arrange
  const graph = diagrams(["a > b > c", "b > d > c"]);

  // do
  const [subgraph] = graph.subgraphOf("d");

  // verify
  expect(subgraph.edges).toHaveLength(1);
  expect(subgraph.vertices).toHaveLength(2);
  expect(subgraph.adjacent("d")).toEqual(["c"]);
  expect(subgraph.adjacent("c")).toEqual([]);
});

test("can detect intersection between two graphs", () => {
  // arrange
  const graph1 = diagrams(["a > b > c", "b > d > c"]);

  const graph2 = emptyGraph().addVertices(["b", "d", "c"]).directTo("b", "d").directTo("c", "b");

  // do

  // verify
  expect(graph1.intersect(graph2)).toBe(true);
  expect(graph2.intersect(graph1)).toBe(true);
});

test("do not intersect if not found any same edges", () => {
  // arrange
  const graph1 = diagrams(["a > b > c", "b > d > c"]);

  const graph2 = emptyGraph().addVertices(["d", "c", "e", "f"]).directTo("c", "f").directTo("c", "e");

  // do

  // verify
  expect(graph1.intersect(graph2)).toBe(false);
  expect(graph2.intersect(graph1)).toBe(false);
});

test("merge between graphs that are intesected each other", () => {
  // arrange
  const graph1 = diagrams(["a > b > c", "b > d > c"]);

  const graph2 = emptyGraph().addVertices(["b", "d", "e"]).directTo("b", "d").directTo("e", "b");

  // do
  const merged = graph1.merge(graph2);

  // verify
  expect(merged?.edges).toHaveLength(5);
  expect(merged?.vertices).toHaveLength(5);
  expect(merged?.adjacent("a")).toEqual(["b"]);
  expect(merged?.adjacent("b")).toEqual(["c", "d"]);
  expect(merged?.adjacent("d")).toEqual(["c"]);
  expect(merged?.adjacent("c")).toEqual([]);
  expect(merged?.adjacent("e")).toEqual(["b"]);
});

test("merge return same graph if merged same graph", () => {
  // arrange
  const graph = diagrams(["a > b > c", "b > d > c"]);

  // do
  const merged = graph.merge(graph);

  // verify
  expect(merged?.edges).toEqual(graph.edges);
  expect(merged?.vertices).toEqual(graph.vertices);
});

test("detect cycle to get subgraph", () => {
  // arrange
  const graph = diagrams(["a > b > c > d > b > e"]);

  // do
  const [subgraph, cycle] = graph.subgraphOf("a");

  // verify
  expect(cycle.kind, "ContainCycle");
  expect((cycle as ContainCycle).cycles).toEqual([{ cycle: ["a", "b", "c", "d"], next: "b" }]);
  expect(subgraph.adjacent("a")).toEqual(["b"]);
  expect(subgraph.adjacent("b")).toEqual(["c", "e"]);
  expect(subgraph.adjacent("c")).toEqual(["d"]);
  expect(subgraph.adjacent("d")).toEqual(["b"]);
});

test("detect cycles to get subgraph", () => {
  // arrange
  const graph = diagrams(["a > b > c > d > b > e", "a > f > g > a"]);

  // do
  const [, cycle] = graph.subgraphOf("a");

  // verify
  expect(cycle.kind, "ContainCycle");
  expect((cycle as ContainCycle).cycles).toEqual([
    { cycle: ["a", "b", "c", "d"], next: "b" },
    { cycle: ["a", "f", "g"], next: "a" },
  ]);
});

test("remove direction", () => {
  // arrange
  const graph = diagrams(["a > b > c"]);

  // do
  const newGraph = graph.removeDirection("b", "c");

  // verify
  expect(newGraph.adjacent("b")).toEqual([]);
});

test("merge graphs have subgraph", () => {
  // arrange
  const graph1 = diagrams(["a > b > c > b"]);
  const graph2 = diagrams(["c > d > e"]);

  // do
  const ret = graph1.merge(graph2);

  // verify
  expect(ret?.vertices).toHaveLength(5);
  expect(ret?.adjacent("a")).toEqual(["b"]);
  expect(ret?.adjacent("b")).toEqual(["c"]);
  expect(ret?.adjacent("c")).toEqual(["b", "d"]);
  expect(ret?.adjacent("d")).toEqual(["e"]);
  expect(ret?.adjacent("e")).toEqual([]);
});

test("union with empty graphs", () => {
  const g1 = emptyGraph();
  const g2 = emptyGraph();

  const ret = g1.union(g2);

  expect(ret.vertices).toHaveLength(0);
  expect(ret.edges).toHaveLength(0);
});

test("union with each graphs", () => {
  const g1 = emptyGraph().addVertices(["a", "b"]);
  const g2 = emptyGraph().addVertices(["c", "b"]);

  const ret = g1.union(g2);

  expect(ret.vertices).toEqual(["a", "b", "c"]);
});

test("union edges with each graphs", () => {
  const g1 = diagrams(["a > b > c"]);
  const g2 = diagrams(["a > c > d"]);

  const ret = g1.union(g2);

  expect(ret.vertices).toEqual(["a", "b", "c", "d"]);
  expect(ret.edges).toHaveLength(4);
  expect(ret.edges.some(([e1, e2]) => e1 === "a" && e2 === "b")).toBeTruthy();
  expect(ret.edges.some(([e1, e2]) => e1 === "b" && e2 === "c")).toBeTruthy();
  expect(ret.edges.some(([e1, e2]) => e1 === "a" && e2 === "c")).toBeTruthy();
  expect(ret.edges.some(([e1, e2]) => e1 === "c" && e2 === "d")).toBeTruthy();
});

test("union edges when each graphs have same edge", () => {
  const g1 = diagrams(["a > b > c"]);
  const g2 = diagrams(["a > b > d"]);

  const ret = g1.union(g2);

  expect(ret.vertices).toEqual(["a", "b", "c", "d"]);
  expect(ret.edges).toHaveLength(3);
  expect(ret.edges.some(([e1, e2]) => e1 === "a" && e2 === "b")).toBeTruthy();
  expect(ret.edges.some(([e1, e2]) => e1 === "b" && e2 === "c")).toBeTruthy();
  expect(ret.edges.some(([e1, e2]) => e1 === "b" && e2 === "d")).toBeTruthy();
});
