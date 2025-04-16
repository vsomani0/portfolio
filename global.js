console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
let navLinks = $$("nav a")
let currentLink = navLinks.find((a) => a.host === location.host && a.pathname === location.pathname)
currentLink?.classList.add('current');
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1") 
? "/" 
: "website"


let pages = [
  {url: '', title: 'Home'},
  {url: '../contact/', title: 'Contact'},
  {url: '../projects/', title: 'Projects'},
  {url: "https://github.com/vsomani0", },
  {url: '../resume/', title: 'Resume'},
]
let nav = document.createElement('nav');
document.body.prepend(nav);
let ul = document.createElement('ul');
nav.append(ul)


for (let p of pages) {
  let url = p.url
  let title = p.title
  ul.insertAdjacentHTML('beforeend', `<a href ="${url}">"${title}"</a>`)
}