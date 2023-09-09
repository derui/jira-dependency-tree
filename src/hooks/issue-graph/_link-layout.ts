import { ISSUE_X_GAP, ISSUE_Y_GAP } from "./_issue-layout";
import { Relation } from "@/models/issue";
import { Position } from "@/type";
import { filterUndefined } from "@/utils/basic";
import { IssueModelWithLayout, LinkLayoutModel } from "@/view-models/graph-layout";

// width of stroke in pixel.
const STROKE_WIDTH = 2;
// rounding size in pixel
const ROUNDING_SIZE = 4;

const makePathCommand = function makePathCommand(
  relation: Relation,
  issueMap: Map<string, IssueModelWithLayout>,
): LinkLayoutModel | undefined {
  const inward = issueMap.get(relation.inwardIssue),
    outward = issueMap.get(relation.outwardIssue);

  if (!inward || !outward) {
    return;
  }

  const position: Position = {
    x: inward.position.x + inward.size.width,
    y: inward.position.y + inward.size.height / 2 - STROKE_WIDTH / 2,
  };

  const diffX = outward.meta.colIndex - inward.meta.colIndex;
  const diffY = outward.meta.rowIndex - inward.meta.rowIndex;
  const lengthX = ISSUE_X_GAP + (inward.size.width + ISSUE_X_GAP) * (diffX - 1);
  const lengthY = Math.abs((ISSUE_Y_GAP + inward.size.height) * diffY);

  let pathCommands = "";
  // outward is located after row from inward
  if (diffY > 0) {
    pathCommands = `M ${position.x},${position.y} h ${lengthX - ISSUE_X_GAP / 2 - ROUNDING_SIZE}
s ${ROUNDING_SIZE},0 ${ROUNDING_SIZE},0 ${ROUNDING_SIZE},${ROUNDING_SIZE}
v ${lengthY - ROUNDING_SIZE * 2}
s 0,${ROUNDING_SIZE} 0,${ROUNDING_SIZE} ${ROUNDING_SIZE},${ROUNDING_SIZE}
h ${ISSUE_X_GAP / 2 - ROUNDING_SIZE}
`;
  } else if (diffY < 0) {
    pathCommands = `M ${position.x},${position.y} h ${lengthX - ISSUE_X_GAP / 2 - ROUNDING_SIZE}
s ${ROUNDING_SIZE},0 ${ROUNDING_SIZE},0 ${ROUNDING_SIZE},-${ROUNDING_SIZE}
v -${lengthY - ROUNDING_SIZE * 2}
s 0,-${ROUNDING_SIZE} 0,-${ROUNDING_SIZE} ${ROUNDING_SIZE},-${ROUNDING_SIZE}
h ${ISSUE_X_GAP / 2 - ROUNDING_SIZE}
`;
  } else {
    pathCommands = `M ${position.x},${position.y} h ${lengthX}`;
  }

  return {
    pathCommands: pathCommands,
    meta: {
      startIssue: inward.issue.key,
      endIssue: outward.issue.key,
    },
  };
};

/**
 * layout links from relations and issue layout
 */
export const calculateLinkLayout = function calculateLinkLayout(
  relations: Relation[],
  issueLayouts: IssueModelWithLayout[],
) {
  const issueMap = new Map(issueLayouts.map((v) => [v.issue.key, v]));

  const filteredRelations = relations.filter((v) => {
    return issueMap.has(v.inwardIssue) && issueMap.has(v.outwardIssue);
  });

  return filteredRelations.map((v) => makePathCommand(v, issueMap)).filter(filterUndefined);
};
