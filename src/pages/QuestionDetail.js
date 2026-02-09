import { createBulletStepper } from '../components/BulletStepper.js';
import { createDiagramRenderer } from '../components/DiagramRenderer.js';
import { createNotesEditor } from '../components/NotesEditor.js';
import { createTopBar } from '../components/TopBar.js';
import { createHelpOverlay } from '../components/HelpOverlay.js';

const STATE_LABELS = {
  empty: 'Empty',
  draft: 'Draft',
  structured: 'Structured',
  polished: 'Polished',
  confident: 'Confident'
};

function createDefaultRecord(question) {
  const now = new Date().toISOString();
  return {
    id: question.id,
    notes: '',
    notesMode: 'plain',
    state: question.state || 'empty',
    progress: {
      lastReviewed: question.progress?.lastReviewed ?? null,
      reviewCount: question.progress?.reviewCount ?? 0,
      difficultyMark: question.progress?.difficultyMark ?? '',
      updatedAt: question.progress?.updatedAt ?? null
    },
    updatedAt: now,
    history: []
  };
}

function formatState(state) {
  return STATE_LABELS[state] || 'Empty';
}

// Using shared HelpOverlay component from src/components/HelpOverlay.js

export function renderQuestionDetail({
  question,
  record,
  onSaveRecord,
  onDeleteRecord,
  onBack,
  theme,
  styles,
  onToggleTheme,
  onStyleChange
}) {
  const page = document.createElement('main');
  page.className = 'mx-auto flex min-h-screen max-w-4xl flex-col px-6 app-page';

  const helpButton = document.createElement('button');
  helpButton.type = 'button';
  helpButton.className = 'app-button-outline app-no-elevate px-4 py-2 text-sm font-semibold app-focus';
  helpButton.textContent = 'Keyboard help';

  const topBar = createTopBar({
    theme,
    styles,
    onToggleMode: onToggleTheme,
    onStyleChange,
    action: helpButton
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

  const meta = document.createElement('p');
  meta.className = 'text-xs font-semibold uppercase tracking-[0.2em] app-muted';
  meta.textContent = `${question.category} · ${question.difficulty}`;

  const title = document.createElement('h1');
  title.className = 'mt-3 text-2xl font-semibold';
  title.textContent = question.title;

  const examples = document.createElement('p');
  examples.className = 'mt-3 text-sm app-muted';
  const exampleText = (question.examples || []).join(' · ');
  examples.textContent = exampleText ? `Examples: ${exampleText}` : 'Examples: none yet';

  const badgeRow = document.createElement('div');
  badgeRow.className = 'mt-4 flex flex-wrap items-center gap-2';

  const stateBadge = document.createElement('span');
  stateBadge.className = 'app-pill px-3 py-1 text-xs font-semibold uppercase tracking-wide';

  const typeBadge = document.createElement('span');
  typeBadge.className = 'app-pill px-3 py-1 text-xs font-semibold uppercase tracking-wide';
  typeBadge.textContent = `Type: ${question.type}`;

  badgeRow.append(stateBadge, typeBadge);
  header.append(meta, title, examples, badgeRow);

  const currentRecord = record ? { ...record } : createDefaultRecord(question);
  stateBadge.textContent = `State: ${formatState(currentRecord.state)}`;

  const bulletStepper = createBulletStepper({
    bullets: question.bullets || [],
    initialIndex: 0
  });

  const notesEditor = createNotesEditor({
    bullets: question.bullets || [],
    record: currentRecord,
    onCommit: async (nextRecord) => {
      const saved = await onSaveRecord(nextRecord);
      stateBadge.textContent = `State: ${formatState(saved.state)}`;
      return saved;
    }
  });

  const diagram = createDiagramRenderer({
    diagramHints: question.diagramHints,
    title: question.title
  });

  const helpOverlay = createHelpOverlay({
    onClose: () => {
      helpButton.focus();
    }
  });

  const isHelpOpen = () => !helpOverlay.element.classList.contains('app-hidden');

  helpButton.addEventListener('click', () => {
    helpOverlay.open();
  });

  const handleKeydown = (event) => {
    if (!page.isConnected) {
      return;
    }
    const tag = event.target.tagName;
    const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if ((event.key === 'Escape' || event.key === 'Esc') && isHelpOpen()) {
      event.preventDefault();
      helpOverlay.close();
      return;
    }
    if (isTyping) {
      return;
    }

    if (event.key.toLowerCase() === 'j' || event.key === 'ArrowRight') {
      event.preventDefault();
      bulletStepper.next();
    }

    if (event.key.toLowerCase() === 'k' || event.key === 'ArrowLeft') {
      event.preventDefault();
      bulletStepper.prev();
    }

    if (event.key.toLowerCase() === 'p') {
      event.preventDefault();
      notesEditor.togglePolished();
    }

    if (event.key.toLowerCase() === 'm') {
      event.preventDefault();
      notesEditor.markDifficulty();
    }
  };

  window.addEventListener('keydown', handleKeydown);

  page.append(
    topBar,
    backButton,
    header,
    bulletStepper.element,
    notesEditor.element,
    diagram.element,
    helpOverlay.element
  );

  window.setTimeout(() => {
    if (notesEditor.hasNotes()) {
      notesEditor.focus();
    } else {
      bulletStepper.focusFirst();
    }
  }, 0);

  return page;
}
