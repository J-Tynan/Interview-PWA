import questions from '../data/questions.json';
import { createRouter } from './router.js';
import { applyTheme, loadTheme, saveTheme, setStyle, STYLE_PRESETS, toggleMode } from './theme.js';
import { renderDashboard } from '../pages/Dashboard.js';
import { renderQuestionDetail } from '../pages/QuestionDetail.js';
import { renderReview } from '../pages/Review.js';

const STORAGE_KEY = 'interview-pwa-notes';

async function openNotesDB() {
  if (!('indexedDB' in window)) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('interview-pwa', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'questionId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadNotesFromIDB(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('notes', 'readonly');
    const store = tx.objectStore('notes');
    const request = store.getAll();

    request.onsuccess = () => {
      const records = request.result || [];
      const notes = {};
      for (const record of records) {
        notes[record.questionId] = record.note;
      }
      resolve(notes);
    };

    request.onerror = () => reject(request.error);
  });
}

async function saveNoteToIDB(db, questionId, note) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    store.put({ questionId, note });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function loadNotesFromLocalStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveNotesToLocalStorage(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export async function initShell(root) {
  if (!root) {
    return;
  }

  let theme = loadTheme();
  applyTheme(theme);

  const db = await openNotesDB().catch(() => null);
  const notes = db ? await loadNotesFromIDB(db) : loadNotesFromLocalStorage();

  const state = {
    questions,
    notes
  };

  let currentRoute = null;

  const updateTheme = (nextTheme) => {
    theme = nextTheme;
    applyTheme(theme);
    saveTheme(theme);
    if (currentRoute) {
      renderRoute(currentRoute);
    }
  };

  const handleToggleTheme = () => updateTheme(toggleMode(theme));
  const handleStyleChange = (style) => updateTheme(setStyle(theme, style));

  const renderRoute = (route) => {
    currentRoute = route;
    root.innerHTML = '';
    if (route.path === 'question') {
      const questionId = route.params[0];
      const question = state.questions.find((item) => item.id === questionId);
      root.append(
        renderQuestionDetail({
          question,
          note: state.notes[questionId] || '',
          onSaveNote: async (nextNote) => {
            state.notes[questionId] = nextNote;
            if (db) {
              await saveNoteToIDB(db, questionId, nextNote);
            } else {
              saveNotesToLocalStorage(state.notes);
            }
          },
          onBack: () => router.navigate('/'),
          theme,
          styles: STYLE_PRESETS,
          onToggleTheme: handleToggleTheme,
          onStyleChange: handleStyleChange
        })
      );
      return;
    }

    if (route.path === 'review') {
      root.append(
        renderReview({
          questions: state.questions,
          notes: state.notes,
          onOpenQuestion: (id) => router.navigate(`/question/${id}`),
          onBack: () => router.navigate('/'),
          theme,
          styles: STYLE_PRESETS,
          onToggleTheme: handleToggleTheme,
          onStyleChange: handleStyleChange
        })
      );
      return;
    }

    root.append(
      renderDashboard({
        questions: state.questions,
        notes: state.notes,
        onOpenQuestion: (id) => router.navigate(`/question/${id}`),
        onOpenReview: () => router.navigate('/review'),
        theme,
        styles: STYLE_PRESETS,
        onToggleTheme: handleToggleTheme,
        onStyleChange: handleStyleChange
      })
    );
  };

  const router = createRouter((route) => renderRoute(route));

  router.start();

  // Extend here to add global event listeners, sync, or UI kit provider wrappers.
}
