import { STYLES_CONTENT } from './styles-content.js';

const STYLE_ELEMENT_ID = 'cu-styles';

if (!document.getElementById(STYLE_ELEMENT_ID)) {
  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ELEMENT_ID;
  styleEl.textContent = STYLES_CONTENT;
  document.head.appendChild(styleEl);
}
