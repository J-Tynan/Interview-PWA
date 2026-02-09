export function createBulletStepper({
  bullets = [],
  initialIndex = 0,
  labelText = 'Prompts',
  stepLabel = 'Step',
  onStepChange
} = {}) {
  const wrapper = document.createElement('section');
  wrapper.className = 'mt-6 app-card p-5';

  const header = document.createElement('div');
  header.className = 'flex flex-wrap items-center justify-between gap-3';

  const label = document.createElement('p');
  label.className = 'text-xs font-semibold uppercase tracking-[0.2em] app-muted';
  label.textContent = labelText;

  const indicator = document.createElement('span');
  indicator.className = 'text-xs font-semibold app-muted';

  header.append(label, indicator);

  const list = document.createElement('ul');
  list.className = 'mt-4 space-y-2';
  list.setAttribute('role', 'list');

  const liveRegion = document.createElement('p');
  liveRegion.className = 'app-sr-only';
  liveRegion.setAttribute('aria-live', 'polite');

  const actions = document.createElement('div');
  actions.className = 'mt-4 flex flex-wrap items-center gap-3';

  const prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.className = 'app-button-outline px-3 py-1 text-xs font-semibold uppercase tracking-wide app-focus';
  prevButton.textContent = 'Prev';

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.className = 'app-button-outline px-3 py-1 text-xs font-semibold uppercase tracking-wide app-focus';
  nextButton.textContent = 'Next';

  actions.append(prevButton, nextButton);

  const buttons = [];
  bullets.forEach((bullet, index) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'listitem');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'app-step app-focus w-full text-left';
    button.dataset.index = `${index}`;
    button.innerHTML = `<span class="app-step-index">${index + 1}</span><span>${bullet}</span>`;
    button.addEventListener('click', () => setActive(index));

    li.append(button);
    list.append(li);
    buttons.push(button);
  });

  let activeIndex = Math.max(0, Math.min(initialIndex, bullets.length - 1));
  let revealedIndex = activeIndex;

  function updateIndicator() {
    if (!bullets.length) {
      indicator.textContent = '0/0';
      return;
    }
    indicator.textContent = `${activeIndex + 1}/${bullets.length}`;
  }

  function updateButtons() {
    buttons.forEach((button, index) => {
      const isActive = index === activeIndex;
      button.classList.toggle('app-step--active', isActive);
      button.tabIndex = isActive ? 0 : -1;
      if (isActive) {
        button.setAttribute('aria-current', 'step');
      } else {
        button.removeAttribute('aria-current');
      }
    });

    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex >= bullets.length - 1;
    updateIndicator();
  }

  function announceStep() {
    if (!bullets.length) {
      liveRegion.textContent = '';
      return;
    }
    liveRegion.textContent = `${stepLabel} ${activeIndex + 1} of ${bullets.length}: ${bullets[activeIndex]}`;
  }

  function revealStep(index) {
    const button = buttons[index];
    if (!button) {
      return;
    }
    button.classList.add('app-step--revealed');
    window.setTimeout(() => {
      button.classList.remove('app-step--revealed');
    }, 360);
  }

  function setActive(index, { focus = false, announce = true } = {}) {
    const nextIndex = Math.max(0, Math.min(index, bullets.length - 1));
    const wasReveal = nextIndex > revealedIndex;
    activeIndex = nextIndex;
    if (wasReveal) {
      revealedIndex = nextIndex;
      revealStep(nextIndex);
    }
    updateButtons();
    if (announce) {
      announceStep();
    }
    if (typeof onStepChange === 'function') {
      onStepChange(activeIndex);
    }
    if (focus) {
      buttons[activeIndex]?.focus();
    }
  }

  function next() {
    if (activeIndex < bullets.length - 1) {
      setActive(activeIndex + 1, { focus: true });
    }
  }

  function prev() {
    if (activeIndex > 0) {
      setActive(activeIndex - 1, { focus: true });
    }
  }

  prevButton.addEventListener('click', prev);
  nextButton.addEventListener('click', next);

  updateButtons();
  announceStep();

  wrapper.append(header, list, actions, liveRegion);

  return {
    element: wrapper,
    focusFirst: () => buttons[activeIndex]?.focus(),
    next,
    prev,
    setActive,
    getActiveIndex: () => activeIndex
  };
}
