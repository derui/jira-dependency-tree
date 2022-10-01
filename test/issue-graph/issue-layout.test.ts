import { suite } from "uvu";
import * as assert from "uvu/assert";

import { emptyGraph } from "@/depgraph/main";
import { calculateLayouts } from "@/issue-graph/issue-layout";

const test = suite("issue-graph/issue-layout");

test("do not layout if given graph is empty", () => {
  // arrange
  const graph = emptyGraph();

  // do
  const ret = calculateLayouts(graph, { width: 10, height: 10 });

  // verify
  assert.is(ret.length, 1);
  assert.is(ret[0].vertices.length, 0);
});

test("layout orphan graphs", () => {
  // arrange
  const graph = emptyGraph().addVertices(["a", "b", "c"]);

  // do
  const ret = calculateLayouts(graph, { width: 10, height: 10 });

  // verify
  assert.is(ret.length, 1);
  assert.equal(ret[0].size, { width: 10, height: 40 });

  const vertices = ret[0].vertices.sort((v1, v2) => v1.vertex.localeCompare(v2.vertex));
  assert.equal(vertices[0], { vertex: "a", level: 0, indexInLevel: 0, x: 0, y: 0 });
  assert.equal(vertices[1], { vertex: "b", level: 0, indexInLevel: 1, x: 0, y: 15 });
  assert.equal(vertices[2], { vertex: "c", level: 0, indexInLevel: 2, x: 0, y: 30 });
});

test("layout orphan graphs with multi lines", () => {
  // arrange
  const graph = emptyGraph().addVertices(["a", "b", "c", "d", "e", "f", "g"]);

  // do
  const ret = calculateLayouts(graph, { width: 10, height: 10 });

  // verify
  assert.is(ret.length, 1);
  assert.equal(ret[0].size, { width: 27.5, height: 85 });

  const vertices = ret[0].vertices.sort((v1, v2) => v1.vertex.localeCompare(v2.vertex));
  assert.equal(vertices[0], { vertex: "a", level: 0, indexInLevel: 0, x: 0, y: 0 });
  assert.equal(vertices[1], { vertex: "b", level: 0, indexInLevel: 1, x: 0, y: 15 });
  assert.equal(vertices[2], { vertex: "c", level: 0, indexInLevel: 2, x: 0, y: 30 });
  assert.equal(vertices[3], { vertex: "d", level: 0, indexInLevel: 3, x: 0, y: 45 });
  assert.equal(vertices[4], { vertex: "e", level: 0, indexInLevel: 4, x: 0, y: 60 });
  assert.equal(vertices[5], { vertex: "f", level: 0, indexInLevel: 5, x: 0, y: 75 });
  assert.equal(vertices[6], { vertex: "g", level: 1, indexInLevel: 0, x: 17.5, y: 0 });
});

test.run();
