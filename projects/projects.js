import { fetchJSON, renderProjects} from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
console.log(`projects: ${projects}`)
const projectsContainer = document.querySelector('.projects');
console.log(projectsContainer)
renderProjects(projects, projectsContainer, 'h2');

const projectCount = $$('.projects > article').length;
const h1Tag = document.querySelector('body > h1')
h1Tag.innerText = projectCount + ' ' + h1Tag.innerText


