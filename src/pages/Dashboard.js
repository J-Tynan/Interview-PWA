import { createQuestionCard } from '../components/QuestionCard.js';
import { createProgressBar } from '../components/ProgressBar.js';
import { createTopBar } from '../components/TopBar.js';

export function renderDashboard({
  questions,
  notes,
  onOpenQuestion,
  onOpenReview,
  theme,
  styles,
  onToggleTheme,
  onStyleChange
}) {
  const page = document.createElement('main');
  page.className = 'mx-auto flex min-h-screen max-w-5xl flex-col px-6 app-page';

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
      <p class="text-xs font-semibold uppercase tracking-[0.2em] app-muted">Interview prep</p>
      <h1 class="mt-2 text-3xl font-semibold">Dashboard</h1>
      <p class="mt-2 text-sm app-muted">Track questions, capture notes, and review your progress.</p>
    </div>
  `;

  const reviewButton = document.createElement('button');
  reviewButton.type = 'button';
  reviewButton.className =
    'app-button-outline px-4 py-2 text-sm font-semibold transition app-focus';
  reviewButton.textContent = 'Open review';
  reviewButton.addEventListener('click', onOpenReview);
  header.append(reviewButton);

  const answeredCount = questions.filter((q) => notes[q.id]).length;
  page.append(topBar, header, createProgressBar({ current: answeredCount, total: questions.length }));

  const grid = document.createElement('section');
  grid.className = 'mt-8 grid gap-4 md:grid-cols-2';

  questions.forEach((question) => {
    const card = createQuestionCard({
      question,
      isAnswered: Boolean(notes[question.id]),
      onOpen: onOpenQuestion
    });
    grid.append(card);
  });

  const footer = document.createElement('footer');
  footer.className = 'mt-auto pt-10 text-xs app-muted';
  footer.textContent = 'Local-first notes stored in your browser.';

  page.append(grid, footer);

  return page;
}
