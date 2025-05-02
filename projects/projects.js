import { fetchJSON, renderProjects} from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectCount = document.querySelectorAll('.projects > article').length;
const h1Tag = document.querySelector('body > h1')
h1Tag.innerText = projectCount + ' ' + h1Tag.innerText

// Create a pie chart of projects by year
function renderPieCharts(projectsGiven) {
    let newSVG = d3.select('svg');
    newSVG.selectAll('path').remove();
    let newLegend = d3.select('.legend');
    newLegend.selectAll('li').remove();
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );
    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    let sliceGenerator = d3.pie().value((d) => d.value);    
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));

    arcs.forEach((arc, i) => {
        d3.select('svg').append('path').attr('d', arc).attr('fill', colors(i));
    });

    // Create a legend for the pie chart
    let legend = d3.select('.legend')
    if (data.length === 0) {
        legend.append('li').text('No Data Found');
    }
    data.forEach((d, idx) => {
    legend
    .append('li')
    .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
    });
}
// Create a projects filter
let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('change', (event) => {
  query = event.target.value;
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieCharts(filteredProjects);
});
renderPieCharts(projects);
