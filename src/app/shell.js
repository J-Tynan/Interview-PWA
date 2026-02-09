import questions from '../data/questions.json';
import { createRouter } from './router.js';
import { applyTheme, loadTheme, saveTheme, setStyle, STYLE_PRESETS, toggleMode } from './theme.js';
import { renderDashboard } from '../pages/Dashboard.js';
import { renderQuestionDetail } from '../pages/QuestionDetail.js';
import { renderReview } from '../pages/Review.js';
import {
  deleteQuestionRecord,
  getAllQuestionRecords,
  getLegacyNotes,
  saveQuestionRecord
} from '../lib/storage.js';

function createDefaultRecord(question, note = '') {
  const now = new Date().toISOString();
  const progress = {
    lastReviewed: question.progress?.lastReviewed ?? null,
    reviewCount: question.progress?.reviewCount ?? 0,
    difficultyMark: question.progress?.difficultyMark ?? '',
    updatedAt: question.progress?.updatedAt ?? null
  };

  return {
    id: question.id,
    notes: note,
    notesMode: 'plain',
    state: note && note.trim() ? 'draft' : (question.state || 'empty'),
    progress,
    updatedAt: now,
    history: []
  };
}

export async function initShell(root) {
  if (!root) {
    return;
  }

  let theme = loadTheme();
  applyTheme(theme);

  const records = await getAllQuestionRecords();
  const legacyNotes = await getLegacyNotes();

  for (const question of questions) {
    if (!records[question.id] && legacyNotes[question.id]) {
      const record = createDefaultRecord(question, legacyNotes[question.id]);
      records[question.id] = await saveQuestionRecord(record);
    }
  }

  const state = {
    questions,
    records
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
          record: state.records[questionId] || null,
          onSaveRecord: async (nextRecord) => {
            const saved = await saveQuestionRecord(nextRecord);
            state.records[saved.id] = saved;
            return saved;
          },
          onDeleteRecord: async (id) => {
            await deleteQuestionRecord(id);
            delete state.records[id];
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
          records: state.records,
          onOpenQuestion: (id) => router.navigateTo('question', { id }),
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
        records: state.records,
        onOpenQuestion: (id) => router.navigateTo('question', { id }),
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
