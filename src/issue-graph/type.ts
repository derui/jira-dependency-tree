import { BaseType, Selection, SimulationNodeDatum } from "d3";
import { Issue } from "@/model/issue";
import { IssueKey, Size } from "@/type";
import { Rect } from "@/util/basic";

// The type of common node object in issue graph
export type D3Node<T extends BaseType = BaseType, V = undefined> = Selection<T, V, null, undefined>;

// The type of issueNode
export type IssueNode = Selection<BaseType, LayoutedLeveledIssue, BaseType, undefined>;

// The type of tree frame
export type TreeFrame = Selection<BaseType, LayoutedLeveledIssueUnit, BaseType, undefined>;

export interface LayoutedLeveledVertex {
  readonly vertex: string;
  readonly level: number;
  readonly indexInLevel: number;
  readonly baseX: number;
  readonly baseY: number;
}

export interface LayoutedLeveledIssue extends SimulationNodeDatum {
  readonly issueKey: string;
  readonly issue: Issue | undefined;
  readonly subIssues: IssueKey[];
  readonly level: number;
  readonly indexInLevel: number;
  readonly baseX: number;
  readonly baseY: number;
  focusing?: "focused" | "unfocused" | "initial";
}

export type LayoutedLeveledIssueUnit = {
  issues: LayoutedLeveledIssue[];
  unitRect: Rect;
};

export interface IssueLink {
  readonly source: LayoutedLeveledIssue;
  readonly target: LayoutedLeveledIssue;
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
