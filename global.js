console.log('IT’S ALIVE 2!');

let pages = [
  {url: '', title: 'Home'},
  {url: 'contact/', title: 'Contact'},
  {url: 'projects/', title: 'Projects'},
  {url: "https://github.com/vsomani0", title: 'Github'},
  {url: 'resume/', title: 'Resume'},
]
let nav = document.createElement('nav');
document.body.prepend(nav);
let ul = document.createElement('ul');
nav.appendChild(ul)


const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1") 
? "/" 
: "/portfolio/"

function convert_url(url) {
  // Allow for usage on website
  if (!url.startsWith('http')) {
    return BASE_PATH + url
  }
  return url
};

// Automatic navigation bar
for (let p of pages) {
  let url = convert_url(p.url)
  console.log(url)
  let title = p.title
  let li = document.createElement('li')
  let a = document.createElement('a')
  a.href = url
  a.textContent = title
  li.append(a)
  ul.appendChild(li)
}

function add_navigation_styles() {
  const styleElement = document.createElement('style')
  styleElement.textContext = `
  nav {
    display: flex;
  }
  nav ul {
    display: contents;
  }
  nav ul li {
    display: contents
  }
  nav ul a {
    flex-grow: 1;
    text-decoration: none;
    text-align: center;
    color: inherit;
    padding: 0.5em;
    border-bottom-color: oklch(80% 3% 200);
    border-bottom-style: solid;
    border-bottom-width: 1px;
  }
  nav ul a.current {
    border-bottom-width: 0.4em;
    padding-bottom: 0.2em;
  }
  `;
  document.head.appendChild(styleElement);
}

document.addEventListener('DOMContentLoaded', add_navigation_styles)

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
};
// Add current class to all links that direct to this page
let navLinks = $$("nav a")
let currentLink = navLinks.find((a) => a.host === location.host && a.pathname === location.pathname)
currentLink?.classList.add('current');



