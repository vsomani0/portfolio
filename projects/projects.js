import { fetchJSON, renderProjects} from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

const projectCount = document.querySelectorAll('.projects > article').length;
const h1Tag = document.querySelector('body > h1')
h1Tag.innerText = projectCount + ' ' + h1Tag.innerText

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
    let selectedIndex = -1;
    let svg = d3.select('svg');
    svg.selectAll('path').remove();
    arcs.forEach((arc, i) => {
        svg
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(i))
        .on('click', () => {
            selectedIndex = selectedIndex === i ? -1 : i;
            svg
            .selectAll('path')
            .attr('class', (_, idx) => (
                idx === selectedIndex ? 'selected' : ''
            ));
            if (selectedIndex !== -1) {
                projectsContainer.innerHTML = '';
                renderProjects(projectsGiven.filter((project) => {
                    return project.year === data[selectedIndex].label;
                }), projectsContainer, 'h2');
            }
            else {
                // projectsContainer.innerHTML = '';
                renderProjects(projects, projectsContainer, 'h2');
            }
        });
    });
    renderProjects(projects, projectsContainer, 'h2');
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
  renderPieCharts(filteredProjects);
//   renderProjects(filteredProjects, projectsContainer, 'h2');
});
renderPieCharts(projects);



