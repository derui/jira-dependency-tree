import { Issue } from "@/model/issue";
import { Size } from "@/type";
import { BaseType, Selection, SimulationNodeDatum } from "d3";

// The type of common node object in issue graph
export type D3Node<T extends BaseType = null> = Selection<T, undefined, null, undefined>;

// The type of issueNode
export type IssueNode = Selection<BaseType | SVGGElement, LayoutedLeveledIssue, SVGGElement, undefined>;

export type LayoutedLeveledVertex = {
  vertex: string;
  level: number;
  indexInLevel: number;
  baseX: number;
  baseY: number;
};

export type LayoutedLeveledIssue = {
  issueKey: string;
  issue: Issue | undefined;
  level: number;
  indexInLevel: number;
  baseX: number;
  baseY: number;
} & SimulationNodeDatum;

export type IssueLink = {
  source: LayoutedLeveledIssue;
  target: LayoutedLeveledIssue;
};

export interface Configuration {
  nodeSize: Size;

  canvasSize: Size;
}
