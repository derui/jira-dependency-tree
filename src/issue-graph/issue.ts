import * as d3 from "d3";
import { makeTextMeasure } from "./text-measure";
import { Project } from "@/model/project";
import { Position, StatusCategory } from "@/type";
import { Configuration, D3Node, IssueNode, LayoutedLeveledIssue, Restarter } from "@/issue-graph/type";

const IssueSizes = {
  paddingX: 8,
  paddingY: 4,
  textHeight: 20,
  iconSize: 16,
  subIssueNotificationHeight: 28,
  subIssueHighlightHeight: 20,
} as const;

const IssuePositions = {
  Key: {
    x: IssueSizes.paddingX,
    y: IssueSizes.paddingY,
  },
  Link: {
    x: (configuration: Configuration) =>
      configuration.nodeSize.width - IssueSizes.paddingX * 2 - IssueSizes.iconSize / 2,
    y: IssueSizes.paddingY * 2,
  },
  Summary: {
    x: IssueSizes.paddingX,
    y: IssueSizes.paddingY + IssueSizes.textHeight,
  },
  Status: {
    x: IssueSizes.paddingX + IssueSizes.paddingX / 2,
    y: IssueSizes.paddingY * 3 + IssueSizes.textHeight * 2,
  },
  SubIssueNotification: {
    x: 0,
    y: IssueSizes.paddingY * 5 + IssueSizes.textHeight * 3,
  },
} as const;

