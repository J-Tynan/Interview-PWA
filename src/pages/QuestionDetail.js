import { createEditor } from '../components/Editor.js';
import { createTopBar } from '../components/TopBar.js';

export function renderQuestionDetail({
  question,
  note,
  onSaveNote,
  onBack,
  theme,
  styles,
  onToggleTheme,
  onStyleChange
}) {
  const page = document.createElement('main');
  page.className = 'mx-auto flex min-h-screen max-w-3xl flex-col px-6 app-page';

  const topBar = createTopBar({
    theme,
    styles,
    onToggleMode: onToggleTheme,
    onStyleChange
  });

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className =
    'w-fit app-button-outline px-4 py-2 text-sm font-semibold transition app-focus';
  backButton.textContent = 'Back to dashboard';
  backButton.addEventListener('click', onBack);

  if (!question) {
    const message = document.createElement('p');
    message.className = 'mt-6 text-sm app-muted';
    message.textContent = 'Question not found.';
    page.append(topBar, backButton, message);
    return page;
  }

  const header = document.createElement('section');
  header.className = 'mt-6 app-card p-6';
  header.innerHTML = `
    <p class="text-xs font-semibold uppercase tracking-[0.2em] app-muted">${question.category} · ${question.difficulty}</p>
    <h1 class="mt-3 text-2xl font-semibold">${question.title}</h1>
    <p class="mt-3 text-sm app-muted">Type: ${question.type}</p>
  `;

  const list = document.createElement('ul');
  list.className = 'mt-4 space-y-2 text-sm app-muted';
  (question.bullets || []).forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `• ${item}`;
    list.append(li);
  });
  header.append(list);

  if (question.examples && question.examples.length) {
    const examples = document.createElement('div');
    examples.className = 'mt-4 flex flex-wrap gap-2';

    question.examples.forEach((item) => {
      const chip = document.createElement('span');
      chip.className = 'app-pill px-3 py-1 text-xs font-semibold uppercase tracking-wide';
      chip.textContent = item;
      examples.append(chip);
    });

    header.append(examples);
  }

  const editor = createEditor({
    value: note,
    onSave: onSaveNote
  });

  page.append(topBar, backButton, header, editor);

  return page;
}
