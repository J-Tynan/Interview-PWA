import { createTopBar } from '../components/TopBar.js';

export function renderReview({
  questions,
  notes,
  onOpenQuestion,
  onBack,
  theme,
  styles,
  onToggleTheme,
  onStyleChange
}) {
  const page = document.createElement('main');
  page.className = 'mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-6';

  const topBar = createTopBar({
    theme,
    styles,
    onToggleMode: onToggleTheme,
    onStyleChange
  });

  const header = document.createElement('header');
  header.className = 'flex flex-wrap items-center justify-between gap-4';
  header.innerHTML = `
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.2em] app-muted">Review mode</p>
      <h1 class="mt-2 text-3xl font-semibold">Focus areas</h1>
      <p class="mt-2 text-sm app-muted">Quickly jump back into unanswered questions.</p>
    </div>
  `;

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className =
    'app-button-outline px-4 py-2 text-sm font-semibold transition app-focus';
  backButton.textContent = 'Back to dashboard';
  backButton.addEventListener('click', onBack);
  header.append(backButton);

  const list = document.createElement('section');
  list.className = 'mt-8 space-y-3';

  questions.forEach((question) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className =
      'flex w-full items-center justify-between app-card px-5 py-4 text-left text-sm font-semibold transition app-focus';
    item.textContent = `${question.prompt}`;

    const status = document.createElement('span');
    status.className =
      'ml-3 app-pill px-3 py-1 text-xs font-semibold uppercase tracking-wide';
    status.textContent = notes[question.id] ? 'Ready' : 'Needs notes';

    item.append(status);
    item.addEventListener('click', () => onOpenQuestion(question.id));
    list.append(item);
  });

  page.append(topBar, header, list);

  return page;
}
