import * as d3 from "d3";

d3.select("#root")
  .data([1, 2, 3, 4, 5])
  .enter()
  .append("p")
  .style("font-size", (data) => {
    return `${data}px`;
  });
