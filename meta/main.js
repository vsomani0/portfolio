import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let xScale;
let yScale;
async function loadData() {
  const data = await d3.csv("loc.csv", (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + "T00:00" + row.timezone),
    datetime: new Date(row.datetime),
  }));
  return data;
}

function processCommits(data) {
  const out = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: "https://github.com/vsomani0/portfolio/commit/" + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, "lines", {
        value: lines,
        enumerable: false,
      });
      return ret;
    });
  return out;
}

function renderCommitInfo(data, commits) {
  // Create the dl element
  const dl = d3.select("#stats").append("dl").attr("class", "stats");

  // Add total LOC
  dl.append("dt").html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append("dd").text(data.length);

  // Add total commits
  dl.append("dt").text("Total commits");
  dl.append("dd").text(commits.length);

  // Add more stats as needed...
  let timeCounts = countByTimeOfDay(commits);
  // Get time period of most commits
  let numLargestTimeCommits = d3.max(timeCounts, (d) => d.count);
  let timeLargestTimeCommits = timeCounts.find(
    (d) => d.count == numLargestTimeCommits
  ).period;
  dl.append("dt").text("Most commits by time of day");
  dl.append("dd").text(`${timeLargestTimeCommits} (${numLargestTimeCommits})`);
  let dayCounts = countByDayOfWeek(commits);
  let numFewestDayCommits = d3.min(dayCounts, (d) => d.count);
  const stringDayOfWeek = convertDayOfWeekToString(numFewestDayCommits);
  let dayFewestDayCommits = stringDayOfWeek;
  dl.append("dt").text("Fewest commits by day of week");
  dl.append("dd").text(`${dayFewestDayCommits} (${numFewestDayCommits})`);

  const averageFileLength = getAverageFileLength(data);
  dl.append("dt").text("Average file length");
  dl.append("dd").text(averageFileLength.toFixed(2));
}

function countByTimeOfDay(data) {
  // Define time periods (hours in 24-hour format)
  const periods = [
    { name: "Morning", start: 4, end: 12 }, // 5:00 AM to 11:59 AM
    { name: "Afternoon", start: 12, end: 17 }, // 12:00 PM to 4:59 PM
    { name: "Evening", start: 17, end: 22 }, // 5:00 PM to 9:59 PM
    { name: "Night", start: 22, end: 4 }, // 10:00 PM to 4:59 AM
  ];

  // Group data by period
  const counts = d3.rollup(
    data,
    (v) => v.length, // Count the number of items
    (d) => {
      const hour = d.hourFrac;

      // Find which period this hour belongs to
      for (let period of periods) {
        if (period.start <= period.end) {
          if (hour >= period.start && hour < period.end) {
            return period.name;
          }
        } else {
          if (hour >= period.start || hour < period.end) {
            return period.name;
          }
        }
      }
    }
  );

  // Convert Map to array format
  return Array.from(counts, ([key, value]) => ({
    period: key,
    count: value,
  }));
}

function convertDayOfWeekToString(dayOfWeek) {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return daysOfWeek[dayOfWeek];
}

function countByDayOfWeek(data) {
  const counts = d3.rollup(
    data,
    (v) => v.length, // Count the number of items
    (d) => {
      const dayOfWeek = new Date(d.datetime).getDay();
      return dayOfWeek;
    }
  );

  // Convert Map to array format
  return Array.from(counts, ([key, value]) => ({
    period: key,
    count: value,
  }));
}

function getAverageFileLength(data) {
  const fileLengths = d3.rollups(
    data,
    (v) => d3.max(v, (v) => v.line),
    (d) => d.file
  );
  return d3.mean(fileLengths, (d) => d[1]);
}

