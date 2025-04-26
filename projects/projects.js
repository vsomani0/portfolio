import { fetchJSON, renderProjects} from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
console.log(`projects: ${projects}`)
const projectsContainer = document.querySelector('.projects');
console.log(projectsContainer)
renderProjects(projects, projectsContainer, 'h2');



