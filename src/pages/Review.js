export function renderReview({ questions, notes, onOpenQuestion, onBack }) {
  const page = document.createElement('main');
  page.className = 'mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-10';

  const header = document.createElement('header');
  header.className = 'flex flex-wrap items-center justify-between gap-4';
  header.innerHTML = `
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Review mode</p>
      <h1 class="mt-2 text-3xl font-semibold text-slate-900">Focus areas</h1>
      <p class="mt-2 text-sm text-slate-500">Quickly jump back into unanswered questions.</p>
    </div>
  `;

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className =
    'rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';
  backButton.textContent = 'Back to dashboard';
  backButton.addEventListener('click', onBack);
  header.append(backButton);

  const list = document.createElement('section');
  list.className = 'mt-8 space-y-3';

  questions.forEach((question) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className =
      'flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left text-sm font-semibold text-slate-800 transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';
    item.textContent = `${question.prompt}`;

    const status = document.createElement('span');
    status.className =
      'ml-3 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600';
    status.textContent = notes[question.id] ? 'Ready' : 'Needs notes';

    item.append(status);
    item.addEventListener('click', () => onOpenQuestion(question.id));
    list.append(item);
  });

  page.append(header, list);

  return page;
}
