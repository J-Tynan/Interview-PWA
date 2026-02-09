import { saveQuestionRecord } from '../lib/storage.js';

const MODES = {
  PLAIN: 'plain',
  STRUCTURED: 'structured',
  POLISHED: 'polished'
};

function formatTime(timestamp) {
  if (!timestamp) {
    return '';
  }
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isStructuredNotes(notes) {
  return Boolean(notes && typeof notes === 'object' && Array.isArray(notes.sections));
}

function getPlainText(notes) {
  if (typeof notes === 'string') {
    return notes;
  }
  if (notes && typeof notes === 'object') {
    return notes.plain || '';
  }
  return '';
}

function buildPreviewText(notes, sections, bullets) {
  if (isStructuredNotes(notes)) {
    const content = sections.map((section, index) => {
      const value = section.trim();
      if (!value) {
        return '';
      }
      const label = bullets[index] ? bullets[index].trim() : `Prompt ${index + 1}`;
      return `${label}\n${value}`;
    }).filter(Boolean);
    return content.join('\n');
  }
  return getPlainText(notes);
}

function hasNoteContent(notes, sections) {
  if (typeof notes === 'string') {
    return Boolean(notes.trim());
  }
  if (sections) {
    return sections.some((section) => section.trim());
  }
  return false;
}

export function createNotesEditor({ bullets, record, onCommit, questionType, onSectionChange }) {
  const wrapper = document.createElement('section');
  wrapper.className = 'mt-6 app-card p-5';

  let currentRecord = { ...record };
  const getDefaultMode = () => {
    if (currentRecord.notesMode) {
      return currentRecord.notesMode;
    }
    if (isStructuredNotes(currentRecord.notes)) {
      return MODES.STRUCTURED;
    }
    if (questionType === 'narrative') {
      return MODES.STRUCTURED;
    }
    if (Array.isArray(bullets) && bullets.length >= 3) {
      return MODES.STRUCTURED;
    }
    return MODES.PLAIN;
  };

  let currentMode = getDefaultMode();
  let lastEditMode = currentMode === MODES.POLISHED
    ? (isStructuredNotes(currentRecord.notes) ? MODES.STRUCTURED : MODES.PLAIN)
    : currentMode;

  let plainText = getPlainText(currentRecord.notes);
  let sections = isStructuredNotes(currentRecord.notes)
    ? currentRecord.notes.sections.map((section) => section || '')
    : new Array(bullets.length).fill('');

  const header = document.createElement('div');
  header.className = 'flex flex-wrap items-center justify-between gap-3';

  const title = document.createElement('div');
  title.innerHTML = `
    <p class="text-xs font-semibold uppercase tracking-[0.2em] app-muted">Notes</p>
    <p class="mt-1 text-sm app-muted">Capture your answer and refine it with structure.</p>
  `;

  const modeGroup = document.createElement('div');
  modeGroup.className = 'flex flex-wrap items-center gap-2';

  const modeButtons = new Map();
  Object.values(MODES).forEach((mode) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'app-button-outline px-3 py-1 text-xs font-semibold uppercase tracking-wide app-focus';
    button.textContent = mode === MODES.PLAIN ? 'Plain draft' : (mode === MODES.STRUCTURED ? 'Structured' : 'Polished');
    button.addEventListener('click', () => setMode(mode));
    modeButtons.set(mode, button);
    modeGroup.append(button);
  });

  header.append(title, modeGroup);

  const metaRow = document.createElement('div');
  metaRow.className = 'mt-3 flex flex-wrap items-center gap-3 text-xs app-muted';

  const savedMeta = document.createElement('span');
  savedMeta.textContent = currentRecord.updatedAt ? `Last saved ${formatTime(currentRecord.updatedAt)}` : 'Not saved yet';

  const difficultyBadge = document.createElement('span');
  difficultyBadge.className = 'app-pill px-2 py-1 text-[10px] font-semibold uppercase tracking-wide';

  metaRow.append(savedMeta, difficultyBadge);

  const body = document.createElement('div');
  body.className = 'mt-4 space-y-4';

  const emptyTip = document.createElement('p');
  emptyTip.className = 'text-xs app-muted';
  emptyTip.textContent = "Tip: use Structured mode to map answers to the interviewer's prompts.";

  const structuredTip = document.createElement('p');
  structuredTip.className = 'app-banner text-xs app-muted';
  structuredTip.textContent = 'We moved your draft into section 1. Distribute it across the prompts.';

  const plainArea = document.createElement('textarea');
  plainArea.className = 'min-h-[180px] w-full app-input p-3 text-sm app-focus';
  plainArea.setAttribute('aria-label', 'Plain draft notes');
  plainArea.value = plainText;

  const structuredWrap = document.createElement('div');
  structuredWrap.className = 'space-y-3';

  const structuredInputs = bullets.map((bullet, index) => {
    const container = document.createElement('div');
    container.className = 'space-y-2';
    container.setAttribute('role', 'region');

    const label = document.createElement('p');
    label.className = 'text-xs font-semibold uppercase tracking-[0.2em] app-muted';
    label.id = `notes-section-${record.id}-${index}`;
    label.textContent = bullet?.trim() || `Prompt ${index + 1}`;
    container.setAttribute('aria-labelledby', label.id);

    const input = document.createElement('textarea');
    input.className = 'min-h-[120px] w-full app-input p-3 text-sm app-focus';
    input.setAttribute('aria-label', `Structured notes for prompt ${index + 1}`);
    input.value = sections[index] || '';

    container.append(label, input);
    structuredWrap.append(container);
    return input;
  });

  const setActiveSection = (activeIndex) => {
    structuredInputs.forEach((input, index) => {
      const container = input.parentElement;
      const isActive = index === activeIndex;
      input.setAttribute('aria-current', isActive ? 'true' : 'false');
      if (container) {
        container.setAttribute('aria-current', isActive ? 'true' : 'false');
      }
    });
  };

  const polishedWrap = document.createElement('div');
  polishedWrap.className = 'space-y-3';

  const polishedPreview = document.createElement('pre');
  polishedPreview.className = 'whitespace-pre-wrap rounded-2xl border border-[var(--app-border)] bg-[var(--app-input)] p-4 text-sm';

  const polishedCta = document.createElement('div');
  polishedCta.className = 'flex flex-wrap items-center gap-3';

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'app-button-outline px-3 py-1 text-xs font-semibold uppercase tracking-wide app-focus';
  copyButton.textContent = 'Copy to clipboard';

  const practiceButton = document.createElement('button');
  practiceButton.type = 'button';
  practiceButton.className = 'app-button px-3 py-1 text-xs font-semibold uppercase tracking-wide app-focus';
  practiceButton.textContent = 'I can explain this aloud';

  const confirmPolishedButton = document.createElement('button');
  confirmPolishedButton.type = 'button';
  confirmPolishedButton.className = 'app-button-outline px-3 py-1 text-xs font-semibold uppercase tracking-wide app-focus';
  confirmPolishedButton.textContent = 'Confirm polished';

  polishedCta.append(copyButton, confirmPolishedButton, practiceButton);
  polishedWrap.append(polishedPreview, polishedCta);

  const actions = document.createElement('div');
  actions.className = 'mt-4 flex flex-wrap items-center gap-3';

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'app-button px-4 py-2 text-sm font-semibold app-focus';
  saveButton.textContent = 'Save notes';

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'app-button-outline px-3 py-1 text-xs font-semibold uppercase tracking-wide app-focus';
  resetButton.textContent = 'Reset to empty';

  const revertButton = document.createElement('button');
  revertButton.type = 'button';
  revertButton.className = 'app-button-outline px-3 py-1 text-xs font-semibold uppercase tracking-wide app-focus';
  revertButton.textContent = 'Revert last save';

  const reviewButton = document.createElement('button');
  reviewButton.type = 'button';
  reviewButton.className = 'app-button-outline px-3 py-1 text-xs font-semibold uppercase tracking-wide app-focus';
  reviewButton.textContent = 'Mark reviewed';

  actions.append(saveButton, resetButton, revertButton, reviewButton);

  const shortcutHint = document.createElement('p');
  shortcutHint.className = 'text-xs app-muted';
  shortcutHint.textContent = 'Shortcuts: Ctrl/Cmd+S save · P polished · R reviewed · C confident';

  const toast = document.createElement('div');
  toast.className = 'app-toast';
  toast.setAttribute('aria-live', 'polite');

  body.append(emptyTip, structuredTip, plainArea, structuredWrap, polishedWrap, actions, shortcutHint, toast);

  wrapper.append(header, metaRow, body);

  let autosaveTimer = null;
  let lastSavedSignature = '';

  const buildSaveMessage = (timestamp) => (
    `Saved — your notes are private to this device. (${formatTime(timestamp)})`
  );

  const pushHistory = (history, snapshot) => {
    const next = [...(history || []), snapshot];
    return next.slice(-3);
  };

  function getNotesSignature(nextNotes) {
    return JSON.stringify(nextNotes);
  }

  function updateDifficultyBadge() {
    const mark = currentRecord.progress?.difficultyMark || 'none';
    difficultyBadge.textContent = `Difficulty: ${mark || 'none'}`;
  }

  function buildNotesPayload() {
    const formatMode = currentMode === MODES.POLISHED ? lastEditMode : currentMode;
    if (formatMode === MODES.STRUCTURED) {
      return {
        sections: sections.map((section) => section || ''),
        plain: plainText
      };
    }
    return plainText;
  }

  function updateVisibility() {
    const showPlain = currentMode === MODES.PLAIN;
    const showStructured = currentMode === MODES.STRUCTURED;
    const showPolished = currentMode === MODES.POLISHED;

    plainArea.classList.toggle('hidden', !showPlain);
    structuredWrap.classList.toggle('hidden', !showStructured);
    polishedWrap.classList.toggle('hidden', !showPolished);

    emptyTip.classList.toggle('hidden', !showPlain || plainText.trim().length > 0);
    structuredTip.classList.toggle('hidden', !showStructured || !structuredTip.dataset.show);

    modeButtons.forEach((button, mode) => {
      button.setAttribute('aria-pressed', mode === currentMode ? 'true' : 'false');
    });

    if (showStructured) {
      const activeIndex = structuredInputs.findIndex((input) => input.getAttribute('aria-current') === 'true');
      setActiveSection(activeIndex >= 0 ? activeIndex : 0);
    }
  }

  function updatePreview() {
    polishedPreview.textContent = buildPreviewText(buildNotesPayload(), sections, bullets) || 'No notes yet.';
  }

  function updateSavedMeta(timestamp) {
    savedMeta.textContent = timestamp ? `Last saved ${formatTime(timestamp)}` : 'Not saved yet';
  }

  async function commit(nextRecord) {
    const saved = await saveQuestionRecord(nextRecord);
    const committed = await onCommit(saved);
    currentRecord = committed || saved;
    updateSavedMeta(currentRecord.updatedAt);
    updateDifficultyBadge();
    return currentRecord;
  }

  function showToast(message, { isStrong = false, pulse = false } = {}) {
    toast.textContent = message;
    toast.classList.toggle('app-toast--strong', Boolean(isStrong));
    toast.classList.toggle('app-toast--pulse', Boolean(pulse));
    toast.classList.add('app-toast--show');
    window.setTimeout(() => {
      toast.classList.remove('app-toast--show');
      toast.classList.remove('app-toast--pulse');
    }, 1800);
  }

  async function saveNotes({ manual = false } = {}) {
    const nextNotes = buildNotesPayload();
    const signature = getNotesSignature(nextNotes);
    const filledSections = sections.filter((section) => section.trim()).length;
    const structuredThreshold = questionType === 'narrative'
      ? Math.min(2, bullets.length)
      : Math.ceil(bullets.length * 0.5);
    const shouldBeStructured =
      currentMode === MODES.STRUCTURED && filledSections >= structuredThreshold;

    let nextState = currentRecord.state || 'empty';
    if (hasNoteContent(nextNotes, sections) && nextState === 'empty') {
      nextState = 'draft';
    }
    if (shouldBeStructured && (nextState === 'draft' || nextState === 'empty')) {
      nextState = 'structured';
    }

    const hasChanges = signature !== lastSavedSignature || nextState !== currentRecord.state;
    if (!hasChanges && !manual) {
      return;
    }

    const snapshot = {
      savedAt: new Date().toISOString(),
      notes: currentRecord.notes,
      notesMode: currentRecord.notesMode,
      state: currentRecord.state,
      progress: currentRecord.progress,
      updatedAt: currentRecord.updatedAt
    };

    const now = new Date().toISOString();
    const nextRecord = {
      ...currentRecord,
      notes: nextNotes,
      notesMode: currentMode,
      state: nextState,
      progress: {
        ...(currentRecord.progress || {}),
        updatedAt: now
      },
      updatedAt: now,
      history: pushHistory(currentRecord.history, snapshot)
    };

    lastSavedSignature = signature;
    await commit(nextRecord);

    const message = buildSaveMessage(nextRecord.updatedAt);
    showToast(message, { isStrong: manual, pulse: manual });
  }

  function scheduleAutosave() {
    if (autosaveTimer) {
      window.clearTimeout(autosaveTimer);
    }
    autosaveTimer = window.setTimeout(() => saveNotes({ manual: false }), 3000);
  }

  function setMode(nextMode) {
    if (currentMode === nextMode) {
      return;
    }
    let didMigrate = false;
    if (nextMode === MODES.STRUCTURED && currentMode === MODES.PLAIN) {
      if (plainText.trim() && !sections.some((section) => section.trim())) {
        sections[0] = plainText.trim();
        structuredInputs[0].value = sections[0];
        didMigrate = true;
      }
    }
    structuredTip.dataset.show = didMigrate ? 'true' : '';

    if (nextMode !== MODES.POLISHED) {
      lastEditMode = nextMode;
    }

    currentMode = nextMode;
    updatePreview();
    updateVisibility();
  }

  plainArea.addEventListener('input', () => {
    plainText = plainArea.value;
    scheduleAutosave();
    updateVisibility();
  });

  structuredInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      sections[index] = input.value;
      scheduleAutosave();
    });
    input.addEventListener('focus', () => {
      setActiveSection(index);
      if (typeof onSectionChange === 'function') {
        onSectionChange(index);
      }
    });
  });

  saveButton.addEventListener('click', () => saveNotes({ manual: true }));

  wrapper.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const tag = event.target.tagName;
    const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

    if (key === 's' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      saveNotes({ manual: true });
      return;
    }

    if (isTyping) {
      return;
    }

    if (key === 'r') {
      event.preventDefault();
      reviewButton.click();
    }

    if (key === 'c' && currentMode === MODES.POLISHED) {
      event.preventDefault();
      practiceButton.click();
    }
  });

  resetButton.addEventListener('click', async () => {
    if (!window.confirm('Reset notes to empty? This will clear your draft.')) {
      return;
    }
    const snapshot = {
      savedAt: new Date().toISOString(),
      notes: currentRecord.notes,
      notesMode: currentRecord.notesMode,
      state: currentRecord.state,
      progress: currentRecord.progress,
      updatedAt: currentRecord.updatedAt
    };
    const now = new Date().toISOString();
    const nextRecord = {
      ...currentRecord,
      notes: '',
      notesMode: MODES.PLAIN,
      state: 'empty',
      progress: {
        ...(currentRecord.progress || {}),
        updatedAt: now
      },
      updatedAt: now,
      history: pushHistory(currentRecord.history, snapshot)
    };
    plainText = '';
    sections = new Array(bullets.length).fill('');
    structuredInputs.forEach((input) => {
      input.value = '';
    });
    plainArea.value = '';
    setMode(MODES.PLAIN);
    lastSavedSignature = '';
    await commit(nextRecord);
    showToast('Reset to empty', { isStrong: false });
  });

  revertButton.addEventListener('click', async () => {
    const history = currentRecord.history || [];
    if (!history.length) {
      return;
    }
    if (!window.confirm('Revert to your last saved version?')) {
      return;
    }
    const snapshot = history[history.length - 1];
    const now = new Date().toISOString();
    const nextRecord = {
      ...currentRecord,
      notes: snapshot.notes,
      notesMode: snapshot.notesMode || MODES.PLAIN,
      state: snapshot.state || 'draft',
      progress: {
        ...(snapshot.progress || currentRecord.progress || {}),
        updatedAt: now
      },
      updatedAt: now,
      history: history.slice(0, -1)
    };
    plainText = getPlainText(nextRecord.notes);
    if (isStructuredNotes(nextRecord.notes)) {
      sections = nextRecord.notes.sections.map((section) => section || '');
      structuredInputs.forEach((input, index) => {
        input.value = sections[index] || '';
      });
      setMode(MODES.STRUCTURED);
    } else {
      sections = new Array(bullets.length).fill('');
      setMode(MODES.PLAIN);
    }
    plainArea.value = plainText;
    lastSavedSignature = getNotesSignature(nextRecord.notes);
    await commit(nextRecord);
    showToast('Reverted to last save', { isStrong: false });
  });

  reviewButton.addEventListener('click', async () => {
    const now = new Date().toISOString();
    const nextRecord = {
      ...currentRecord,
      progress: {
        ...(currentRecord.progress || {}),
        lastReviewed: now,
        updatedAt: now,
        reviewCount: (currentRecord.progress?.reviewCount || 0) + 1
      },
      updatedAt: now
    };
    await commit(nextRecord);
    showToast('Marked as reviewed', { isStrong: false });
  });

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(polishedPreview.textContent || '');
      showToast('Copied to clipboard', false);
    } catch {
      showToast('Copy failed', false);
    }
  });

  practiceButton.addEventListener('click', async () => {
    const now = new Date().toISOString();
    const nextRecord = {
      ...currentRecord,
      state: 'confident',
      notesMode: MODES.POLISHED,
      progress: {
        ...(currentRecord.progress || {}),
        updatedAt: now
      },
      updatedAt: now
    };
    await commit(nextRecord);
    showToast('Marked confident', { isStrong: false });
  });

  confirmPolishedButton.addEventListener('click', async () => {
    const now = new Date().toISOString();
    const nextRecord = {
      ...currentRecord,
      state: 'polished',
      notesMode: MODES.POLISHED,
      progress: {
        ...(currentRecord.progress || {}),
        updatedAt: now
      },
      updatedAt: now
    };
    await commit(nextRecord);
    showToast('Marked polished', { isStrong: false });
  });

  function togglePolished() {
    const nextMode = currentMode === MODES.POLISHED ? lastEditMode : MODES.POLISHED;
    setMode(nextMode);
  }

  async function markDifficulty() {
    const current = currentRecord.progress?.difficultyMark || '';
    const next = current ? '' : 'needs-work';
    const now = new Date().toISOString();
    const nextRecord = {
      ...currentRecord,
      progress: {
        ...(currentRecord.progress || {}),
        difficultyMark: next,
        updatedAt: now
      },
      updatedAt: now
    };
    await commit(nextRecord);
    showToast(`Difficulty mark ${next ? 'added' : 'cleared'}`, { isStrong: false });
  }

  function hasNotes() {
    return hasNoteContent(buildNotesPayload(), sections);
  }

  lastSavedSignature = getNotesSignature(buildNotesPayload());
  updateDifficultyBadge();
  updatePreview();
  updateVisibility();

  return {
    element: wrapper,
    focus: () => {
      if (currentMode === MODES.PLAIN) {
        plainArea.focus();
      } else if (currentMode === MODES.STRUCTURED) {
        structuredInputs[0]?.focus();
      }
    },
    hasNotes,
    togglePolished,
    markDifficulty,
    setMode,
    setActiveIndex: (index) => {
      setActiveSection(index);
    }
  };
}
