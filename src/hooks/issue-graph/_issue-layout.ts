import { DirectedGraph } from "@/libs/depgraph/main";
import { Size } from "@/type";
import { IssueModel } from "@/view-models/issue";
import { IssueModelWithLayout } from "@/view-models/graph-layout";

export const ISSUE_SIZE: Size = { width: 200, height: 74 };
export const ISSUE_X_GAP = ISSUE_SIZE.width * 0.25;
export const ISSUE_Y_GAP = ISSUE_SIZE.height * 0.2;

// get subgraphs from a graph that contains whole issues
const getSubgraphs = (graph: DirectedGraph): DirectedGraph[] => {
  return graph.levelAt(0).map((vertex) => {
    const [subgraph] = graph.subgraphOf(vertex);

    return subgraph;
  });
};

const getColumnsOfGrid = (grid: unknown[][]): number => {
  let maximumHeightIndex = 0;

  for (const col of grid) {
    if (!col) {
      continue;
    }

    if (col.length > maximumHeightIndex) {
      maximumHeightIndex = col.length;
    }
  }

  return maximumHeightIndex;
};

const getHeightOfGrid = (grid: unknown[][]): number => {
  const maximumHeightIndex = getColumnsOfGrid(grid);

  return maximumHeightIndex * (ISSUE_Y_GAP + ISSUE_SIZE.height);
};

const layoutGridOfSubgraph = function layoutGridOfSubgraph(
  graph: DirectedGraph,
  layoutedIssues: Set<string>,
  issueMap: Map<string, IssueModel>,
) {
  const largestDepth = graph.maxDepth() - 1;
  const layout: string[][] = new Array(largestDepth);

  // make layout grid of graph.
  for (let depth = largestDepth; depth >= 0; depth--) {
    for (const vertex of graph.levelAt(depth)) {
      if (layoutedIssues.has(vertex) || !issueMap.has(vertex)) {
        break;
      }

      const verticesInLevel = (layout[depth] ??= []);
      verticesInLevel.push(vertex);
      layoutedIssues.add(vertex);
    }
  }

  return layout;
};

const gridToGraphLayout = function gridToGraphLayout(
  layout: string[][],
  issueMap: Map<string, IssueModel>,
  baseY: number,
  baseRowIndex: number,
): IssueModelWithLayout[] {
  return layout
    .map((v, colIdx) => {
      return v.map((issueKey, rowIdx) => {
        const issue = issueMap.get(issueKey);

        if (!issue) {
          throw Error(`Invalid path:key = ${issueKey}`);
        }

        return {
          issue,
          position: {
            x: colIdx * (ISSUE_X_GAP + ISSUE_SIZE.width),
            y: baseY + rowIdx * (ISSUE_Y_GAP + ISSUE_SIZE.height),
          },
          size: ISSUE_SIZE,
          meta: {
            rowIndex: rowIdx + baseRowIndex,
            colIndex: colIdx,
          },
        };
      });
    })
    .flat();
};

/**
 * get issue layouts from graph
 */
export const calculateIssueLayout = (graph: DirectedGraph, issues: IssueModel[]) => {
  const issueMap = new Map(issues.map((v) => [v.key, v]));
  const graphKey = new Set<string>();
  const subgraphs = getSubgraphs(graph)
    .filter((g) => {
      const key = Array.from(g.vertices).sort().join("$");

      if (graphKey.has(key)) {
        return false;
      } else {
        graphKey.add(key);
        return true;
      }
    })
    .sort((v1, v2) => {
      return v2.vertices.length - v1.vertices.length;
    });

  const layoutedIssues = new Set<string>();
  let accumulatedGridHeight = 0;
  let baseRowIndex = 0;

  return subgraphs.flatMap((g) => {
    const grid = layoutGridOfSubgraph(g, layoutedIssues, issueMap);
    const layout = gridToGraphLayout(grid, issueMap, accumulatedGridHeight, baseRowIndex);

    accumulatedGridHeight += getHeightOfGrid(grid);
    baseRowIndex += getColumnsOfGrid(grid);
    return layout;
  });
};
