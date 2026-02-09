function getStatusLabel(record) {
  if (!record || record.state === 'empty') {
    return 'Needs notes';
  }
  return record.state.charAt(0).toUpperCase() + record.state.slice(1);
}

export function createQuestionCard({ question, record, isCompact = false, onOpen }) {
  const card = document.createElement('article');
  const baseClass = 'group app-card transition app-focus cursor-pointer';
  card.className = isCompact ? `${baseClass} p-3` : `${baseClass} p-5`;
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-pressed', 'false');

  const title = document.createElement('h3');
  title.className = isCompact ? 'text-base font-semibold' : 'text-lg font-semibold';
  title.textContent = question.title;

  const meta = document.createElement('p');
  meta.className = isCompact ? 'mt-1 text-xs app-muted' : 'mt-2 text-sm app-muted';
  meta.textContent = `${question.category} · ${question.difficulty}`;

  const status = document.createElement('span');
  status.className = isCompact
    ? 'mt-2 inline-flex items-center app-pill px-2 py-1 text-[10px] font-semibold uppercase tracking-wide'
    : 'mt-3 inline-flex items-center app-pill px-3 py-1 text-xs font-semibold uppercase tracking-wide';
  status.textContent = getStatusLabel(record);

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
