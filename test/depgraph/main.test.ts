import test from "ava";

import { emptyGraph } from "@/depgraph/main";

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

test("can not add same label twice", (t) => {
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
  const graph = emptyGraph()
    .addVertices(["a", "b", "c", "d"])
    .directTo("a", "b")
    .directTo("b", "c")
    .directTo("b", "d")
    .directTo("d", "c");

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
  const graph = emptyGraph()
    .addVertices(["a", "b", "c", "d", "e"])
    .directTo("a", "b")
    .directTo("b", "c")
    .directTo("b", "d")
    .directTo("d", "c")
    .directTo("e", "c");

  // do
  const subgraphA = graph.subgraphOf("a");
  const subgraphE = graph.subgraphOf("e");

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
  const graph = emptyGraph()
    .addVertices(["a", "b", "c", "d", "e"])
    .directTo("a", "b")
    .directTo("b", "c")
    .directTo("b", "d")
    .directTo("d", "c");

  // do
  const subgraph = graph.subgraphOf("d");

  // verify
  t.is(subgraph.edges.length, 1);
  t.is(subgraph.vertices.length, 2);
  t.deepEqual(subgraph.adjacent("d"), ["c"]);
  t.deepEqual(subgraph.adjacent("c"), []);
});

test("can detect intersection between two graphs", (t) => {
  // arrange
  const graph1 = emptyGraph()
    .addVertices(["a", "b", "c", "d"])
    .directTo("a", "b")
    .directTo("b", "c")
    .directTo("b", "d")
    .directTo("d", "c");

  const graph2 = emptyGraph().addVertices(["b", "d", "c"]).directTo("b", "d").directTo("c", "b");

  // do

  // verify
  t.is(graph1.intersect(graph2), true, "between graph1 and graph2");
  t.is(graph2.intersect(graph1), true, "between graph2 and graph1");
});

test("do not intersect if not found any same edges", (t) => {
  // arrange
  const graph1 = emptyGraph()
    .addVertices(["a", "b", "c", "d"])
    .directTo("a", "b")
    .directTo("b", "c")
    .directTo("b", "d")
    .directTo("d", "c");

  const graph2 = emptyGraph().addVertices(["d", "c", "e", "f"]).directTo("c", "f").directTo("c", "e");

  // do

  // verify
  t.is(graph1.intersect(graph2), false, "between graph1 and graph2");
  t.is(graph2.intersect(graph1), false, "between graph2 and graph1");
});

test("merge between graphs that are intesected each other", (t) => {
  // arrange
  const graph1 = emptyGraph()
    .addVertices(["a", "b", "c", "d"])
    .directTo("a", "b")
    .directTo("b", "c")
    .directTo("b", "d")
    .directTo("d", "c");

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
  const graph = emptyGraph()
    .addVertices(["a", "b", "c", "d"])
    .directTo("a", "b")
    .directTo("b", "c")
    .directTo("b", "d")
    .directTo("d", "c");

  // do
  const merged = graph.merge(graph)!;

  // verify
  t.deepEqual(merged.edges, graph.edges, "edge of graph");
  t.deepEqual(merged.vertices, graph.vertices, "vertices of graph");
});
