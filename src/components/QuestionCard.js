export function createQuestionCard({ question, isAnswered, onOpen }) {
  const card = document.createElement('article');
  card.className =
    'group app-card p-5 transition app-focus cursor-pointer';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-pressed', 'false');

  const title = document.createElement('h3');
  title.className = 'text-lg font-semibold';
  title.textContent = question.title;

  const meta = document.createElement('p');
  meta.className = 'mt-2 text-sm app-muted';
  meta.textContent = `${question.category} · ${question.difficulty}`;

  const status = document.createElement('span');
  status.className =
    'mt-3 inline-flex items-center app-pill px-3 py-1 text-xs font-semibold uppercase tracking-wide';
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
