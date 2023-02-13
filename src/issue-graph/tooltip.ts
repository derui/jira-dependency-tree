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
  "max-w-xs",
];

export const buildTooltip = (): { show: Visible; hide: Invisible } => {
  const tooltip = d3.select("body").append("div").attr("class", "issue-summary-tooltip absolute invisible");
  let timer: NodeJS.Timeout | undefined = undefined;

  return {
    show: (element, issue) => {
      const rect = element.getBoundingClientRect();

      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        tooltip
          .attr("class", () => {
            return commonClasses.concat(["visible", "animate-fade-in"]).join(" ");
          })
          .html(issue?.summary ?? "")
          .style("top", `${rect.bottom + 16}px`)
          .style("left", `${rect.left}px`);

        timer = undefined;
      }, 500);
    },
    hide: () => {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }

      tooltip.attr("class", () => {
        return commonClasses.concat(["invisible", "animate-fade-out"]).join(" ");
      });
    },
  };
};
