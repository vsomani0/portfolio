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
    let timeCounts = countByTimeOfDay(data);
    // Get time period of most commits
    let numLargestTimeCommits = d3.max(timeCounts, (d) => d.count);
    let timeLargestTimeCommits = timeCounts.find(
        (d) => d.count == numLargestTimeCommits
    ).period;
    dl.append("dt").text("Most commits by time of day");
    dl.append("dd").text(`${timeLargestTimeCommits}: ${numLargestTimeCommits}`);
    let dayCounts = countByDayOfWeek(data);
    let numLargestDayCommits = d3.max(dayCounts, (d) => d.count);
    const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    let dayLargestDayCommits =
        daysOfWeek[
            dayCounts.find((d) => d.count == numLargestDayCommits).period
        ];
    dl.append("dt").text("Most commits by day of week");
    dl.append("dd").text(`${dayLargestDayCommits}: ${numLargestDayCommits}`);
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
            const date = new Date(d.datetime);
            const hour = date.getHours();

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
    // Define time periods (hours in 24-hour format)

    // Group data by period
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

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);
