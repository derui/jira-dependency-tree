import test from "ava";

import { emptyGraph } from "@/depgraph/main";
import { calculateLayouts } from "@/issue-graph/issue-layout";

test("do not layout if given graph is empty", (t) => {
  // arrange
  const graph = emptyGraph();

  // do
  const { graphs, orphans } = calculateLayouts(graph, { width: 10, height: 10 });

  // verify
  t.is(graphs.length, 0);
  t.is(orphans, undefined);
});

test("layout orphan graphs", (t) => {
  // arrange
  const graph = emptyGraph().addVertices(["a", "b", "c"]);

  // do
  const { orphans: ret } = calculateLayouts(graph, { width: 10, height: 10 });

  // verify
  t.deepEqual(ret!.size, { width: 10, height: 40 });

  const vertices = ret!.vertices.sort((v1, v2) => v1.vertex.localeCompare(v2.vertex));
  t.deepEqual(vertices[0], { vertex: "a", level: 0, indexInLevel: 0, baseX: 0, baseY: 0 });
  t.deepEqual(vertices[1], { vertex: "b", level: 0, indexInLevel: 1, baseX: 0, baseY: 15 });
  t.deepEqual(vertices[2], { vertex: "c", level: 0, indexInLevel: 2, baseX: 0, baseY: 30 });
});

test("layout orphan graphs with multi lines", (t) => {
  // arrange
  const graph = emptyGraph().addVertices(["a", "b", "c", "d", "e", "f", "g"]);

  // do
  const { orphans: ret } = calculateLayouts(graph, { width: 10, height: 10 });

  // verify
  t.deepEqual(ret!.size, { width: 27.5, height: 85 });

  const vertices = ret!.vertices.sort((v1, v2) => v1.vertex.localeCompare(v2.vertex));
  t.deepEqual(vertices[0], { vertex: "a", level: 0, indexInLevel: 0, baseX: 0, baseY: 0 });
  t.deepEqual(vertices[1], { vertex: "b", level: 0, indexInLevel: 1, baseX: 0, baseY: 15 });
  t.deepEqual(vertices[2], { vertex: "c", level: 0, indexInLevel: 2, baseX: 0, baseY: 30 });
  t.deepEqual(vertices[3], { vertex: "d", level: 0, indexInLevel: 3, baseX: 0, baseY: 45 });
  t.deepEqual(vertices[4], { vertex: "e", level: 0, indexInLevel: 4, baseX: 0, baseY: 60 });
  t.deepEqual(vertices[5], { vertex: "f", level: 0, indexInLevel: 5, baseX: 0, baseY: 75 });
  t.deepEqual(vertices[6], { vertex: "g", level: 1, indexInLevel: 0, baseX: 17.5, baseY: 0 });
});

test("layout subgraph", (t) => {
  // arrange
  const graph = emptyGraph().addVertices(["a", "b", "c"]).directTo("a", "b").directTo("a", "c").directTo("b", "c");

  // do
  const { graphs: ret } = calculateLayouts(graph, { width: 10, height: 10 });

  // verify
  t.is(ret.length, 1);
  t.deepEqual(ret[0].size, { width: 45, height: 10 });

  const vertices = ret[0].vertices.sort((v1, v2) => v1.vertex.localeCompare(v2.vertex));
  t.deepEqual(vertices[0], { vertex: "a", level: 0, indexInLevel: 0, baseX: 0, baseY: 0 });
  t.deepEqual(vertices[1], { vertex: "b", level: 1, indexInLevel: 0, baseX: 17.5, baseY: 0 });
  t.deepEqual(vertices[2], { vertex: "c", level: 2, indexInLevel: 0, baseX: 35, baseY: 0 });
});

test("layout subgraphs", (t) => {
  // arrange
  const graph = emptyGraph()
    .addVertices(["a", "b", "c", "d", "e"])
    .directTo("a", "b")
    .directTo("a", "c")
    .directTo("b", "c")
    .directTo("d", "e");

  // do
  const { graphs: ret } = calculateLayouts(graph, { width: 10, height: 10 });

  // verify
  t.is(ret.length, 2);
  t.deepEqual(ret[0].size, { width: 45, height: 10 });
  t.deepEqual(ret[1].size, { width: 27.5, height: 10 });

  let vertices = ret[0].vertices.sort((v1, v2) => v1.vertex.localeCompare(v2.vertex));
  t.deepEqual(vertices[0], { vertex: "a", level: 0, indexInLevel: 0, baseX: 0, baseY: 0 });
  t.deepEqual(vertices[1], { vertex: "b", level: 1, indexInLevel: 0, baseX: 17.5, baseY: 0 });
  t.deepEqual(vertices[2], { vertex: "c", level: 2, indexInLevel: 0, baseX: 35, baseY: 0 });

  vertices = ret[1].vertices.sort((v1, v2) => v1.vertex.localeCompare(v2.vertex));
  t.deepEqual(vertices[0], { vertex: "d", level: 0, indexInLevel: 0, baseX: 0, baseY: 0 });
  t.deepEqual(vertices[1], { vertex: "e", level: 1, indexInLevel: 0, baseX: 17.5, baseY: 0 });
});

test("should merge graphs intersected each other", (t) => {
  // arrange
  const graph = emptyGraph()
    .addVertices(["a", "b", "c", "d", "e"])
    .directTo("a", "b")
    .directTo("a", "c")
    .directTo("b", "c")
    .directTo("d", "e")
    .directTo("d", "c");

  // do
  const { graphs: ret } = calculateLayouts(graph, { width: 10, height: 10 });

  // verify
  t.is(ret.length, 1);
  t.deepEqual(ret[0].size, { width: 45, height: 25 });

  const vertices = ret[0].vertices.sort((v1, v2) => v1.vertex.localeCompare(v2.vertex));
  t.deepEqual(vertices[0], { vertex: "a", level: 0, indexInLevel: 0, baseX: 0, baseY: 0 });
  t.deepEqual(vertices[1], { vertex: "b", level: 1, indexInLevel: 0, baseX: 17.5, baseY: 0 });
  t.deepEqual(vertices[2], { vertex: "c", level: 2, indexInLevel: 0, baseX: 35, baseY: 0 });
  t.deepEqual(vertices[3], { vertex: "d", level: 0, indexInLevel: 1, baseX: 0, baseY: 15 });
  t.deepEqual(vertices[4], { vertex: "e", level: 1, indexInLevel: 1, baseX: 17.5, baseY: 15 });
});
