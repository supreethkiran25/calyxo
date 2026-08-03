// Appearance & Theme Management Engine for Calyxo (Web & PWA)

export function applyAppearanceSettings({
  theme = 'dark',
  largeText = false,
  highContrast = false,
  reduceMotion = false,
  bgEffectsEnabled = false,
  bgStyle = 'minimal',
  animationIntensity = 'medium',
  performanceMode = 'auto'
} = {}) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  // 1. Save settings to localStorage for instant PWA boot sync
  const settings = {
    theme,
    largeText: Boolean(largeText),
    highContrast: Boolean(highContrast),
    reduceMotion: Boolean(reduceMotion),
    bgEffectsEnabled: Boolean(bgEffectsEnabled),
    bgStyle: bgStyle || 'minimal',
    animationIntensity: animationIntensity || 'medium',
    performanceMode: performanceMode || 'auto'
  };

  try {
    localStorage.setItem('calyxo_appearance_settings', JSON.stringify(settings));
    localStorage.setItem('calyxo_theme', theme);
  } catch (e) {
    console.warn('localStorage save error:', e);
  }

  // 2. Apply Theme
  root.classList.remove('dark');
  root.classList.remove('glass');
  root.removeAttribute('data-theme');

  let resolvedTheme = theme;
  if (theme === 'system') {
    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  if (resolvedTheme === 'glass') {
    root.classList.add('dark');
    root.classList.add('glass');
    root.setAttribute('data-theme', 'glass');
  } else if (resolvedTheme === 'dark' || resolvedTheme === 'obsidian') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'obsidian');
  } else if (resolvedTheme === 'solarized') {
    root.setAttribute('data-theme', 'solarized');
  } else if (resolvedTheme === 'emerald') {
    root.setAttribute('data-theme', 'emerald');
  } else {
    root.setAttribute('data-theme', 'light');
  }

  // 3. Apply Large Text
  if (largeText) {
    root.classList.add('accessibility-large-text');
  } else {
    root.classList.remove('accessibility-large-text');
  }

  // 4. Apply High Contrast
  if (highContrast) {
    root.classList.add('accessibility-high-contrast');
  } else {
    root.classList.remove('accessibility-high-contrast');
  }

  // 5. Apply Reduce Motion
  if (reduceMotion) {
    root.classList.add('reduce-motion');
    root.classList.add('accessibility-reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
    root.classList.remove('accessibility-reduce-motion');
  }
}

export function loadSavedAppearance() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('calyxo_appearance_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.theme) return parsed;
    }
  } catch (e) {}
  return {
    theme: localStorage.getItem('calyxo_theme') || 'dark',
    largeText: false,
    highContrast: false,
    reduceMotion: false
  };
}
