import { Issue } from "@/model/issue";
import { Size } from "@/type";
import { BaseType, Selection, SimulationNodeDatum } from "d3";

// The type of common node object in issue graph
export type D3Node<T extends BaseType = null> = Selection<T, undefined, null, undefined>;

// The type of issueNode
export type IssueNode = Selection<BaseType | SVGGElement, LayoutedLeveledIssue, SVGGElement, undefined>;

export interface LayoutedLeveledVertex {
  vertex: string;
  level: number;
  indexInLevel: number;
  baseX: number;
  baseY: number;
}

export interface LayoutedLeveledIssue extends SimulationNodeDatum {
  issueKey: string;
  issue: Issue | undefined;
  level: number;
  indexInLevel: number;
  baseX: number;
  baseY: number;
}

export interface IssueLink {
  source: LayoutedLeveledIssue;
  target: LayoutedLeveledIssue;
  display?: boolean;
}

export interface Configuration {
  nodeSize: Size;

  canvasSize: Size;

  graphLayout: GraphLayout;
}

export const GraphLayout = Object.freeze({
  Vertical: "Vertical",
  Horizontal: "Horizontal",
} as const);
export type GraphLayout = typeof GraphLayout[keyof typeof GraphLayout];
