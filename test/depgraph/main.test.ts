import assert from "assert";
import test from "ava";

import { ContainCycle, emptyGraph, Graph } from "@/depgraph/main";

const diagrams = (diagrams: string[]): Graph => {
  const vertexDirections = diagrams.map((diagram) => diagram.split(/>/).map((v) => v.trim()));

  assert(vertexDirections.length > 0 && vertexDirections.every((v) => v.length > 1));

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

test("make empty depgraph", (t) => {
  // arrange

  // do
  const graph = emptyGraph();

  // verify
  t.is(graph.edges.length, 0);
  t.is(graph.vertices.length, 0);
});

test("add a vertex to graph", (t) => {
  // arrange

  // do
  const graph = emptyGraph().addVertex("a");

  // verify
  t.is(graph.edges.length, 0);
  t.is(graph.vertices.length, 1);
  t.deepEqual(graph.levelAt(0), ["a"]);
});

test("can not add same vertex twice", (t) => {
  // arrange

  // do
  const graph = emptyGraph().addVertex("a").addVertex("a");

  // verify
  t.is(graph.edges.length, 0);
  t.is(graph.vertices.length, 1);
});

test("add adjacent between two vertices", (t) => {
  // arrange

  // do
  const graph = emptyGraph().addVertex("a").addVertex("b").directTo("a", "b");

  // verify
  t.is(graph.edges.length, 1);
  t.is(graph.vertices.length, 2);
  t.deepEqual(graph.levelAt(0), ["a"]);
});

test("can not accept empty or blank vertex", (t) => {
  // arrange

  // do
  const graph = emptyGraph();

  // verify
  t.throws(() => graph.addVertex(""));
  t.throws(() => graph.addVertex("   "));
});

test("level must be greater equal 0", (t) => {
  // arrange

  // do
  const graph = emptyGraph();

  // verify
  t.throws(() => graph.levelAt(-1));
});

test("level get from multiple root", (t) => {
  // arrange

  // do
  const graph = emptyGraph().addVertex("a").addVertex("b").addVertex("c").directTo("a", "b");

  // verify
  t.is(graph.edges.length, 1);
  t.is(graph.vertices.length, 3);
  t.deepEqual(graph.levelAt(0), ["a", "c"]);
  t.deepEqual(graph.levelAt(1), ["b"]);
  t.deepEqual(graph.levelAt(2), []);
});

test("should be largest level ", (t) => {
  // arrange

  // do
  const graph = emptyGraph()
    .addVertices(["a", "b", "c", "d"])
    .directTo("a", "d")
    .directTo("b", "d")
    .directTo("b", "c")
    .directTo("c", "d");

  // verify
  t.deepEqual(graph.adjacent("c"), ["d"], "d is adjacent of c");
  t.deepEqual(graph.levelAt(0), ["a", "b"], "level 0");
  t.deepEqual(graph.levelAt(1), ["c"], "level 1");
  t.deepEqual(graph.levelAt(2), ["d"], "level 2");
});

test("level get from multiple edges", (t) => {
  // arrange

  // do
  const graph = emptyGraph().addVertices(["a", "b", "c", "d"]).directTo("a", "b").directTo("b", "c").directTo("d", "c");

  // verify
  t.is(graph.edges.length, 3);
  t.is(graph.vertices.length, 4);
  t.deepEqual(graph.levelAt(0), ["a", "d"]);
  t.deepEqual(graph.levelAt(1), ["b"]);
  t.deepEqual(graph.levelAt(2), ["c"]);
});

test("get adjacent vertices from given vertex", (t) => {
  // arrange

  // do
  const graph = diagrams(["a > b > c", "b > d > c"]);

  // verify
  t.is(graph.edges.length, 4);
  t.is(graph.vertices.length, 4);
  t.deepEqual(graph.adjacent("a"), ["b"]);
  t.deepEqual(graph.adjacent("b"), ["c", "d"]);
  t.deepEqual(graph.adjacent("d"), ["c"]);
  t.deepEqual(graph.adjacent("c"), []);
});

test("ignore empty or blank vertices when add multiple vertices to graph at once", (t) => {
  // arrange

  // do
  const graph = emptyGraph().addVertices(["    ", "", "c", "d"]);

  // verify
  t.is(graph.edges.length, 0);
  t.deepEqual(new Set(graph.vertices), new Set(["c", "d"]));
});

test("ignore vertex that is not included in graph", (t) => {
  // arrange

  // do
  const graph = emptyGraph().addVertices(["c", "d"]);

  // verify
  t.deepEqual(graph.adjacent("e"), []);
});

test("get subgraph from given root vertex", (t) => {
  // arrange
  const graph = diagrams(["a > b > c", "b > d > c", "e > c"]);

  // do
  const [subgraphA] = graph.subgraphOf("a");
  const [subgraphE] = graph.subgraphOf("e");

  // verify
  t.is(subgraphA.edges.length, 4, "edge of subgraph A");
  t.is(subgraphA.vertices.length, 4, "vertices of subgraph A");
  t.is(subgraphE.edges.length, 1);
  t.is(subgraphE.vertices.length, 2);
  t.deepEqual(subgraphA.adjacent("a"), ["b"]);
  t.deepEqual(subgraphA.adjacent("b"), ["c", "d"]);
  t.deepEqual(subgraphA.adjacent("d"), ["c"]);
  t.deepEqual(subgraphA.adjacent("c"), []);
  t.deepEqual(subgraphE.adjacent("e"), ["c"]);
  t.deepEqual(subgraphE.adjacent("c"), []);
  t.deepEqual(subgraphE.adjacent("a"), [], "not found other root");
});

test("get subgraph from given inter-graph vertex", (t) => {
  // arrange
  const graph = diagrams(["a > b > c", "b > d > c"]);

  // do
  const [subgraph] = graph.subgraphOf("d");

  // verify
  t.is(subgraph.edges.length, 1);
  t.is(subgraph.vertices.length, 2);
  t.deepEqual(subgraph.adjacent("d"), ["c"]);
  t.deepEqual(subgraph.adjacent("c"), []);
});

test("can detect intersection between two graphs", (t) => {
  // arrange
  const graph1 = diagrams(["a > b > c", "b > d > c"]);

  const graph2 = emptyGraph().addVertices(["b", "d", "c"]).directTo("b", "d").directTo("c", "b");

  // do

  // verify
  t.is(graph1.intersect(graph2), true, "between graph1 and graph2");
  t.is(graph2.intersect(graph1), true, "between graph2 and graph1");
});

test("do not intersect if not found any same edges", (t) => {
  // arrange
  const graph1 = diagrams(["a > b > c", "b > d > c"]);

  const graph2 = emptyGraph().addVertices(["d", "c", "e", "f"]).directTo("c", "f").directTo("c", "e");

  // do

  // verify
  t.is(graph1.intersect(graph2), false, "between graph1 and graph2");
  t.is(graph2.intersect(graph1), false, "between graph2 and graph1");
});

test("merge between graphs that are intesected each other", (t) => {
  // arrange
  const graph1 = diagrams(["a > b > c", "b > d > c"]);

  const graph2 = emptyGraph().addVertices(["b", "d", "e"]).directTo("b", "d").directTo("e", "b");

  // do
  const merged = graph1.merge(graph2)!;

  // verify
  t.is(merged.edges.length, 5, "edge of graph");
  t.is(merged.vertices.length, 5, "vertices of graph");
  t.deepEqual(merged.adjacent("a"), ["b"]);
  t.deepEqual(merged.adjacent("b"), ["c", "d"]);
  t.deepEqual(merged.adjacent("d"), ["c"]);
  t.deepEqual(merged.adjacent("c"), []);
  t.deepEqual(merged.adjacent("e"), ["b"]);
});

test("merge return same graph if merged same graph", (t) => {
  // arrange
  const graph = diagrams(["a > b > c", "b > d > c"]);

  // do
  const merged = graph.merge(graph)!;

  // verify
  t.deepEqual(merged.edges, graph.edges, "edge of graph");
  t.deepEqual(merged.vertices, graph.vertices, "vertices of graph");
});

test("detect cycle to get subgraph", (t) => {
  // arrange
  const graph = diagrams(["a > b > c > d > b > e"]);

  // do
  const [subgraph, cycle] = graph.subgraphOf("a");

  // verify
  t.is(cycle.kind, "ContainCycle");
  t.deepEqual((cycle as ContainCycle).cycles, [{ cycle: ["a", "b", "c", "d"], next: "b" }]);
  t.deepEqual(subgraph.adjacent("a"), ["b"], "adjacent of 'a'");
  t.deepEqual(subgraph.adjacent("b"), ["c", "e"], "adjacent of 'b'");
  t.deepEqual(subgraph.adjacent("c"), ["d"], "adjacent of 'c'");
  t.deepEqual(subgraph.adjacent("d"), ["b"], "adjacent of 'd'");
});

test("detect cycles to get subgraph", (t) => {
  // arrange
  const graph = diagrams(["a > b > c > d > b > e", "a > f > g > a"]);

  // do
  const [, cycle] = graph.subgraphOf("a");

  // verify
  t.is(cycle.kind, "ContainCycle");
  t.deepEqual((cycle as ContainCycle).cycles, [
    { cycle: ["a", "b", "c", "d"], next: "b" },
    { cycle: ["a", "f", "g"], next: "a" },
  ]);
});

test("remove direction", (t) => {
  // arrange
  const graph = diagrams(["a > b > c"]);

  // do
  const newGraph = graph.removeDirection("b", "c");

  // verify
  t.deepEqual(newGraph.adjacent("b"), []);
});

test("merge graphs have subgraph", (t) => {
  // arrange
  const graph1 = diagrams(["a > b > c > b"]);
  const graph2 = diagrams(["c > d > e"]);

  // do
  const ret = graph1.merge(graph2);

  // verify
  t.is(ret?.vertices.length, 5, "vertices");
  t.deepEqual(ret?.adjacent("a"), ["b"], "adjacent of a");
  t.deepEqual(ret?.adjacent("b"), ["c"], "adjacent of b");
  t.deepEqual(ret?.adjacent("c"), ["b", "d"], "adjacent of c");
  t.deepEqual(ret?.adjacent("d"), ["e"], "adjacent of d");
  t.deepEqual(ret?.adjacent("e"), [], "adjacent of e");
});

test("union with empty graphs", (t) => {
  const g1 = emptyGraph();
  const g2 = emptyGraph();

  const ret = g1.union(g2);

  t.deepEqual(ret.vertices, []);
  t.deepEqual(ret.edges, []);
});

test("union with each graphs", (t) => {
  const g1 = emptyGraph().addVertices(["a", "b"]);
  const g2 = emptyGraph().addVertices(["c", "b"]);

  const ret = g1.union(g2);

  t.deepEqual(ret.vertices, ["a", "b", "c"]);
});

test("union edges with each graphs", (t) => {
  const g1 = diagrams(["a > b > c"]);
  const g2 = diagrams(["a > c > d"]);

  const ret = g1.union(g2);

  t.deepEqual(ret.vertices, ["a", "b", "c", "d"]);
  t.is(ret.edges.length, 4);
  t.truthy(ret.edges.some(([e1, e2]) => e1 === "a" && e2 === "b"));
  t.truthy(ret.edges.some(([e1, e2]) => e1 === "b" && e2 === "c"));
  t.truthy(ret.edges.some(([e1, e2]) => e1 === "a" && e2 === "c"));
  t.truthy(ret.edges.some(([e1, e2]) => e1 === "c" && e2 === "d"));
});

test("union edges when each graphs have same edge", (t) => {
  const g1 = diagrams(["a > b > c"]);
  const g2 = diagrams(["a > b > d"]);

  const ret = g1.union(g2);

  t.deepEqual(ret.vertices, ["a", "b", "c", "d"]);
  t.is(ret.edges.length, 3);
  t.truthy(ret.edges.some(([e1, e2]) => e1 === "a" && e2 === "b"));
  t.truthy(ret.edges.some(([e1, e2]) => e1 === "b" && e2 === "c"));
  t.truthy(ret.edges.some(([e1, e2]) => e1 === "b" && e2 === "d"));
});
