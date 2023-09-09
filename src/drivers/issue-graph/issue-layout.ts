import { LayoutedLeveledVertex } from "./type";
import { DirectedGraph } from "@/libs/depgraph/main";
import { Position, Size } from "@/type";
import { fromDirectedGraph, UndirectedGraph } from "@/libs/depgraph/undirected";
import { Vertex } from "@/libs/depgraph/type";

const getGroups = (graph: DirectedGraph): UndirectedGraph[] => {
  const undirected = fromDirectedGraph(graph);

  const roots = graph.levelAt(0);

  const groups = roots.reduce<UndirectedGraph[]>((accum, vertex) => {
    if (accum.some((g) => g.vertices.includes(vertex))) {
      return accum;
    }

    accum.push(undirected.subgraphOf(vertex));
    return accum;
  }, []);

  return groups;
};
// get subgraphs from a graph that contains whole issues
const getSubgraphs = (graph: DirectedGraph): Record<Vertex, DirectedGraph> => {
  return graph.levelAt(0).reduce<Record<Vertex, DirectedGraph>>((graphs, vertex) => {
    const [subgraph] = graph.subgraphOf(vertex);

    graphs[vertex] = subgraph;

    return graphs;
  }, {});
};

// layout of a graph.
export type LayoutedGraph = {
  center: Position;
  size: Size;
  vertices: LayoutedLeveledVertex[];
};

const calculateWidth = (level: number, nodeSize: Size): number => {
  const betweenX = nodeSize.width * 0.75;
  return level * nodeSize.width + betweenX * Math.max(0, level - 1);
};

const calculateHeight = (level: number, nodeSize: Size): number => {
  const betweenY = nodeSize.height * 0.5;
  return level * nodeSize.height + betweenY * Math.max(0, level - 1);
};

const calculateX = (level: number, nodeSize: Size): number => {
  const betweenX = nodeSize.width * 0.75;
  return level * nodeSize.width + betweenX * level;
};

const calculateY = (level: number, nodeSize: Size): number => {
  const betweenY = nodeSize.height * 0.5;
  return level * nodeSize.height + betweenY * level;
};

const layoutGraph = (graphs: Record<Vertex, DirectedGraph>, nodeSize: Size): LayoutedGraph => {
  const layoutedVertices: Record<Vertex, Position> = {};
  const roots = Object.entries(graphs).sort(([, g1], [, g2]) => g2.maxDepth() - g1.maxDepth());

  let levelOfGraph = 0;

  for (const [root, graph] of roots) {
    const depth = graph.maxDepth();
    let largestCountOfVertexInLevel = 1;

    layoutedVertices[root] = { x: 0, y: levelOfGraph };

    for (let level = 1; level < depth; level++) {
      const vertices = graph.levelAt(level);

      if (vertices.length === 0) {
        break;
      }

      let countVertexInLevel = 0;
      vertices.forEach((vertex) => {
        const alreadyLayouted = layoutedVertices[vertex];
        if (alreadyLayouted && alreadyLayouted.x >= level) {
          return;
        }

        layoutedVertices[vertex] = { x: level, y: levelOfGraph + countVertexInLevel };
        countVertexInLevel++;
      });

      if (largestCountOfVertexInLevel < countVertexInLevel) {
        largestCountOfVertexInLevel = countVertexInLevel;
      }
    }

    levelOfGraph += largestCountOfVertexInLevel;
  }

  const layoutCauculated = Object.entries(layoutedVertices).map(([vertex, position]) => {
    return {
      vertex,
      level: position.x,
      indexInLevel: position.y,
      baseX: calculateX(position.x, nodeSize),
      baseY: calculateY(position.y, nodeSize),
    };
  });

  const largestLevel = Object.values(layoutedVertices).reduce((a, b) => (a.x > b.x ? a : b)).x;
  const largestLevelInIndex = Object.values(layoutedVertices).reduce((a, b) => (a.y > b.y ? a : b)).y;
  const sizeOfGraph: Size = {
    height: calculateHeight(largestLevelInIndex + 1, nodeSize),
    width: calculateWidth(largestLevel + 1, nodeSize),
  };

  return {
    center: { x: sizeOfGraph.width / 2, y: sizeOfGraph.height / 2 },
    size: sizeOfGraph,
    vertices: layoutCauculated,
  };
};

const layoutOrphanGraphs = (graphs: UndirectedGraph[], nodeSize: Size): LayoutedGraph => {
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

export const calculateLayouts = (graph: DirectedGraph, nodeSize: Size) => {
  const groups = getGroups(graph);
  const subgraphs = getSubgraphs(graph);

  const orphanGraphs = groups.filter((g) => g.vertices.length === 1);
  const otherGraphs = groups.filter((g) => g.vertices.length > 1);

  const layoutedOrphanGraph = layoutOrphanGraphs(orphanGraphs, nodeSize);
  const layoutedGraphs = otherGraphs.map((g) => {
    const _subgraphs = Object.entries(subgraphs).filter(([k]) => g.vertices.includes(k));
    return layoutGraph(Object.fromEntries(_subgraphs), nodeSize);
  });

  return {
    graphs: layoutedGraphs,
    orphans: orphanGraphs.length ? layoutedOrphanGraph : undefined,
  };
};
