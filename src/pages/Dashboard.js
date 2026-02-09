import { createQuestionCard } from '../components/QuestionCard.js';
import { createProgressBar } from '../components/ProgressBar.js';

export function renderDashboard({ questions, notes, onOpenQuestion, onOpenReview }) {
  const page = document.createElement('main');
  page.className = 'mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10';

  const header = document.createElement('header');
  header.className = 'flex flex-wrap items-center justify-between gap-4';
  header.innerHTML = `
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Interview prep</p>
      <h1 class="mt-2 text-3xl font-semibold text-slate-900">Dashboard</h1>
      <p class="mt-2 text-sm text-slate-500">Track questions, capture notes, and review your progress.</p>
    </div>
  `;

  const reviewButton = document.createElement('button');
  reviewButton.type = 'button';
  reviewButton.className =
    'rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';
  reviewButton.textContent = 'Open review';
  reviewButton.addEventListener('click', onOpenReview);
  header.append(reviewButton);

  const answeredCount = questions.filter((q) => notes[q.id]).length;
  page.append(header, createProgressBar({ current: answeredCount, total: questions.length }));

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
  footer.className = 'mt-auto pt-10 text-xs text-slate-400';
  footer.textContent = 'Local-first notes stored in your browser.';

  page.append(grid, footer);

  return page;
}
