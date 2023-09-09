import deepEqual from "fast-deep-equal";
import type { AdjacentMatrix, Edge, Vertex } from "./type";
import { constraint, difference } from "@/utils/basic";

type NotHaveCycle = { kind: "NotHaveCycle" };
interface Cycle {
  cycle: Vertex[];
  next: Vertex;
}
export type ContainCycle = {
  kind: "ContainCycle";

  /**
   * cycles in graph. Each elements are cycle in graph.
   */
  cycles: Cycle[];
};
export type CycleDetection = NotHaveCycle | ContainCycle;

export interface DirectedGraph {
  // add vertex labelled by [label]
  addVertex(label: Vertex): DirectedGraph;

  // add some vertices at once
  addVertices(label: Vertex[]): DirectedGraph;

  // get vertices at level
  levelAt(level: number): Vertex[];

  // add edge that is directed [from] to [to]
  directTo(from: Vertex, to: Vertex): DirectedGraph;

  /**
   * remove direction from [from] to [to].
   */
  removeDirection(from: Vertex, to: Vertex): DirectedGraph;

  // Get adjacent vertices of [vertex]
  adjacent(vertex: Vertex): Vertex[];

  // Get subgraph that has the root is given vertex
  subgraphOf(vertex: Vertex): [DirectedGraph, CycleDetection];

  /**
   * depth of current graph
   */
  maxDepth(): number;

  /**
   * The union of the other graph. Return new graph.
   */
  union(graph: DirectedGraph): DirectedGraph;

  readonly edges: Edge[];
  readonly vertices: Vertex[];
}

const addVertex = (vertices: Vertex[], label: string) => {
  if (vertices.includes(label)) {
    return vertices;
  }

  vertices.push(label);
  return vertices;
};

const addVertices = (vertices: Vertex[], newVertices: Vertex[]) => {
  const current = new Set(vertices);

  for (const v of newVertices) {
    current.add(v);
  }

  return Array.from(current);
};

const makeAdjacentMatrix = (edges: Edge[], vertices: Vertex[]) => {
  const mat = vertices.reduce<AdjacentMatrix>((accum, vertex) => {
    accum[vertex] = new Set();
    return accum;
  }, {});

  edges.forEach(([from, to]) => {
    mat[from].add(to);
  });

  return mat;
};

const findRoots = (mat: AdjacentMatrix) => {
  const adjacents = new Set(
    Object.values(mat).reduce<Vertex[]>((accum, vertices) => {
      return accum.concat(Array.from(vertices));
    }, []),
  );

  const vertices = new Set(Object.keys(mat));

  return difference(vertices, adjacents);
};

const notHaveCycle = (): NotHaveCycle => {
  return {
    kind: "NotHaveCycle",
  };
};

const containCycle = (cycles: Cycle[]): ContainCycle => {
  return {
    kind: "ContainCycle",
    cycles: Array.from(cycles),
  };
};

const dfs = (mat: AdjacentMatrix, root: Vertex, work: (node: Vertex, depth: number, parent: Vertex | null) => void) => {
  const seen = new Set<Vertex>();
  const finished = new Set<Vertex>();
  const stack: Vertex[] = [];
  const cycles: Cycle[] = [];
  let cycle: CycleDetection = notHaveCycle();

  const recursiveDfs = (mat: AdjacentMatrix, node: Vertex, depth: number, parent: Vertex | null) => {
    seen.add(node);
    stack.push(node);

    work(node, depth, parent);

    const nextNodes = mat[node] || new Set();

    for (const nextNode of nextNodes) {
      // prevent reflex
      if (nextNode === parent) {
        continue;
      }

      if (seen.has(nextNode) && !finished.has(nextNode)) {
        cycles.push({
          cycle: Array.from(stack),
          next: nextNode,
        });
        cycle = containCycle(cycles);
        continue;
      }

      recursiveDfs(mat, nextNode, depth + 1, node);
    }

    stack.pop();
    finished.add(node);

    return cycle;
  };

  return recursiveDfs(mat, root, 0, null);
};

const largestLevelOf = (mat: AdjacentMatrix, target: Vertex) => {
  let largestLevel = 0;

  findRoots(mat).forEach((root) => {
    dfs(mat, root, (node, depth) => {
      if (node === target && depth >= largestLevel) {
        largestLevel = depth;
      }
    });
  });

  return largestLevel;
};

const makeGraph = (edges: Edge[], vertices: Vertex[]): DirectedGraph => {
  const adjMatrix = makeAdjacentMatrix(edges, vertices);

  return {
    addVertex(label) {
      constraint(label.trim().length > 0);
      const vertices = addVertex(this.vertices, label);

      return makeGraph(this.edges, vertices);
    },

    addVertices(vertices) {
      const newVertices = addVertices(
        this.vertices,
        vertices.filter((v) => v.trim().length > 0),
      );

      return makeGraph(this.edges, newVertices);
    },

    levelAt(level: number) {
      constraint(level >= 0);

      const nodesAtLevel = new Set<Vertex>();
      const largestLevelMap = new Map<string, number>();

      findRoots(adjMatrix).forEach((root) => {
        dfs(adjMatrix, root, (node) => {
          if (!largestLevelMap.has(node)) {
            largestLevelMap.set(node, largestLevelOf(adjMatrix, node));
          }

          if (largestLevelMap.get(node) === level) {
            nodesAtLevel.add(node);
          }
        });
      });

      return Array.from(nodesAtLevel);
    },

    subgraphOf(subRoot: Vertex): [DirectedGraph, CycleDetection] {
      let subgraph = emptyDirectedGraph();

      const cycle = dfs(adjMatrix, subRoot, (node) => {
        subgraph = subgraph.addVertex(node);
      });

      subgraph = subgraph.vertices.reduce((graph, vertex) => {
        return this.adjacent(vertex).reduce((g, v) => {
          return g.directTo(vertex, v);
        }, graph);
      }, subgraph);

      return [subgraph, cycle];
    },

    union(graph) {
      const edges = Array.from(this.edges);
      const vertices = new Set([...this.vertices, ...graph.vertices]);

      for (const edge of graph.edges) {
        if (edges.every((e) => !deepEqual(e, edge))) {
          edges.push(edge);
        }
      }

      return makeGraph(edges, Array.from(vertices));
    },

    directTo(from, to) {
      const edges = this.edges.concat([[from, to]]);

      return makeGraph(edges, this.vertices);
    },

    removeDirection(from, to) {
      const edges = this.edges.filter(([_from, _to]) => !(from === _from && to === _to));

      return makeGraph(edges, this.vertices);
    },

    adjacent(vertex) {
      const set = new Set(adjMatrix[vertex] ?? []);

      return Array.from(set).sort();
    },

    maxDepth() {
      const roots = this.levelAt(0);

      if (roots.length === 0) {
        return 0;
      }

      let maxDepth = 0;

      for (const root of roots) {
        dfs(adjMatrix, root, (_node, depth) => {
          if (maxDepth <= depth) {
            maxDepth = depth + 1;
          }
        });
      }

      return maxDepth;
    },

    get edges() {
      return Array.from(edges);
    },

    get vertices() {
      return Array.from(vertices);
    },
  };
};

export const emptyDirectedGraph = (): DirectedGraph => {
  return makeGraph([], []);
};
