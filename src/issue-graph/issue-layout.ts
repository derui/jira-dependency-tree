import { Graph } from "@/depgraph/main";
import { Position, Size } from "@/type";
import { LayoutedLeveledVertex } from "@/issue-graph/type";

// get subgraphs from a graph that contains whole issues
const getSubgraphs = function getSubgraphs(graph: Graph): Graph[] {
  const roots = graph.levelAt(0);

  return roots.reduce<Graph[]>((graphs, root) => {
    const subgraph = graph.subgraphOf(root);

    if (!graphs.some((g) => g.intersect(subgraph))) {
      graphs.push(subgraph);
      return graphs;
    }

    return graphs.map((g) => {
      return g.merge(subgraph) ?? g;
    });
  }, []);
};

// layout of a graph.
type LayoutedGraph = {
  center: Position;
  size: Size;
  vertices: LayoutedLeveledVertex[];
};

const calculateWidth = function calculateWidth(level: number, nodeSize: Size): number {
  const betweenX = nodeSize.width * 0.75;
  return level * nodeSize.width + betweenX * Math.max(0, level - 1);
};

const calculateHeight = function calculateHeight(level: number, nodeSize: Size): number {
  const betweenY = nodeSize.height * 0.5;
  return level * nodeSize.height + betweenY * Math.max(0, level - 1);
};

const calculateX = function calculateX(level: number, nodeSize: Size): number {
  const betweenX = nodeSize.width * 0.75;
  return level * nodeSize.width + betweenX * level;
};

const calculateY = function calculateY(level: number, nodeSize: Size): number {
  const betweenY = nodeSize.height * 0.5;
  return level * nodeSize.height + betweenY * level;
};

const layoutGraph = function layoutGraph(graph: Graph, nodeSize: Size): LayoutedGraph {
  const verticesSize = graph.vertices.length;
  let largestLevel = [0, 0];
  let leveledVertices: (string[] | undefined)[] = [];

  for (let level = 0; level < verticesSize; level++) {
    const vertices = graph.levelAt(level);

    if (vertices.length > largestLevel[1]) {
      largestLevel = [level, vertices.length];
    }

    if (vertices.length) {
      leveledVertices[level] = vertices;
    }
  }

  const sizeOfGraph: Size = {
    height: calculateHeight(largestLevel[1], nodeSize),
    width: calculateWidth(leveledVertices.length, nodeSize),
  };
  const layoutedVertices = leveledVertices
    .map((vertices, level) => {
      if (!vertices) {
        return [];
      }

      return vertices.map((vertex, index) => {
        return {
          vertex,
          level,
          indexInLevel: index,
          baseX: calculateX(level, nodeSize),
          baseY: calculateY(index, nodeSize),
        };
      });
    })
    .flat();

  return {
    center: { x: sizeOfGraph.width / 2, y: sizeOfGraph.height / 2 },
    size: sizeOfGraph,
    vertices: layoutedVertices,
  };
};

const layoutOrphanGraphs = function layoutOrphanGraphs(graphs: Graph[], nodeSize: Size): LayoutedGraph {
  const countPerLine = 6;
  let copiedGraphs = Array.from(graphs);
  const graphLines = [];

  while (copiedGraphs.length > 0) {
    graphLines.push(copiedGraphs.slice(0, countPerLine));
    copiedGraphs = copiedGraphs.slice(countPerLine);
  }

  const lineCount = graphLines.length;

  const vertices = graphLines.flatMap((graphLine, level) => {
    return graphLine.map((g, indexInLevel) => {
      return {
        vertex: g.vertices[0],
        level,
        indexInLevel,
        baseX: calculateX(level, nodeSize),
        baseY: calculateY(indexInLevel, nodeSize),
      };
    });
  });

  let sizeOfGraph = { height: calculateHeight(countPerLine, nodeSize), width: calculateWidth(lineCount, nodeSize) };

  if (lineCount === 1) {
    sizeOfGraph = { ...sizeOfGraph, height: calculateHeight(vertices.length, nodeSize) };
  }

  return {
    center: { x: sizeOfGraph.width / 2, y: sizeOfGraph.height / 2 },
    size: sizeOfGraph,
    vertices,
  };
};

export const calculateLayouts = function calculateLayouts(graph: Graph, nodeSize: Size) {
  const subgraphs = getSubgraphs(graph);

  const orphanGraphs = subgraphs.filter((g) => g.vertices.length === 1);
  const otherGraphs = subgraphs.filter((g) => g.vertices.length > 1);

  const layoutedOrphanGraph = layoutOrphanGraphs(orphanGraphs, nodeSize);
  const layoutedGraphs = otherGraphs.map((g) => layoutGraph(g, nodeSize));

  return {
    graphs: layoutedGraphs,
    orphans: orphanGraphs.length ? layoutedOrphanGraph : undefined,
  };
};
