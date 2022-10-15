import { Project } from "@/model/project";
import { StatusCategory } from "@/type";
import { Configuration, D3Node, IssueLink, IssueNode, LayoutedLeveledIssue } from "@/issue-graph/type";
import { makeTextMeasure } from "./text-measure";
import * as d3 from "d3";

const IssueSizes = {
  paddingX: 8,
  paddingY: 4,
  textHeight: 20,
  iconSize: 16,
};

const buildIssueNode = function buildIssueNode(node: IssueNode, project: Project, configuration: Configuration) {
  const measure = makeTextMeasure('13.5px "Noto Sans JP"');

  node
    .append("rect")
    .attr("class", (d) => {
      const classes = ["issue-node-outer"];

      if (!d.issue) {
        classes.push("--not-found");
      }

      return classes.join(" ");
    })
    .attr("stroke-size", 1)
    .attr("width", configuration.nodeSize.width)
    .attr("height", configuration.nodeSize.height)
    .attr("rx", 4.0)
    .attr("ry", 4.0);

  // issue key
  node
    .append("text")
    .attr("class", "issue-key")
    .attr("y", IssueSizes.paddingY)
    .attr("x", IssueSizes.paddingX)
    .text((d) => d.issueKey);

  // issue link
  node
    .append("svg:image")
    .attr("class", (d) => {
      const classes = ["issue-self-link"];

      if (!d.issue) {
        classes.push("--disabled");
      }

      return classes.join(" ");
    })
    .attr("y", IssueSizes.paddingY * 2)
    .attr("x", configuration.nodeSize.width - IssueSizes.paddingX * 2 - IssueSizes.iconSize / 2)
    .attr("width", IssueSizes.iconSize)
    .attr("height", IssueSizes.iconSize)
    .attr("xlink:href", "/assets/svg/exit.svg")
    .on("click", (_, d) => {
      if (d.issue) {
        const url = new URL(d.issue.selfUrl);
        window.open(`${url.origin}/browse/${d.issueKey}`, "_blank");
      }
    });

  // issue summary
  const issueWidth = configuration.nodeSize.width - IssueSizes.paddingX * 2;
  node
    .append("text")
    .attr("class", "issue-summary")
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
    .attr("class", "issue-node__status")
    .attr("x", IssueSizes.paddingX + IssueSizes.paddingX / 2)
    .attr("y", IssueSizes.paddingY * 3 + IssueSizes.textHeight * 2)
    .attr("filter", (d) => {
      if (!d.issue) return null;

      const status = project.findStatusBy(d.issue.statusId);
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

      const status = project.findStatusBy(d.issue.statusId);
      return status?.name ?? "";
    });
};

export const buildIssueGraph = function buildIssueGraph(
  container: D3Node<any>,
  data: LayoutedLeveledIssue[][],
  project: Project,
  configuration: Configuration
) {
  const issueNode = container
    .selectAll("g")
    .data(data.flat())
    .join("g")
    .attr("class", "graph-issue")
    .on("click", (_, d) => {
      d3.selectAll<d3.BaseType, IssueLink>(".issue-link")
        .attr("stroke", (linkd) => {
          if (linkd.source.issueKey === d.issueKey || linkd.target.issueKey === d.issueKey) {
            /* .color-primary-0 { color:  } */
            return "#A4393C";
          } else {
            return "black";
          }
        })
        .attr("stroke-width", (linkd) => {
          if (linkd.source.issueKey === d.issueKey || linkd.target.issueKey === d.issueKey) {
            return 1;
          } else {
            return 1;
          }
        })
        .attr("marker-end", (linkd) => {
          if (linkd.source.issueKey === d.issueKey || linkd.target.issueKey === d.issueKey) {
            return "url(#selected-arrowhead)";
          } else {
            return "url(#arrowhead)";
          }
        });
    });
  buildIssueNode(issueNode, project, configuration);

  return issueNode;
};
