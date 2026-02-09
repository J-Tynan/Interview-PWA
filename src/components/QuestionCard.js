export function createQuestionCard({ question, isAnswered, onOpen }) {
  const card = document.createElement('article');
  card.className =
    'group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-pressed', 'false');

  const title = document.createElement('h3');
  title.className = 'text-lg font-semibold text-slate-900';
  title.textContent = question.prompt;

  const meta = document.createElement('p');
  meta.className = 'mt-2 text-sm text-slate-500';
  meta.textContent = `${question.category} · ${question.difficulty}`;

  const status = document.createElement('span');
  status.className =
    'mt-3 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600';
  status.textContent = isAnswered ? 'Notes saved' : 'Needs notes';

  card.append(title, meta, status);

  function handleActivate(event) {
    if (event.type === 'click' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(question.id);
    }
  }

  card.addEventListener('click', handleActivate);
  card.addEventListener('keydown', handleActivate);

  // Swap styles or component structure here if adopting a UI kit later.

  return card;
}
