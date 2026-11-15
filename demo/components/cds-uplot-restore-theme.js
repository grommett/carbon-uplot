const THEME_CLASSES = ['cds--white', 'cds--g10', 'cds--g90', 'cds--g100'];
const saved = localStorage.getItem('cu-theme');
const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'g100' : 'white';
const theme = saved ?? preferred;

THEME_CLASSES.forEach((cls) => document.documentElement.classList.remove(cls));
document.documentElement.classList.add(`cds--${theme}`);
