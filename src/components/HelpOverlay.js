export function createHelpOverlay(options = {}) {
  const { onClose, onOpen } = options;
  const overlay = document.createElement('div');
  overlay.className = 'app-overlay app-hidden';
  overlay.tabIndex = -1;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'keyboard-help-title');

  const dialog = document.createElement('div');
  dialog.className = 'app-dialog';

  const title = document.createElement('h2');
  title.id = 'keyboard-help-title';
  title.className = 'text-lg font-semibold';
  title.textContent = 'Keyboard shortcuts';

  const list = document.createElement('ul');
  list.className = 'mt-4 space-y-2 text-sm app-muted';
  list.innerHTML = `
    <li><span class="app-kbd">Ctrl</span> + <span class="app-kbd">S</span> Save notes</li>
    <li><span class="app-kbd">J</span> / <span class="app-kbd">K</span> Next / previous bullet</li>
    <li><span class="app-kbd">←</span> / <span class="app-kbd">→</span> Previous / next bullet</li>
    <li><span class="app-kbd">M</span> Mark difficulty</li>
    <li><span class="app-kbd">P</span> Toggle polished preview</li>
  `;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'mt-5 app-button-outline px-3 py-1 text-xs font-semibold uppercase tracking-wide app-focus';
  closeButton.textContent = 'Close';

  dialog.append(title, list, closeButton);
  overlay.append(dialog);

  function open() {
    overlay.classList.remove('app-hidden');
    // move focus into the dialog
    closeButton.focus();
    if (typeof onOpen === 'function') {
      onOpen();
    }
  }

  function close() {
    overlay.classList.add('app-hidden');
    if (typeof onClose === 'function') {
      onClose();
    }
  }

  closeButton.addEventListener('click', close);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
    }
  });

  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      close();
    }
  }, true);

  return { element: overlay, open, close };
}
