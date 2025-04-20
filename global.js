console.log('IT’S ALIVE 6!');
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
console.log(`base path: ${BASE_PATH}`)

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
  let title = p.title
  let li = document.createElement('li')
  let a = document.createElement('a')
  a.href = url
  a.textContent = title
  li.append(a)
  ul.appendChild(li)
}
const PREFERRED_MODE = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'
document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
		Theme:
		<select id='theme-select'>
			<option>Automatic (${PREFERRED_MODE})</option>
      <option>Light</option>
      <option>Dark</option>
		</select>
	</label>`,
);
const themeSelect = document.getElementById('theme-select');

// Add an event listener to capture changes
themeSelect.addEventListener('change', function() {
  const selectedTheme = this.value;
  localStorage.setItem('theme', selectedTheme);
  applyTheme(selectedTheme);
});

function applyTheme(theme) {
    console.log(`Theme changed to: ${theme}`);
  
  if (theme === 'Light') {
    document.documentElement.style.colorScheme = "light";
  } else if (theme === 'Dark') {
    document.documentElement.style.colorScheme = "dark";
  } else {
    document.documentElement.style.colorScheme = "light dark";

  }
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  // Update the dropdown bar using .value
  themeSelect.value = savedTheme;
  applyTheme(savedTheme);
}

const mailForm = document.getElementById('mail-form');
mailForm?.addEventListener('submit', function(event) {
  event.preventDefault();
  let data = new FormData(mailForm);
  let url = mailForm.action;
  for (let [name, value] of data) {
    if (name === 'subject') {
      url += `?${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    } else if (name === 'body') {
      url += `&${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    }
  }
  location.href = url;
})
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
};
// Add current class to all links that direct to this page
let navLinks = $$("nav a")
let currentLink = navLinks.find((a) => a.host === location.host && a.pathname === location.pathname)
currentLink?.classList.add('current');



