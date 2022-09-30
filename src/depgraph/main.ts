import { constraint, difference } from "@/util/basic";
import deepEqual from "fast-deep-equal";

type Edge = [string, string];
type Vertex = string;

type AdjacentMatrix = {
  [k: Vertex]: Set<Vertex>;
};

export type Graph = {
  // add vertex labelled by [label]
  addVertex(label: Vertex): Graph;

  // add some vertices at once
  addVertices(label: Vertex[]): Graph;

  // get vertices at level
  levelAt(level: number): Vertex[];

  // add edge that is directed [from] to [to]
  directTo(from: Vertex, to: Vertex): Graph;

  // Get adjacent vertices of [vertex]
  adjacent(vertex: Vertex): Vertex[];

  // Get subgraph that has the root is given vertex
  subgraphOf(vertex: Vertex): Graph;

  // Return result that given graph is intersected
  intersect(graph: Graph): boolean;

  // Return new graph is merged with graph. If given graph is not intersected with this, return null.
  merge(graph: Graph): Graph | null;

  readonly edges: Edge[];
  readonly vertices: Vertex[];
};

const addVertex = function addVertex(vertices: Vertex[], label: string) {
  if (vertices.includes(label)) {
    return vertices;
  }

  vertices.push(label);
  return vertices;
};

const addVertices = function addVertex(vertices: Vertex[], newVertices: Vertex[]) {
  const current = new Set(vertices);

  for (const v of newVertices) {
    current.add(v);
  }

  return Array.from(current);
};

const makeAdjacentMatrix = function makeAdjacentMatrix(edges: Edge[], vertices: Vertex[]) {
  const mat = vertices.reduce<AdjacentMatrix>((accum, vertex) => {
    accum[vertex] = new Set();
    return accum;
  }, {});

  edges.forEach(([from, to]) => {
    mat[from].add(to);
  });

  return mat;
};

const findRoots = function findRoots(mat: AdjacentMatrix) {
  const adjacents = new Set(
    Object.values(mat).reduce<Vertex[]>((accum, vertices) => {
      return accum.concat(Array.from(vertices));
    }, [])
  );

  const vertices = new Set(Object.keys(mat));

  return difference(vertices, adjacents);
};

const dfs = function dfs(mat: AdjacentMatrix, root: Vertex, work: (node: Vertex, depth: number) => void) {
  const recursiveDfs = (mat: AdjacentMatrix, node: Vertex, depth: number, seen: Set<Vertex>) => {
    work(node, depth);

    const nextNodes = mat[node] || new Set();

    for (const nextNode of nextNodes) {
      if (seen.has(nextNode)) {
        continue;
      }
      seen.add(nextNode);
      recursiveDfs(mat, nextNode, depth + 1, seen);
    }
  };

  recursiveDfs(mat, root, 0, new Set());
};

const largestLevelOf = function largestLevelOf(mat: AdjacentMatrix, target: Vertex) {
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

const makeGraph = function makeGraph(edges: Edge[], vertices: Vertex[]): Graph {
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
        vertices.filter((v) => v.trim().length > 0)
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

          if (largestLevelMap.get(node)! === level) {
            nodesAtLevel.add(node);
          }
        });
      });

      return Array.from(nodesAtLevel);
    },

    subgraphOf(subRoot: Vertex): Graph {
      let subgraph = emptyGraph();

      dfs(adjMatrix, subRoot, (node) => {
        subgraph = subgraph.addVertex(node);
      });

      return subgraph.vertices.reduce((graph, vertex) => {
        return this.adjacent(vertex).reduce((g, v) => {
          return g.directTo(vertex, v);
        }, graph);
      }, subgraph);
    },

    intersect(graph: Graph) {
      for (const edgeThis of this.edges) {
        for (const edgeOther of graph.edges) {
          if (deepEqual(edgeThis, edgeOther)) {
            return true;
          }
        }
      }

      return false;
    },

    merge(graph: Graph) {
      if (!this.intersect(graph)) {
        return null;
      }

      const edges = Array.from(this.edges);
      const vertices = new Set([...this.vertices, ...graph.vertices]);

      for (const edge of graph.edges) {
        if (!edges.some((e) => deepEqual(e, edge))) {
          edges.push(edge);
        }
      }

      return makeGraph(edges, Array.from(vertices));
    },

    directTo(from, to) {
      const edges = this.edges.concat([[from, to]]);

      return makeGraph(edges, this.vertices);
    },

    adjacent(vertex) {
      const set = new Set(adjMatrix[vertex] ?? []);

      return Array.from(set).sort();
    },

    get edges() {
      return Array.from(edges);
    },

    get vertices() {
      return Array.from(vertices);
    },
  };
};

export const emptyGraph = function emptyGraph(): Graph {
  return makeGraph([], []);
};