function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("overflow", "visible");

  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width]);

  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 15]);

  // Reverse sorted order of commits
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  const dots = svg.append("g").attr("class", "dots");
  dots
    .selectAll("circle")
    .data(sortedCommits)
    .join("circle")
    .attr("cx", (d) => xScale(d.datetime))
    .attr("cy", (d) => yScale(d.hourFrac))
    .attr("r", (d) => rScale(d.totalLines))
    .attr("fill", "steelblue")
    .style("fill-opacity", 0.7)
    .on("mouseenter", (event, commit) => {
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on("mouseleave", () => {
      updateTooltipVisibility(false);
    });

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00");

  svg
    .append("g")
    .attr("transform", `translate(0,${usableArea.bottom})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("transform", `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  const gridlines = svg
    .append("g")
    .attr("class", "gridlines")
    .attr("transform", `translate(${usableArea.left}, 0)`);

  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(
    d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width)
  );
}

function updateScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3.select("#chart").select("svg");

  xScale = xScale.domain(d3.extent(commits, (d) => d.datetime));

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

  const xAxis = d3.axisBottom(xScale);

  svg
    .append("g")
    .attr("transform", `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  const dots = svg.select("g.dots");

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  dots
    .selectAll("circle")
    .data(sortedCommits)
    .join("circle")
    .attr("cx", (d) => xScale(d.datetime))
    .attr("cy", (d) => yScale(d.hourFrac))
    .attr("r", (d) => rScale(d.totalLines))
    .attr("fill", "steelblue")
    .style("fill-opacity", 0.7) // Add transparency for overlapping dots
    .on("mouseenter", (event, commit) => {
      d3.select(event.currentTarget).style("fill-opacity", 1); // Full opacity on hover
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on("mouseleave", (event) => {
      d3.select(event.currentTarget).style("fill-opacity", 0.7);
      updateTooltipVisibility(false);
    });
}

function createBrushSelector(svg) {
  svg.call(d3.brush().on("start brush end", brushed));

  // Raise dots and everything after overlay
  svg.selectAll(".dots, .overlay ~ *").raise();
}

function brushed(event) {
  console.log("Brushed");
  const selection = event.selection;
  d3.selectAll("circle").classed("selected", (d) =>
    isCommitSelected(selection, d)
  );

  renderSelectionCount(selection);
  renderLanguageBreakdown(selection);
}

function isCommitSelected(selection, commit) {
  if (!selection) {
    return false;
  }
  const [x0, x1] = selection.map((d) => d[0]);
  const [y0, y1] = selection.map((d) => d[1]);
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}
function renderLanguageBreakdown(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];
  const container = document.getElementById("language-breakdown");

  if (selectedCommits.length === 0) {
    container.innerHTML = "";
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  // Update DOM with breakdown
  container.innerHTML = "";

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format(".1~%")(proportion);

    container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
  }
}

function renderSelectionCount(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

  const countElement = document.querySelector("#selection-count");
  countElement.textContent = `${
    selectedCommits.length || "No"
  } commits selected`;

  return selectedCommits;
}

function renderTooltipContent(commit) {
  const link = document.getElementById("commit-link");
  const date = document.getElementById("commit-date");
  const lines = document.getElementById("commit-lines");

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString("en", {
    dateStyle: "full",
  });
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById("commit-tooltip");
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById("commit-tooltip");
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

let data = await loadData();
let commits = processCommits(data);

let commitProgress = 100;
let timeScale = d3.scaleTime(
  [d3.min(commits, (d) => d.datetime), d3.max(commits, (d) => d.datetime)],
  [0, 100]
);
let commitMaxTime = timeScale.invert(commitProgress);
function onTimeSliderChange() {
  const selectedTime = d3.select("#selected-time");
  selectedTime.text(commitMaxTime.toLocaleString());

  const commitTimeSlider = d3.select("#commit-time-slider");
  commitTimeSlider.on("input", (event) => {
    commitProgress = event.target.value;
    commitMaxTime = timeScale.invert(commitProgress);
    selectedTime.text(commitMaxTime.toLocaleString());
    const filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
    updateScatterPlot(data, filteredCommits);
    renderLinesInfo(filteredCommits);
  });
}

const filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);

renderCommitInfo(data, commits);
renderScatterPlot(data, filteredCommits);
createBrushSelector(d3.select("#chart > svg"));

function renderLinesInfo(filteredCommits) {
  let lines = filteredCommits.flatMap((d) => d.lines);
  let files = [];
  files = d3
    .groups(lines, (d) => d.file)
    .map(([name, lines]) => {
      return { name, lines };
    })
    .sort((a, b) => b.lines.length - a.lines.length);

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  d3.select(".files").selectAll("div").remove();
  let filesContainer = d3
    .select(".files")
    .selectAll("div")
    .data(files)
    .enter()
    .append("div");
  filesContainer
    .append("dt")
    .append("code")
    .text((d) => d.name);
  filesContainer.append("dd");

  filesContainer
    .select("dd")
    .selectAll("div")
    .data((d) => d.lines)
    .join("div")
    .attr("class", "loc")
    .style("background", (d) => `--color: ${colors(d.type)}`);
}
renderLinesInfo(filteredCommits);
onTimeSliderChange();
