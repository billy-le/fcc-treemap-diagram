import * as d3 from "d3";

type VideoGameSale = {
  children: Array<{ category: string; name: string; value: string }>;
  name: string;
};

const videoGameSalesUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

const margin = {
  x: 100,
  y: 100,
};

function draw(
  data: {
    name: string;
    children: VideoGameSale[];
  },
  color: d3.ScaleOrdinal<string, string, never>
) {
  let height = innerHeight - margin.y * 2;
  let width = innerWidth - margin.x * 2;

  const tooltip = d3.select("#tooltip");

  const hierarchy = d3
    .hierarchy(data)
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value);

  const root = d3
    .treemap()
    .tile(d3.treemapSquarify)
    .size([width, height])
    .padding(1)(hierarchy);

  d3.select("#app").select("svg").remove();

  const svg = d3
    .select("#app")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .attr("viewbox", [0, 0, width, height])
    .style("display", "block")
    .style("margin", "0 auto");

  const g = svg
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`)
    .on("mouseover", (p, d) => {
      tooltip.style("display", "block");
      tooltip.attr("data-value", d.data.value);
    })
    .on("mousemove", (p, d) => {
      tooltip.style("top", `${p.clientY - 200}px`);
      tooltip.style("left", `${p.clientX - 100}px`);
      tooltip.html(`
        <div>${d.data.category} - ${d.data.name}</div>
        <div>Value: ${d.data.value}</div>
      `);
    })
    .on("mouseleave", () => {
      tooltip.style("display", "none");
    });

  g.append("rect")
    .attr("class", "tile")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("fill", (d) => color(d.data.category))
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value);

  g.append("foreignObject")
    .attr("width", (d) => d.x1 - d.x0 - 5)
    .attr("height", (d) => d.y1 - d.y0)
    .append("xhtml:div")
    .style("padding", "5px 0 0 5px")
    .style("font-size", "10px")
    .html((d) => d.data.name);
}

async function main() {
  const data = await d3
    .json<{
      name: string;
      children: VideoGameSale[];
    }>(videoGameSalesUrl, { cache: "force-cache" })
    .then((res) => {
      if (!res) return { name: "", children: [] };
      return res;
    });

  const categories = data.children.map((d) => d.name);

  const color = d3.scaleOrdinal(categories, d3.schemeTableau10);

  const legend = d3
    .select("#legend")
    .append("svg")
    .attr("height", 200)
    .attr("width", 600)
    .attr("viewbox", [0, 0, 600, 200])
    .style("display", "block")
    .style("margin", "0 auto");

  const legendGroup = legend
    .selectAll("g")
    .data(categories)
    .enter()
    .append("g");

  legendGroup
    .append("rect")
    .attr("class", "legend-item")
    .attr("height", 20)
    .attr("width", 20)
    .attr("fill", (cat) => color(cat))
    .attr("x", (d, i) => i * 80);

  legendGroup
    .append("text")
    .attr("y", 16)
    .attr("x", (d, i) => i * 80 + 23)
    .text((cat) => cat);

  draw(data, color);

  window.addEventListener("resize", () => {
    draw(data, color);
  });
}

main();
