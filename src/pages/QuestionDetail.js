import { createEditor } from '../components/Editor.js';

export function renderQuestionDetail({ question, note, onSaveNote, onBack }) {
  const page = document.createElement('main');
  page.className = 'mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className =
    'w-fit rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';
  backButton.textContent = 'Back to dashboard';
  backButton.addEventListener('click', onBack);

  if (!question) {
    const message = document.createElement('p');
    message.className = 'mt-6 text-sm text-slate-500';
    message.textContent = 'Question not found.';
    page.append(backButton, message);
    return page;
  }

  const header = document.createElement('section');
  header.className = 'mt-6 rounded-2xl border border-slate-200 bg-white p-6';
  header.innerHTML = `
    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">${question.category}</p>
    <h1 class="mt-3 text-2xl font-semibold text-slate-900">${question.prompt}</h1>
    <p class="mt-3 text-sm text-slate-500">${question.brief}</p>
  `;

  const list = document.createElement('ul');
  list.className = 'mt-4 space-y-2 text-sm text-slate-600';
  question.prompts.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `• ${item}`;
    list.append(li);
  });
  header.append(list);

  const editor = createEditor({
    value: note,
    onSave: onSaveNote
  });

  page.append(backButton, header, editor);

  return page;
}