const buildIssueNode = (container: IssueNode, project: Project, configuration: Configuration) => {
  const measure = makeTextMeasure('13.5px "Noto Sans JP"');

  const node = container
    .enter()
    .append("svg:g")
    .attr("data-issue-key", (d) => d.issueKey)
    .classed("graph-issue", () => true)
    .classed("transition-opacity", () => true);

  node
    .append("rect")
    .attr("class", (d) => {
      const classes = ["stroke-secondary1-400", "fill-white", "transition-stroke", "hover:stroke-secondary1-500"];

      if (!d.issue) {
        classes.push("stroke-primary-400");
      }

      return classes.join(" ");
    })
    .attr("stroke-size", 1)
    .attr("width", configuration.nodeSize.width)
    .attr("height", (d) => {
      if (d.subIssues.length > 0) {
        return configuration.nodeSize.height + IssueSizes.subIssueNotificationHeight;
      }

      return configuration.nodeSize.height;
    })
    .attr("rx", 4.0)
    .attr("ry", 4.0);

  // issue key
  node
    .append("text")
    .attr("class", "issue-key fill-secondary1-500")
    .attr("y", IssueSizes.paddingY)
    .attr("x", IssueSizes.paddingX)
    .text((d) => d.issueKey);

  // issue link
  node
    .append("svg:image")
    .attr("class", (d) => {
      const classes = ["cursor-pointer"];

      if (!d.issue) {
        classes.push("hidden");
      }

      return classes.join(" ");
    })
    .attr("y", IssueSizes.paddingY * 2)
    .attr("x", configuration.nodeSize.width - IssueSizes.paddingX * 2 - IssueSizes.iconSize / 2)
    .attr("width", IssueSizes.iconSize)
    .attr("height", IssueSizes.iconSize)
    .attr("xlink:href", "/assets/svg/tablar-icons/door-exit.svg")
    .on("click", (e, d) => {
      if (d.issue) {
        e.preventDefault();
        e.stopPropagation();

        const url = new URL(d.issue.selfUrl);
        window.open(`${url.origin}/browse/${d.issueKey}`, "_blank");
      }
    });

  // issue summary
  const issueWidth = configuration.nodeSize.width - IssueSizes.paddingX * 2;
  node
    .append("text")
    .attr("class", "issue-summary fill-secondary1-500")
    .attr("y", IssueSizes.paddingY + IssueSizes.textHeight)
    .attr("x", IssueSizes.paddingX)
    .text((d) => {
      if (d.issue) {
        return measure.chopTextIncludedWidthOf(d.issue.summary, issueWidth);
      }

      return "";
    });

  // issue status
  node
    .append("text")
    .attr("class", "issue-node__status p-1")
    .attr("x", IssueSizes.paddingX + IssueSizes.paddingX / 2)
    .attr("y", IssueSizes.paddingY * 3 + IssueSizes.textHeight * 2)
    .attr("filter", (d) => {
      if (!d.issue) return null;

      const status = project.statuses[d.issue.statusId];
      switch (status?.statusCategory) {
        case StatusCategory.TODO:
          return "url(#todo-bg)";
        case StatusCategory.IN_PROGRESS:
          // secondary-1-1
          return "url(#in-progress-bg)";
        case StatusCategory.DONE:
          return "url(#done-bg)";
        default:
          break;
      }

      return null;
    })
    .text((d) => {
      if (!d.issue) {
        return "";
      }

      const status = project.statuses[d.issue.statusId];
      return status?.name ?? "";
    });

  // sub issue notification
  const subIssueNotification = node
    .append("svg:g")
    .attr("class", (d) => {
      return [
        "graph-issue__sub-issue-notification",
        "transition-fill",
        "fill-transparent",
        "hover:fill-secondary2-200",
        "cursor-pointer",
        d.subIssues.length > 0 ? "" : "hidden",
      ].join(" ");
    })
    .attr("transform", `translate(${IssuePositions.SubIssueNotification.x}, ${IssuePositions.SubIssueNotification.y})`);

  const path = `
M 0,0
h${configuration.nodeSize.width}
z
`;

  subIssueNotification
    .append("path")
    .classed("stroke-secondary1-300", (d) => d.subIssues.length > 0)
    .attr("d", path);

  subIssueNotification
    .append("rect")
    .attr("class", "stroke-transparent")
    .attr("height", IssueSizes.subIssueHighlightHeight)
    .attr("width", configuration.nodeSize.width - IssueSizes.paddingX * 2)
    .attr("x", IssueSizes.paddingX)
    .attr("y", IssueSizes.paddingY);

  subIssueNotification
    .append("text")
    .attr("class", "fill-secondary1-500")
    .attr("text-anchor", "middle")
    .attr("width", configuration.nodeSize.width - 2)
    .attr("x", (configuration.nodeSize.width - 2) / 2)
    .attr("y", IssueSizes.paddingY)
    .text((d) => {
      if (d.subIssues.length === 0) {
        return "";
      }

      return `have ${d.subIssues.length} sub issues`;
    });

  return node.merge(container);
};

export const buildIssueGraph = (
  container: D3Node<SVGSVGElement>,
  project: Project,
  configuration: Configuration,
): [IssueNode, Restarter<IssueNode, LayoutedLeveledIssue[]>] => {
  let issueNode = container.append("svg:g").selectAll<d3.BaseType, LayoutedLeveledIssue>("g");

  return [
    issueNode,
    (data) => {
      // update existing issues
      issueNode = issueNode.data(data, (d) => d.issueKey).classed("opacity-30", (d) => d.focusing === "unfocused");

      issueNode.exit().remove();

      issueNode = buildIssueNode(issueNode, project, configuration);

      return issueNode;
    },
  ];
};
type SVG = d3.Selection<SVGSVGElement, undefined, null, undefined> | null;

/**
 * support function to get graph issue from SVG
 */
export const getTargetIssuePositionInSVG = (svg: SVG, key: string): Position | undefined => {
  const node = svg?.node();
  if (!node) return;

  // find issue in SVG
  const issueNode = node.querySelector(`[data-issue-key="${key}"]`);

  if (!issueNode) return;

  // get translation
  const matrix = (issueNode as SVGGElement).transform.animVal[0].matrix;
  const x = matrix.e;
  const y = matrix.f;

  return { x, y };
};
