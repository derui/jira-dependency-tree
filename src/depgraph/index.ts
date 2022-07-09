import { difference } from "@/util";

type Edge = [string, string];
type Vertex = string;

type AdjacentMatrix = {
  [k: Vertex]: Set<Vertex>;
};

type Graph = {
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

    for (const nextNode of mat[node]) {
      if (seen.has(nextNode)) {
        continue;
      }
      seen.add(nextNode);
      recursiveDfs(mat, nextNode, depth + 1, seen);
    }
  };

  recursiveDfs(mat, root, 0, new Set());
};

const makeGraph = function makeGraph(edges: Edge[], vertices: Vertex[]): Graph {
  const adjMatrix = makeAdjacentMatrix(edges, vertices);

  return {
    addVertex(label) {
      const vertices = addVertex(this.vertices, label);

      return makeGraph(this.edges, vertices);
    },

    addVertices(vertices) {
      const newVertices = addVertices(this.vertices, vertices);

      return makeGraph(this.edges, newVertices);
    },

    levelAt(level: number) {
      const nodesAtLevel = new Set<Vertex>();

      findRoots(adjMatrix).forEach((root) => {
        dfs(adjMatrix, root, (node, depth) => {
          if (depth === level) {
            nodesAtLevel.add(node);
          }
        });
      });

      return Array.from(nodesAtLevel);
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
