const THEME_CLASSES = ['cds--white', 'cds--g10', 'cds--g90', 'cds--g100'];

const THEME_OPTIONS = [
  { value: 'white', label: 'White' },
  { value: 'g10', label: 'G10' },
  { value: 'g90', label: 'G90' },
  { value: 'g100', label: 'G100' },
];

const THEME_ICON = `
<svg focusable="false" preserveAspectRatio="xMidYMid meet" fill="currentColor"
  width="16" height="16" viewBox="0 0 32 32" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm0 26V4a12 12 0 0 1 0 24z"/>
</svg>`;

const CHECK_ICON = `
<svg focusable="false" preserveAspectRatio="xMidYMid meet" fill="currentColor"
  width="16" height="16" viewBox="0 0 32 32" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <path d="M13 24L4 15l1.4-1.4 7.6 7.6 14-14L28.4 8z"/>
</svg>`;

function activeTheme() {
  return localStorage.getItem('cu-theme') || 'white';
}

function activeThemeLabel() {
  const theme = activeTheme();
  return THEME_OPTIONS.find((option) => option.value === theme)?.label ?? 'White';
}

class CDSuPlotThemeSwitcher extends HTMLElement {
  _open = false;
  _menu = null;
  _triggerLabel = null;

  connectedCallback() {
    this.innerHTML = this.render();
    this._menu = this.querySelector('.cu-ts-menu');
    this._triggerLabel = this.querySelector('.cu-ts-trigger-label');
    document.addEventListener('click', this);
    document.addEventListener('cu-theme-change', this);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this);
    document.removeEventListener('cu-theme-change', this);
  }

  handleEvent(event) {
    if (event.type === 'cu-theme-change') {
      this._menu.innerHTML = this.renderOptions();
      this._triggerLabel.textContent = activeThemeLabel();
      return;
    }

    const option = event.target.closest('.cu-ts-option');
    const isTrigger = event.target.closest('.cu-ts-trigger');
    const isOutside = !this.contains(event.target);

    if (isOutside) return this.close();
    if (isTrigger) return this.handleTrigger();
    if (!option) return;

    this.close();
    applyTheme(option.dataset.theme);
  }

  close() {
    this._open = false;
    this._menu.hidden = true;
  }

  handleTrigger() {
    this._open = !this._open;
    this._menu.hidden = !this._open;
  }

  renderOption({ value, label }) {
    const isActive = value === activeTheme();
    return `
      <button type="button" class="cu-ts-option" data-theme="${value}">
        <span class="cu-ts-option-check" aria-hidden="true">${isActive ? CHECK_ICON : ''}</span>
        ${label}
      </button>`;
  }

  renderOptions() {
    return THEME_OPTIONS.map((option) => this.renderOption(option)).join('');
  }

  render() {
    return `
      <button type="button" class="cu-ts-trigger">
        ${THEME_ICON}
        <span class="cu-ts-trigger-label">${activeThemeLabel()}</span>
      </button>
      <div class="cu-ts-menu" hidden>
        ${this.renderOptions()}
      </div>
    `;
  }
}

function applyTheme(name) {
  THEME_CLASSES.forEach((cls) => {
    document.documentElement.classList.toggle(cls, cls === `cds--${name}`);
  });
  localStorage.setItem('cu-theme', name);
  document.dispatchEvent(new CustomEvent('cu-theme-change', { detail: { name } }));
}

customElements.define('cds-uplot-theme-switcher', CDSuPlotThemeSwitcher);
