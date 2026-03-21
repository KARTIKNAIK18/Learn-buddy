import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export const THEMES = {
  cream: {
    name: 'Soft Cream',
    desc: 'Best for long reading, reduces glare',
    bg: '#FFF8E7',
    cardBg: '#FFFEF9',
    text: '#5a4a2a',
    primary: '#d97706',
  },
  blue: {
    name: 'Pastel Blue Calm',
    desc: 'Improves focus and concentration',
    bg: '#E8F4FD',
    cardBg: '#F7FBFF',
    text: '#1e3a5f',
    primary: '#3b82f6',
  },
  mint: {
    name: 'Mint Green Relax',
    desc: 'Very relaxing and eye-friendly',
    bg: '#E0FFF4',
    cardBg: '#F0FFF9',
    text: '#1e4a3a',
    primary: '#14b8a6',
  },
  lavender: {
    name: 'Lavender Focus',
    desc: 'Soft color that reduces visual stress',
    bg: '#F3EFFE',
    cardBg: '#FAF8FF',
    text: '#4a2e5f',
    primary: '#8b5cf6',
  },
  peach: {
    name: 'Warm Peach',
    desc: 'Friendly and comfortable for kids',
    bg: '#FFE4D6',
    cardBg: '#FFF5EE',
    text: '#5a3a2a',
    primary: '#f97316',
  },
  dark: {
    name: 'Dark Reading Mode',
    desc: 'Good for night reading and low light',
    bg: '#1a1f2e',
    cardBg: '#252b3b',
    text: '#e2e8f0',
    primary: '#818cf8',
  },
};

const DEFAULTS = {
  font:               'normal',   // 'normal' | 'dyslexic'
  fontSize:           1.0625,     // rem
  letterSpacing:      0,          // px
  wordSpacing:        4,          // px
  lineHeight:         1.8,
  theme:              'cream',
  lineFocus:          false,
};

const AccessibilityContext = createContext(null);
const STORAGE_KEY = 'lb_a11y';

export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  // Apply all settings as CSS variables on :root
  useEffect(() => {
    const root = document.documentElement;
    const theme = THEMES[settings.theme] || THEMES.default;
    
    console.log('🎨 Applying theme:', settings.theme, theme);
    
    root.style.setProperty(
      '--a11y-font',
      settings.font === 'dyslexic'
        ? "'OpenDyslexic', 'Arial', sans-serif"
        : settings.font === 'atkinson'
          ? "'Atkinson Hyperlegible', 'ui-sans-serif', 'system-ui', sans-serif"
          : settings.font === 'lexend'
            ? "'Lexend', 'ui-sans-serif', 'system-ui', sans-serif"
            : "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    );
    root.style.setProperty('--a11y-font-size',       `${settings.fontSize}rem`);
    root.style.setProperty('--a11y-letter-spacing',  `${settings.letterSpacing}px`);
    root.style.setProperty('--a11y-word-spacing',    `${settings.wordSpacing}px`);
    root.style.setProperty('--a11y-line-height',     `${settings.lineHeight}`);
    
    // Apply theme colors
    root.style.setProperty('--theme-bg',        theme.bg);
    root.style.setProperty('--theme-card-bg',   theme.cardBg);
    root.style.setProperty('--theme-text',      theme.text);
    root.style.setProperty('--theme-primary',   theme.primary);
    
    console.log('✅ Theme CSS variables applied:', {
      '--theme-bg': theme.bg,
      '--theme-card-bg': theme.cardBg,
      '--theme-text': theme.text,
      '--theme-primary': theme.primary,
    });
  }, [settings]);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetAll = useCallback(() => {
    console.log('🔄 Resetting all accessibility settings to defaults:', DEFAULTS);
    setSettings(DEFAULTS);
  }, []);

  return (
    <AccessibilityContext.Provider value={{ settings, update, resetAll, THEMES }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be inside AccessibilityProvider');
  return ctx;
};
