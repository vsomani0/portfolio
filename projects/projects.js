import { fetchJSON, renderProjects} from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
console.log(`projects: ${projects}`)
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectCount = document.querySelectorAll('.projects > article').length;
const h1Tag = document.querySelector('body > h1')
h1Tag.innerText = projectCount + ' ' + h1Tag.innerText

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let data = [
    { value: 1, label: 'apples' },
    { value: 2, label: 'oranges' },
    { value: 3, label: 'mangos' },
    { value: 4, label: 'pears' },
    { value: 5, label: 'limes' },
    { value: 5, label: 'cherries' },
  ];
let sliceGenerator = d3.pie().value((d) => d.value);    
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
arcs.forEach((arc, i) => {
    d3.select('svg').append('path').attr('d', arc).attr('fill', colors(i));
  });


