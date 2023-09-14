import { IssueModel } from "./issue";
import { IssueKey, IssueRelationId, Position, Size } from "@/type";

export interface IssueModelWithLayout {
  readonly issue: IssueModel;
  /**
   * position of issue. This position points left-top of it.
   */
  readonly position: Position;
  /**
   * size of issue.
   */
  readonly size: Size;
  readonly meta: {
    /**
     * row index of grid.
     */
    readonly rowIndex: number;

    /**
     * column index of grip
     */
    readonly colIndex: number;
  };
}

export interface LinkLayoutModel {
  /**
   * commands for path. User can pass this command to `d` attribute of <path> directly.
   */
  readonly pathCommands: string;

  /**
   * metadata for debugging.
   */
  readonly meta: {
    readonly relationId: IssueRelationId;
    readonly startIssue: IssueKey;
    readonly endIssue: IssueKey;
  };
}
