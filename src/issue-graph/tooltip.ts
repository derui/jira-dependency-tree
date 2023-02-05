import * as d3 from "d3";
import { Issue } from "@/model/issue";

type Visible = (element: HTMLElement, issue: Issue | undefined) => void;
type Invisible = () => void;

const commonClasses = [
  "issue-summary-tooltip",
  "absolute",
  "rounded",
  "bg-white",
  "border-2",
  "border-complement-300",
  "whitespace-wrap",
  "text-sm",
  "p-2",
];

export const buildTooltip = (): { show: Visible; hide: Invisible } => {
  const tooltip = d3.select("body").append("div").attr("class", "issue-summary-tooltip absolute invisible");

  return {
    show: (element, issue) => {
      const rect = element.getBoundingClientRect();

      tooltip
        .attr("class", () => {
          return commonClasses.concat(["visible", "animate-fade-in"]).join(" ");
        })
        .html(issue?.summary ?? "")
        .style("width", `${rect.width}px`)
        .style("top", `${rect.bottom + 16}px`)
        .style("left", `${rect.left}px`);
    },
    hide: () => {
      tooltip.attr("class", () => {
        return commonClasses.concat(["invisible", "animate-fade-out"]).join(" ");
      });
    },
  };
};
