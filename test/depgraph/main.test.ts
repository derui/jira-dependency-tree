import { suite } from "uvu";
import * as assert from "uvu/assert";

import { emptyGraph } from "@/depgraph/main";

const test = suite("depgraph");

test("make empty depgraph", () => {
  // arrange

  // do
  const graph = emptyGraph();

  // verify
  assert.is(graph.edges.length, 0);
  assert.is(graph.vertices.length, 0);
});

test("add a vertex to graph", () => {
  // arrange

  // do
  const graph = emptyGraph().addVertex("a");

  // verify
  assert.is(graph.edges.length, 0);
  assert.is(graph.vertices.length, 1);
  assert.equal(graph.levelAt(0), ["a"]);
});

test("can not add same label twice", () => {
  // arrange

  // do
  const graph = emptyGraph().addVertex("a").addVertex("a");

  // verify
  assert.is(graph.edges.length, 0);
  assert.is(graph.vertices.length, 1);
});

test("add adjacent between two vertices", () => {
  // arrange

  // do
  const graph = emptyGraph().addVertex("a").addVertex("b").directTo("a", "b");

  // verify
  assert.is(graph.edges.length, 1);
  assert.is(graph.vertices.length, 2);
  assert.equal(graph.levelAt(0), ["a"]);
});

test("can not accept empty or blank vertex", () => {
  // arrange

  // do
  const graph = emptyGraph();

  // verify
  assert.throws(() => graph.addVertex(""));
  assert.throws(() => graph.addVertex("   "));
});

test("level must be greater equal 0", () => {
  // arrange

  // do
  const graph = emptyGraph();

  // verify
  assert.throws(() => graph.levelAt(-1));
});

test("level get from multiple root", () => {
  // arrange

  // do
  const graph = emptyGraph().addVertex("a").addVertex("b").addVertex("c").directTo("a", "b");

  // verify
  assert.is(graph.edges.length, 1);
  assert.is(graph.vertices.length, 3);
  assert.equal(graph.levelAt(0), ["a", "c"]);
  assert.equal(graph.levelAt(1), ["b"]);
  assert.equal(graph.levelAt(2), []);
});

test("level get from multiple edges", () => {
  // arrange

  // do
  const graph = emptyGraph().addVertices(["a", "b", "c", "d"]).directTo("a", "b").directTo("b", "c").directTo("d", "c");

  // verify
  assert.is(graph.edges.length, 3);
  assert.is(graph.vertices.length, 4);
  assert.equal(graph.levelAt(0), ["a", "d"]);
  assert.equal(graph.levelAt(1), ["b"]);
  assert.equal(graph.levelAt(2), ["c"]);
});

test("get adjacent vertices from given vertex", () => {
  // arrange

  // do
  const graph = emptyGraph()
    .addVertices(["a", "b", "c", "d"])
    .directTo("a", "b")
    .directTo("b", "c")
    .directTo("b", "d")
    .directTo("d", "c");

  // verify
  assert.is(graph.edges.length, 4);
  assert.is(graph.vertices.length, 4);
  assert.equal(graph.adjacent("a"), ["b"]);
  assert.equal(graph.adjacent("b"), ["c", "d"]);
  assert.equal(graph.adjacent("d"), ["c"]);
  assert.equal(graph.adjacent("c"), []);
});

test("ignore empty or blank vertices when add multiple vertices to graph at once", () => {
  // arrange

  // do
  const graph = emptyGraph().addVertices(["    ", "", "c", "d"]);

  // verify
  assert.is(graph.edges.length, 0);
  assert.equal(new Set(graph.vertices), new Set(["c", "d"]));
});

test("ignore vertex that is not included in graph", () => {
  // arrange

  // do
  const graph = emptyGraph().addVertices(["c", "d"]);

  // verify
  assert.equal(graph.adjacent("e"), []);
});

test("get subgraph from given root vertex", () => {
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
  assert.is(subgraphA.edges.length, 4, "edge of subgraph A");
  assert.is(subgraphA.vertices.length, 4, "vertices of subgraph A");
  assert.is(subgraphE.edges.length, 1);
  assert.is(subgraphE.vertices.length, 2);
  assert.equal(subgraphA.adjacent("a"), ["b"]);
  assert.equal(subgraphA.adjacent("b"), ["c", "d"]);
  assert.equal(subgraphA.adjacent("d"), ["c"]);
  assert.equal(subgraphA.adjacent("c"), []);
  assert.equal(subgraphE.adjacent("e"), ["c"]);
  assert.equal(subgraphE.adjacent("c"), []);
  assert.equal(subgraphE.adjacent("a"), [], "not found other root");
});

test("get subgraph from given inter-graph vertex", () => {
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
  assert.is(subgraph.edges.length, 1);
  assert.is(subgraph.vertices.length, 2);
  assert.equal(subgraph.adjacent("d"), ["c"]);
  assert.equal(subgraph.adjacent("c"), []);
});

test("can detect intersection between two graphs", () => {
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
  assert.is(graph1.intersect(graph2), true, "between graph1 and graph2");
  assert.is(graph2.intersect(graph1), true, "between graph2 and graph1");
});

test("do not intersect if not found any same edges", () => {
  // arrange
  const graph1 = emptyGraph()
    .addVertices(["a", "b", "c", "d"])
    .directTo("a", "b")
    .directTo("b", "c")
    .directTo("b", "d")
    .directTo("d", "c");

  const graph2 = emptyGraph().addVertices(["b", "d", "c"]).directTo("d", "b").directTo("c", "b");

  // do

  // verify
  assert.is(graph1.intersect(graph2), false, "between graph1 and graph2");
  assert.is(graph2.intersect(graph1), false, "between graph2 and graph1");
});

test("merge between graphs that are intesected each other", () => {
  // arrange
  const graph1 = emptyGraph()
    .addVertices(["a", "b", "c", "d"])
    .directTo("a", "b")
    .directTo("b", "c")
    .directTo("b", "d")
    .directTo("d", "c");

  const graph2 = emptyGraph().addVertices(["b", "d", "e"]).directTo("b", "d").directTo("e", "b");

  // do
  const merged = graph1.merge(graph2)!!;

  // verify
  assert.is(merged.edges.length, 5, "edge of graph");
  assert.is(merged.vertices.length, 5, "vertices of graph");
  assert.equal(merged.adjacent("a"), ["b"]);
  assert.equal(merged.adjacent("b"), ["c", "d"]);
  assert.equal(merged.adjacent("d"), ["c"]);
  assert.equal(merged.adjacent("c"), []);
  assert.equal(merged.adjacent("e"), ["b"]);
});

test.run();
