import { fetchJSON, renderProjects} from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
console.log(`projects: ${projects}`)
const projectsContainer = document.querySelector('.projects');
console.log(projectsContainer)
renderProjects(projects, projectsContainer, 'h2');

// Projects to add: 
// DSC 80 Final Project
// DSC 106 Project 1
// Baseball Ejections Projects
// Tic Tac Toe
// Datahacks 2024


