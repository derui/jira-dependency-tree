import { suite } from "uvu";
import * as assert from "uvu/assert";

import { emptyGraph } from "@/depgraph";

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

test.run();
