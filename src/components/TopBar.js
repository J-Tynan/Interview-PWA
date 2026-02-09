export function createTopBar({ theme, styles, onToggleMode, onStyleChange }) {
  const bar = document.createElement('section');
  bar.className = 'flex flex-wrap items-center justify-end gap-3 pb-6';

  const controls = document.createElement('div');
  controls.className = 'flex flex-wrap items-center gap-3';

  const modeButton = document.createElement('button');
  modeButton.type = 'button';
  modeButton.className = 'app-button-outline px-4 py-2 text-sm font-semibold app-focus';
  modeButton.setAttribute('aria-pressed', theme.mode === 'dark' ? 'true' : 'false');
  modeButton.textContent = theme.mode === 'dark' ? 'Dark' : 'Light';
  modeButton.addEventListener('click', () => onToggleMode());

  const select = document.createElement('select');
  select.id = 'style-select';
  select.className = 'app-select px-3 py-2 text-sm font-semibold app-focus';

  styles.forEach((style) => {
    const option = document.createElement('option');
    option.value = style.id;
    option.textContent = `${style.label} — ${style.description}`;
    if (style.id === theme.style) {
      option.selected = true;
    }
    select.append(option);
  });

  select.addEventListener('change', (event) => {
    onStyleChange(event.target.value);
  });

  const styleGroup = document.createElement('div');
  styleGroup.className = 'flex items-center gap-2 text-sm font-semibold';

  const styleLabel = document.createElement('label');
  styleLabel.className = 'app-muted';
  styleLabel.setAttribute('for', 'style-select');
  styleLabel.textContent = 'Style';

  styleGroup.append(styleLabel, select);
  controls.append(modeButton, styleGroup);
  bar.append(controls);

  // Swap this layout for a UI kit control group if you adopt one later.

  return bar;
}
