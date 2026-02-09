import { createQuestionCard } from '../components/QuestionCard.js';
import { createProgressBar } from '../components/ProgressBar.js';
import { createTopBar } from '../components/TopBar.js';

export function renderDashboard({
  questions,
  notes,
  onOpenQuestion,
  onOpenReview,
  theme,
  styles,
  onToggleTheme,
  onStyleChange
}) {
  const GROUP_STORAGE_KEY = 'interview-pwa-grouping';
  const SORT_STORAGE_KEY = 'interview-pwa-grouping-sort';
  const VIEW_STORAGE_KEY = 'interview-pwa-grouping-view';
  const DIFFICULTY_ORDER = ['Core', 'Intermediate', 'Senior'];

  const page = document.createElement('main');
  page.className = 'mx-auto flex min-h-screen max-w-5xl flex-col px-6 app-page';

  const topBar = createTopBar({
    theme,
    styles,
    onToggleMode: onToggleTheme,
    onStyleChange
  });

  const header = document.createElement('header');
  header.className = 'flex flex-wrap items-center justify-between gap-4';
  header.innerHTML = `
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.2em] app-muted">Interview prep</p>
      <h1 class="mt-2 text-3xl font-semibold">Dashboard</h1>
      <p class="mt-2 text-sm app-muted">Track questions, capture notes, and review your progress.</p>
    </div>
  `;

  const reviewButton = document.createElement('button');
  reviewButton.type = 'button';
  reviewButton.className =
    'app-button-outline px-4 py-2 text-sm font-semibold transition app-focus';
  reviewButton.textContent = 'Open review';
  reviewButton.addEventListener('click', onOpenReview);
  header.append(reviewButton);

  const answeredCount = questions.filter((q) => notes[q.id]).length;
  page.append(topBar, header, createProgressBar({ current: answeredCount, total: questions.length }));

  const groupWrap = document.createElement('section');
  groupWrap.className = 'mt-6 flex flex-wrap items-center gap-3';

  const groupLabel = document.createElement('p');
  groupLabel.className = 'text-xs font-semibold uppercase tracking-[0.2em] app-muted';
  groupLabel.textContent = 'Group by';

  const groupFieldset = document.createElement('fieldset');
  groupFieldset.className = 'flex flex-wrap items-center gap-2';
  groupFieldset.setAttribute('aria-label', 'Group questions by');

  const groupOptions = [
    { id: 'all', label: 'Show all' },
    { id: 'category', label: 'Category' },
    { id: 'type', label: 'Type' },
    { id: 'difficulty', label: 'Difficulty' }
  ];

  const loadGrouping = () => {
    try {
      const stored = localStorage.getItem(GROUP_STORAGE_KEY);
      const hasOption = groupOptions.some((option) => option.id === stored);
      return hasOption ? stored : 'category';
    } catch {
      return 'category';
    }
  };

  let activeGroup = loadGrouping();

  const loadSortOrder = () => {
    try {
      const stored = localStorage.getItem(SORT_STORAGE_KEY);
      return stored === 'desc' ? 'desc' : 'asc';
    } catch {
      return 'asc';
    }
  };

  const loadViewMode = () => {
    try {
      const stored = localStorage.getItem(VIEW_STORAGE_KEY);
      return stored === 'compact' ? 'compact' : 'grid';
    } catch {
      return 'grid';
    }
  };

  let activeSort = loadSortOrder();
  let activeView = loadViewMode();

  const groupButtons = new Map();
  groupOptions.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'app-button-outline px-3 py-1 text-xs font-semibold uppercase tracking-wide app-focus';
    button.textContent = option.label;
    button.dataset.group = option.id;
    button.setAttribute('aria-pressed', option.id === activeGroup ? 'true' : 'false');
    button.addEventListener('click', () => setGrouping(option.id));
    groupButtons.set(option.id, button);
    groupFieldset.append(button);
  });

  groupWrap.append(groupLabel, groupFieldset);

  const controlWrap = document.createElement('section');
  controlWrap.className = 'mt-4 flex flex-wrap items-center gap-3';

  const sortFieldset = document.createElement('fieldset');
  sortFieldset.className = 'flex flex-wrap items-center gap-2';
  sortFieldset.setAttribute('aria-label', 'Sort questions');

  const sortLabel = document.createElement('p');
  sortLabel.className = 'text-xs font-semibold uppercase tracking-[0.2em] app-muted';
  sortLabel.textContent = 'Sort';

  const sortButtons = new Map();
  const sortOptions = [
    { id: 'asc', label: 'A–Z' },
    { id: 'desc', label: 'Z–A' }
  ];

  sortOptions.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'app-button-outline px-3 py-1 text-xs font-semibold uppercase tracking-wide app-focus';
    button.textContent = option.label;
    button.dataset.sort = option.id;
    button.setAttribute('aria-pressed', option.id === activeSort ? 'true' : 'false');
    button.addEventListener('click', () => setSort(option.id));
    sortButtons.set(option.id, button);
    sortFieldset.append(button);
  });

  const viewFieldset = document.createElement('fieldset');
  viewFieldset.className = 'flex flex-wrap items-center gap-2';
  viewFieldset.setAttribute('aria-label', 'Change layout density');

  const viewLabel = document.createElement('p');
  viewLabel.className = 'text-xs font-semibold uppercase tracking-[0.2em] app-muted';
  viewLabel.textContent = 'View';

  const viewButtons = new Map();
  const viewOptions = [
    { id: 'grid', label: 'Grid' },
    { id: 'compact', label: 'Compact' }
  ];

  viewOptions.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'app-button-outline px-3 py-1 text-xs font-semibold uppercase tracking-wide app-focus';
    button.textContent = option.label;
    button.dataset.view = option.id;
    button.setAttribute('aria-pressed', option.id === activeView ? 'true' : 'false');
    button.addEventListener('click', () => setView(option.id));
    viewButtons.set(option.id, button);
    viewFieldset.append(button);
  });

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'app-button-outline px-3 py-1 text-xs font-semibold uppercase tracking-wide app-focus';
  resetButton.textContent = 'Reset to default';
  resetButton.addEventListener('click', () => resetControls());

  controlWrap.append(sortLabel, sortFieldset, viewLabel, viewFieldset, resetButton);

  const content = document.createElement('section');
  content.className = 'mt-6 space-y-8';

  const getGroupLabel = (groupId) => {
    if (groupId === 'all') {
      return 'All';
    }
    return groupId.charAt(0).toUpperCase() + groupId.slice(1);
  };

  const getGroupValue = (question, groupId) => {
    if (groupId === 'all') {
      return 'All questions';
    }
    if (groupId === 'type') {
      return question.type;
    }
    if (groupId === 'difficulty') {
      return question.difficulty;
    }
    return question.category;
  };

  const sortQuestions = (items) => {
    const sorted = items.slice().sort((a, b) => a.title.localeCompare(b.title));
    return activeSort === 'desc' ? sorted.reverse() : sorted;
  };

  const sortGroupKeys = (entries) => {
    if (activeGroup === 'difficulty') {
      const ordered = activeSort === 'desc'
        ? DIFFICULTY_ORDER.slice().reverse()
        : DIFFICULTY_ORDER;
      return entries.sort(([a], [b]) => ordered.indexOf(a) - ordered.indexOf(b));
    }
    const sorted = entries.sort(([a], [b]) => a.localeCompare(b));
    return activeSort === 'desc' ? sorted.reverse() : sorted;
  };

  const renderGroups = () => {
    content.innerHTML = '';

    if (activeGroup === 'all') {
      const grid = document.createElement('section');
      grid.className = activeView === 'compact'
        ? 'flex flex-col gap-2'
        : 'grid gap-4 md:grid-cols-2';
      sortQuestions(questions).forEach((question) => {
        const card = createQuestionCard({
          question,
          isAnswered: Boolean(notes[question.id]),
          onOpen: onOpenQuestion,
          isCompact: activeView === 'compact'
        });
        grid.append(card);
      });
      content.append(grid);
      return;
    }

    const grouped = new Map();
    questions.forEach((question) => {
      const key = getGroupValue(question, activeGroup) || 'Other';
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(question);
    });

    sortGroupKeys(Array.from(grouped.entries())).forEach(([groupKey, groupQuestions]) => {
        const section = document.createElement('section');

        const heading = document.createElement('div');
        heading.className = 'flex items-center justify-between';

        const title = document.createElement('h2');
        title.className = 'text-sm font-semibold uppercase tracking-[0.2em] app-muted';
        title.textContent = `${getGroupLabel(activeGroup)} · ${groupKey}`;

        const count = document.createElement('span');
        count.className = 'text-xs app-muted';
        count.textContent = `${groupQuestions.length} items`;

        heading.append(title, count);

        const grid = document.createElement('section');
        grid.className = activeView === 'compact'
          ? 'mt-4 flex flex-col gap-2'
          : 'mt-4 grid gap-4 md:grid-cols-2';

        sortQuestions(groupQuestions).forEach((question) => {
          const card = createQuestionCard({
            question,
            isAnswered: Boolean(notes[question.id]),
            onOpen: onOpenQuestion,
            isCompact: activeView === 'compact'
          });
          grid.append(card);
        });

        section.append(heading, grid);
        content.append(section);
        });
  };

  const setGrouping = (groupId) => {
    activeGroup = groupId;
    try {
      localStorage.setItem(GROUP_STORAGE_KEY, groupId);
    } catch {
      // Ignore storage errors (private mode, disabled storage).
    }
    groupButtons.forEach((button, id) => {
      button.setAttribute('aria-pressed', id === groupId ? 'true' : 'false');
    });
    renderGroups();
  };

  const setSort = (sortId) => {
    activeSort = sortId;
    try {
      localStorage.setItem(SORT_STORAGE_KEY, sortId);
    } catch {
      // Ignore storage errors (private mode, disabled storage).
    }
    sortButtons.forEach((button, id) => {
      button.setAttribute('aria-pressed', id === sortId ? 'true' : 'false');
    });
    renderGroups();
  };

  const setView = (viewId) => {
    activeView = viewId;
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, viewId);
    } catch {
      // Ignore storage errors (private mode, disabled storage).
    }
    viewButtons.forEach((button, id) => {
      button.setAttribute('aria-pressed', id === viewId ? 'true' : 'false');
    });
    renderGroups();
  };

  const resetControls = () => {
    setGrouping('category');
    setSort('asc');
    setView('grid');
  };

  renderGroups();

  const footer = document.createElement('footer');
  footer.className = 'mt-auto pt-10 text-xs app-muted';
  footer.textContent = 'Local-first notes stored in your browser.';

  page.append(groupWrap, controlWrap, content, footer);

  return page;
}
