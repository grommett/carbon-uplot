import { highlight } from 'https://esm.sh/sugar-high';

document.querySelectorAll('.demo-code-toggle').forEach((button) => {
  const dialog = document.getElementById(button.dataset.dialog);

  initCodePanel(dialog.querySelector('.demo-code-panel'));

  button.addEventListener('click', () => dialog.showModal());

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.querySelector('.demo--modal-close').addEventListener('click', () => dialog.close());
});

function initCodePanel(panel) {
  const tabs = panel.querySelectorAll('[role="tab"]');
  const panes = panel.querySelectorAll('.demo-code-pane');

  panes.forEach((pane) => {
    const code = pane.querySelector('code');
    if (!code) return;
    const text = code.textContent.replace(/^\n/, '').trimEnd();
    code.innerHTML = highlight(text);
  });

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      panes.forEach((pane) => {
        pane.hidden = pane.dataset.pane !== target;
      });
    });
  });
}
