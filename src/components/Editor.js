export function createEditor({ value, onSave }) {
  const wrapper = document.createElement('section');
  wrapper.className = 'mt-6 app-card p-5';

  const label = document.createElement('label');
  label.className = 'text-sm font-semibold app-muted';
  label.textContent = 'Your notes';
  label.setAttribute('for', 'note-editor');

  const textarea = document.createElement('textarea');
  textarea.id = 'note-editor';
  textarea.className =
    'mt-2 min-h-[160px] w-full app-input p-3 text-sm app-focus';
  textarea.value = value || '';
  textarea.setAttribute('aria-label', 'Interview notes');

  const hint = document.createElement('p');
  hint.className = 'mt-2 text-xs app-muted';
  hint.textContent = 'Tip: Press Ctrl+S to save without leaving the keyboard.';

  const actions = document.createElement('div');
  actions.className = 'mt-4 flex items-center gap-3';

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className =
    'app-button px-4 py-2 text-sm font-semibold transition app-focus';
  saveButton.textContent = 'Save notes';

  saveButton.addEventListener('click', () => onSave(textarea.value));

  textarea.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 's' && event.ctrlKey) {
      event.preventDefault();
      onSave(textarea.value);
    }
  });

  actions.append(saveButton);
  wrapper.append(label, textarea, hint, actions);

  // Extend here to mount a rich text editor or UI kit input component.

  return wrapper;
}
