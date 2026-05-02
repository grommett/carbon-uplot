const saved = localStorage.getItem('cu-theme');

if (saved) {
  ['cds--white', 'cds--g10', 'cds--g90', 'cds--g100'].forEach((cls) => {
    document.documentElement.classList.remove(cls);
  });
  document.documentElement.classList.add(`cds--${saved}`);
}
