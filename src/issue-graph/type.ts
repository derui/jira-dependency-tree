import { BaseType, Selection, SimulationNodeDatum } from "d3";
import { Issue } from "@/model/issue";
import { Size } from "@/type";
import { Rect } from "@/util/basic";

// The type of common node object in issue graph
export type D3Node<T extends BaseType = BaseType, V = undefined> = Selection<T, V, null, undefined>;

// The type of issueNode
export type IssueNode = Selection<BaseType, LayoutedLeveledIssue, BaseType, undefined>;

// The type of tree frame
export type TreeFrame = Selection<BaseType, LayoutedLeveledIssueUnit, BaseType, undefined>;

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
  focusing?: "focused" | "unfocused" | "initial";
}

export type LayoutedLeveledIssueUnit = {
  issues: LayoutedLeveledIssue[];
  unitRect: Rect;
};

export interface IssueLink {
  source: LayoutedLeveledIssue;
  target: LayoutedLeveledIssue;
  relatedFocusingIssue?: boolean;
}

export interface Configuration {
  nodeSize: Size;

  canvasSize: Size;

  graphLayout: GraphLayout;

  onIssueClick: (key: string) => void;
}

export const GraphLayout = Object.freeze({
  Vertical: "Vertical",
  Horizontal: "Horizontal",
} as const);
export type GraphLayout = typeof GraphLayout[keyof typeof GraphLayout];

/// simple callback when to need restart
export type Restarter<V, T = unknown> = (data: T) => V;
