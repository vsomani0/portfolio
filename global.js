console.log('IT’S ALIVE 5!');
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

document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
		Theme:
		<select id='theme-select'>
			<option>Automatic</option>
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

// Function to apply the theme
function applyTheme(theme) {
  // Implementation depends on how you want to apply the theme
  console.log(`Theme changed to: ${theme}`);
  
  // Example implementation
  if (theme === 'Light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else if (theme === 'Dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
}

// Load saved theme on page load
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  // Set the select element to the saved value
  themeSelect.value = savedTheme;
  // Apply the saved theme
  applyTheme(savedTheme);
}


function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
};
// Add current class to all links that direct to this page
let navLinks = $$("nav a")
let currentLink = navLinks.find((a) => a.host === location.host && a.pathname === location.pathname)
currentLink?.classList.add('current');



