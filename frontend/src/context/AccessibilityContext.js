import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export const BG_TINTS = {
  none:     'transparent',
  cream:    '#FFF8E7',
  yellow:   '#FFFBCC',
  blue:     '#E8F4FD',
  green:    '#EDFBF0',
  lavender: '#F3EFFE',
};

const DEFAULTS = {
  font:               'normal',   // 'normal' | 'dyslexic'
  fontSize:           1.0625,     // rem
  letterSpacing:      0,          // px
  wordSpacing:        4,          // px
  lineHeight:         1.8,
  bgTint:             'none',
  lineFocus:          false,
  ttsEnabled:         false,
  ttsSpeed:           1.0,
  ttsLang:            'en-IN',
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
    root.style.setProperty(
      '--a11y-font',
      settings.font === 'dyslexic'
        ? "'OpenDyslexic', 'Arial', sans-serif"
        : "'Lexend', 'ui-sans-serif', 'system-ui', sans-serif"
    );
    root.style.setProperty('--a11y-font-size',       `${settings.fontSize}rem`);
    root.style.setProperty('--a11y-letter-spacing',  `${settings.letterSpacing}px`);
    root.style.setProperty('--a11y-word-spacing',    `${settings.wordSpacing}px`);
    root.style.setProperty('--a11y-line-height',     `${settings.lineHeight}`);
    root.style.setProperty('--a11y-bg',              BG_TINTS[settings.bgTint] || 'transparent');
  }, [settings]);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetAll = useCallback(() => setSettings(DEFAULTS), []);

  return (
    <AccessibilityContext.Provider value={{ settings, update, resetAll, BG_TINTS }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be inside AccessibilityProvider');
  return ctx;
};
