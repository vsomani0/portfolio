import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

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
    console.log(out);
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
    dl.append("dd").text(`${timeLargestTimeCommits}: ${numLargestTimeCommits}`);
    let dayCounts = countByDayOfWeek(commits);
    let numFewestDayCommits = d3.min(dayCounts, (d) => d.count);
    const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    let dayFewestDayCommits =
        daysOfWeek[
            dayCounts.find((d) => d.count == numFewestDayCommits).period
        ];
    dl.append("dt").text("Fewest commits by day of week");
    dl.append("dd").text(`${dayFewestDayCommits}: ${numFewestDayCommits}`);

    const averageFileLength = getAverageFileLength(data);
    dl.append("dt").text("Average file length");
    dl.append("dd").text(averageFileLength.toFixed(2));
}
function countByTimeOfDay(data) {
    // Define time periods (hours in 24-hour format)
    const periods = [
        { name: "morning", start: 4, end: 12 }, // 5:00 AM to 11:59 AM
        { name: "afternoon", start: 12, end: 17 }, // 12:00 PM to 4:59 PM
        { name: "evening", start: 17, end: 22 }, // 5:00 PM to 9:59 PM
        { name: "night", start: 22, end: 4 }, // 10:00 PM to 4:59 AM
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

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([0, width]);

    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
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

    const dots = svg.append("g").attr("class", "dots");
    dots.selectAll("circle")
        .data(commits)
        .join("circle")
        .attr("cx", (d) => xScale(d.datetime))
        .attr("cy", (d) => yScale(d.hourFrac))
        .attr("r", 5)
        .attr("fill", "steelblue");

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00");

    svg.append("g")
        .attr("transform", `translate(0,${usableArea.bottom})`)
        .call(xAxis);

    svg.append("g")
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

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);
