const THEME_STORAGE_KEY = 'interview-pwa-theme';

export const STYLE_PRESETS = [
  {
    id: 'atlas',
    label: 'Atlas',
    description: 'Clean neutral',
    themeColor: {
      light: '#0f172a',
      dark: '#0b1220'
    }
  },
  {
    id: 'graphite',
    label: 'Graphite',
    description: 'Dark pro',
    themeColor: {
      light: '#111827',
      dark: '#0a0c10'
    }
  },
  {
    id: 'ivory',
    label: 'Ivory',
    description: 'Editorial',
    themeColor: {
      light: '#2f2a24',
      dark: '#15110e'
    }
  },
  {
    id: 'cobalt',
    label: 'Cobalt',
    description: 'Tech',
    themeColor: {
      light: '#0b1b3a',
      dark: '#0a1022'
    }
  },
  {
    id: 'monarch',
    label: 'Monarch',
    description: 'Executive',
    themeColor: {
      light: '#3a1f21',
      dark: '#1a0f12'
    }
  }
];

const DEFAULT_THEME = {
  mode: 'light',
  style: 'atlas'
};

function getPreset(styleId) {
  return STYLE_PRESETS.find((preset) => preset.id === styleId) || STYLE_PRESETS[0];
}

export function loadTheme() {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_THEME;
    }
    const parsed = JSON.parse(raw);
    const preset = getPreset(parsed.style);
    const mode = parsed.mode === 'dark' ? 'dark' : 'light';
    return { mode, style: preset.id };
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
}

export function applyTheme(theme) {
  const root = document.documentElement;
  const preset = getPreset(theme.style);

  root.dataset.theme = theme.mode;
  root.dataset.style = preset.id;
  root.style.colorScheme = theme.mode;

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', preset.themeColor[theme.mode]);
  }
}

export function toggleMode(theme) {
  return {
    ...theme,
    mode: theme.mode === 'dark' ? 'light' : 'dark'
  };
}

export function setStyle(theme, style) {
  return {
    ...theme,
    style
  };
}

// Extend this file to add theme syncing with user profiles or OS preferences.
