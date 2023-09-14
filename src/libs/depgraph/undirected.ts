import deepEqual from "fast-deep-equal";
import { AdjacentMatrix, Edge, Vertex } from "./type";
import { DirectedGraph } from "./main";
import { constraint } from "@/utils/basic";

/**
 * An interface of undirected graph.
 */
export interface UndirectedGraph {
  /**
   * add a vertex into graph
   */
  addVertex(label: Vertex): UndirectedGraph;

  /**
   * add vertices into graph
   */
  addVertices(vertices: Vertex[]): UndirectedGraph;

  /**
   * get subgraph contains vertex.
   */
  subgraphOf(vertex: Vertex): UndirectedGraph;

  /**
   * add edge between vertices that are specified `a` and `b`
   */
  edge(a: Vertex, b: Vertex): UndirectedGraph;

  readonly edges: Edge[];
  readonly vertices: Vertex[];
}

const addVertex = (vertex: Vertex, original: Vertex[]): Vertex[] => {
  constraint(vertex.trim().length > 0);

  if (original.includes(vertex)) {
    return original;
  }

  return original.concat([vertex]);
};
const addVertices = (original: Vertex[], newVertices: Vertex[]): Vertex[] => {
  const _original = new Set(original);

  for (const v of newVertices) {
    _original.add(v);
  }

  return Array.from(_original);
};

const makeAdjacentMatrix = (edges: Edge[], vertices: string[]): AdjacentMatrix => {
  const matrix = vertices.reduce<AdjacentMatrix>((accum, vertex) => {
    accum[vertex] = new Set();
    return accum;
  }, {});

  edges.forEach(([a, b]) => {
    matrix[a].add(b);
    matrix[b].add(a);
  });

  return matrix;
};

/**
 * support function to check equality of edges
 */
const sameEdge = (a: Edge, b: Edge) => {
  const [a1, a2] = a;
  const [b1, b2] = b;

  return (a1 === b1 && a2 === b2) || (a1 === b2 && a2 === b1);
};

const addEdge = (edges: Edge[], a: Vertex, b: Vertex): Edge[] => {
  for (const [_a, _b] of edges) {
    if ((_a === a && _b === b) || (_a === b && _b === a)) {
      return edges;
    }
  }

  return edges.concat([[a, b]]);
};

// undirected graph-version dfs
const dfs = (mat: AdjacentMatrix, root: Vertex, work: (node: Vertex) => void) => {
  const seen = new Set<Vertex>();

  const recursiveDfs = (mat: AdjacentMatrix, node: Vertex) => {
    seen.add(node);

    work(node);

    const nextNodes = mat[node] || new Set();

    for (const nextNode of nextNodes) {
      if (seen.has(nextNode)) {
        continue;
      }

      recursiveDfs(mat, nextNode);
    }
  };

  return recursiveDfs(mat, root);
};

const edge = (a: Vertex, b: Vertex): Edge => {
  const array = [a, b].sort();

  return [array[0], array[1]];
};

const makeConsistEdges = (edges: Edge[]) => {
  const corrected: Array<Edge> = [];

  for (const [a, b] of edges) {
    if (corrected.some((edge) => sameEdge(edge, [a, b]))) {
      continue;
    }

    corrected.push(edge(a, b));
  }

  return corrected;
};

const makeGraph = (vertices: Vertex[], edges: Edge[]): UndirectedGraph => {
  const _edges = makeConsistEdges(edges);
  const adjMatrix = makeAdjacentMatrix(edges, vertices);

  return {
    addVertex(label) {
      return makeGraph(addVertex(label, vertices), edges);
    },

    addVertices(_vertices) {
      return makeGraph(addVertices(vertices, _vertices), edges);
    },

    edge(a, b) {
      constraint(vertices.includes(a));
      constraint(vertices.includes(b));
      constraint(a !== b);

      return makeGraph(vertices, addEdge(edges, a, b));
    },

    subgraphOf(vertex) {
      const _vertices = new Set<Vertex>();

      dfs(adjMatrix, vertex, (v) => {
        _vertices.add(v);
      });

      // collect related edges from edges
      const relatedEdges = Array.from(_vertices).reduce<Edge[]>((accum, v) => {
        const adjacents = adjMatrix[v];

        for (const adjacent of adjacents) {
          const _edge: Edge = [v, adjacent].sort() as Edge;
          if (accum.some((edge) => sameEdge(edge, _edge))) {
            continue;
          }
          accum.push(_edge);
        }

        return accum;
      }, []);

      return makeGraph(Array.from(_vertices), relatedEdges);
    },

    get edges() {
      return Array.from(_edges);
    },

    get vertices() {
      return Array.from(vertices);
    },
  };
};

export const emptyUndirectedGraph = () => {
  return makeGraph([], []);
};

/**
 * make undirected graph from directed graph
 */
export const fromDirectedGraph = (graph: DirectedGraph): UndirectedGraph => {
  return makeGraph(graph.vertices, graph.edges);
};

/**
 * check equality between g1 and g2
 */
export const isSameUndirectGraph = function isSameUndirectGraph(g1: UndirectedGraph, g2: UndirectedGraph) {
  return deepEqual(g1.vertices.sort(), g2.vertices.sort()) && deepEqual(g1.edges.flat().sort(), g2.edges.flat().sort());
};
