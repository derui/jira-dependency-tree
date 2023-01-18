import { test, expect } from "vitest";

import { emptyGraph } from "@/depgraph/main";
import { calculateLayouts } from "@/issue-graph/issue-layout";

test("do not layout if given graph is empty", () => {
  // arrange
  const graph = emptyGraph();

  // do
  const { graphs, orphans } = calculateLayouts(graph, { width: 10, height: 10 });

  // verify
  expect(graphs).toHaveLength(0);
  expect(orphans).toBeUndefined();
});

test("layout orphan graphs", () => {
  // arrange
  const graph = emptyGraph().addVertices(["a", "b", "c"]);

  // do
  const { orphans: ret } = calculateLayouts(graph, { width: 10, height: 10 });

  // verify
  expect(ret?.size).toEqual({ width: 10, height: 40 });

  const vertices = ret?.vertices?.sort((v1, v2) => v1.vertex.localeCompare(v2.vertex));
  expect(vertices?.[0]).toEqual({ vertex: "a", level: 0, indexInLevel: 0, baseX: 0, baseY: 0 });
  expect(vertices?.[1]).toEqual({ vertex: "b", level: 0, indexInLevel: 1, baseX: 0, baseY: 15 });
  expect(vertices?.[2]).toEqual({ vertex: "c", level: 0, indexInLevel: 2, baseX: 0, baseY: 30 });
});

test("layout orphan graphs with multi lines", () => {
  // arrange
  const graph = emptyGraph().addVertices(["a", "b", "c", "d", "e", "f", "g"]);

  // do
  const { orphans: ret } = calculateLayouts(graph, { width: 10, height: 10 });

  // verify
  expect(ret?.size).toEqual({ width: 27.5, height: 85 });

  const vertices = ret?.vertices?.sort((v1, v2) => v1.vertex.localeCompare(v2.vertex));
  expect(vertices?.[0]).toEqual({ vertex: "a", level: 0, indexInLevel: 0, baseX: 0, baseY: 0 });
  expect(vertices?.[1]).toEqual({ vertex: "b", level: 0, indexInLevel: 1, baseX: 0, baseY: 15 });
  expect(vertices?.[2]).toEqual({ vertex: "c", level: 0, indexInLevel: 2, baseX: 0, baseY: 30 });
  expect(vertices?.[3]).toEqual({ vertex: "d", level: 0, indexInLevel: 3, baseX: 0, baseY: 45 });
  expect(vertices?.[4]).toEqual({ vertex: "e", level: 0, indexInLevel: 4, baseX: 0, baseY: 60 });
  expect(vertices?.[5]).toEqual({ vertex: "f", level: 0, indexInLevel: 5, baseX: 0, baseY: 75 });
  expect(vertices?.[6]).toEqual({ vertex: "g", level: 1, indexInLevel: 0, baseX: 17.5, baseY: 0 });
});

test("layout subgraph", () => {
  // arrange
  const graph = emptyGraph().addVertices(["a", "b", "c"]).directTo("a", "b").directTo("a", "c").directTo("b", "c");

  // do
  const { graphs: ret } = calculateLayouts(graph, { width: 10, height: 10 });

  // verify
  expect(ret).toHaveLength(1);
  expect(ret[0].size).toEqual({ width: 45, height: 10 });

  const vertices = ret[0].vertices.sort((v1, v2) => v1.vertex.localeCompare(v2.vertex));
  expect(vertices[0]).toEqual({ vertex: "a", level: 0, indexInLevel: 0, baseX: 0, baseY: 0 });
  expect(vertices[1]).toEqual({ vertex: "b", level: 1, indexInLevel: 0, baseX: 17.5, baseY: 0 });
  expect(vertices[2]).toEqual({ vertex: "c", level: 2, indexInLevel: 0, baseX: 35, baseY: 0 });
});

test("layout subgraphs", () => {
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
  expect(ret).toHaveLength(2);
  expect(ret[0].size).toEqual({ width: 45, height: 10 });
  expect(ret[1].size).toEqual({ width: 27.5, height: 10 });

  let vertices = ret[0].vertices.sort((v1, v2) => v1.vertex.localeCompare(v2.vertex));
  expect(vertices[0]).toEqual({ vertex: "a", level: 0, indexInLevel: 0, baseX: 0, baseY: 0 });
  expect(vertices[1]).toEqual({ vertex: "b", level: 1, indexInLevel: 0, baseX: 17.5, baseY: 0 });
  expect(vertices[2]).toEqual({ vertex: "c", level: 2, indexInLevel: 0, baseX: 35, baseY: 0 });

  vertices = ret[1].vertices.sort((v1, v2) => v1.vertex.localeCompare(v2.vertex));
  expect(vertices[0]).toEqual({ vertex: "d", level: 0, indexInLevel: 0, baseX: 0, baseY: 0 });
  expect(vertices[1]).toEqual({ vertex: "e", level: 1, indexInLevel: 0, baseX: 17.5, baseY: 0 });
});

test("should merge graphs intersected each other", () => {
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
  expect(ret).toHaveLength(1);
  expect(ret[0].size).toEqual({ width: 45, height: 25 });

  const vertices = ret[0].vertices.sort((v1, v2) => v1.vertex.localeCompare(v2.vertex));
  expect(vertices[0]).toEqual({ vertex: "a", level: 0, indexInLevel: 0, baseX: 0, baseY: 0 });
  expect(vertices[1]).toEqual({ vertex: "b", level: 1, indexInLevel: 0, baseX: 17.5, baseY: 0 });
  expect(vertices[2]).toEqual({ vertex: "c", level: 2, indexInLevel: 0, baseX: 35, baseY: 0 });
  expect(vertices[3]).toEqual({ vertex: "d", level: 0, indexInLevel: 1, baseX: 0, baseY: 15 });
  expect(vertices[4]).toEqual({ vertex: "e", level: 1, indexInLevel: 1, baseX: 17.5, baseY: 15 });
});
