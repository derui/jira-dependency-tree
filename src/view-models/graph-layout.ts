import { IssueModel } from "./issue";
import { IssueKey, IssueRelationId, Position, Size } from "@/type";

export interface IssueModelWithLayout {
  issue: IssueModel;
  /**
   * position of issue. This position points left-top of it.
   */
  position: Position;
  /**
   * size of issue.
   */
  size: Size;
  meta: {
    /**
     * row index of grid.
     */
    rowIndex: number;

    /**
     * column index of grip
     */
    colIndex: number;
  };
}

export interface LinkLayoutModel {
  /**
   * commands for path. User can pass this command to `d` attribute of <path> directly.
   */
  pathCommands: string;

  /**
   * metadata for debugging.
   */
  meta: {
    relationId: IssueRelationId;
    startIssue: IssueKey;
    endIssue: IssueKey;
  };
}
