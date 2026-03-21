import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
  Accessibility, X, Type, AlignLeft, Palette, Focus,
  RotateCcw, ZoomIn,
} from 'lucide-react';

const Section = ({ icon, title, children }) => (
  <div className="space-y-2.5">
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
      {icon}
      <span>{title}</span>
    </div>
    {children}
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <div
    onClick={() => onChange(!checked)}
    className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer
                ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
  >
    <span
      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all
                  ${checked ? 'left-5' : 'left-1'}`}
    />
  </div>
);

const RowToggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-700">{label}</span>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

const Slider = ({ value, min, max, step, onChange, leftLabel, rightLabel }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] text-slate-400 w-6 text-right">{leftLabel}</span>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1 h-1.5 cursor-pointer accent-brand-600"
    />
    <span className="text-[10px] text-slate-400 w-8">{rightLabel}</span>
  </div>
);

/* ── Line Focus Ruler — follows mouse Y ────────────────────── */
const LineFocusRuler = () => {
  const [yPos, setYPos] = React.useState(window.innerHeight / 2);
  const HALF = 48;

  React.useEffect(() => {
    const h = (e) => setYPos(e.clientY);
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-hidden="true">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: Math.max(0, yPos - HALF), background: 'rgba(0,0,0,0.38)' }} />
      <div style={{ position: 'absolute', top: yPos + HALF, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.38)' }} />
      <div style={{ position: 'absolute', top: yPos - HALF, left: 0, right: 0, height: HALF * 2, boxShadow: 'inset 0 2px 0 rgba(99,102,241,0.6), inset 0 -2px 0 rgba(99,102,241,0.6)' }} />
    </div>
  );
};

/* ── Main toolbar ──────────────────────────────────────────── */
const AccessibilityToolbar = () => {
  const { settings, update, resetAll, THEMES } = useAccessibility();
  const [open, setOpen] = useState(false);

  return (
    <>
      {settings.lineFocus && <LineFocusRuler />}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

        {/* ── Panel ────────────────────────────────────────────── */}
        {open && (
          <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-slide-up">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand-600 to-violet-600">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Accessibility size={16} />
                Accessibility
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Controls */}
            <div className="p-4 space-y-5 max-h-[78vh] overflow-y-auto">

              {/* ── Font ── */}
              <Section icon={<Type size={11} />} title="Font">
                <div className="flex gap-2">
                  {[
                    { id: 'normal',  label: 'Normal',        style: {} },
                    { id: 'dyslexic', label: 'OpenDyslexic', style: { fontFamily: "'OpenDyslexic', sans-serif" } },
                  ].map(({ id, label, style }) => (
                    <button
                      key={id}
                      onClick={() => update('font', id)}
                      style={style}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        settings.font === id
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-brand-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              {/* </Section>
              <Section icon={<Type size={11} />} title="Font"> */}
                <div className="flex gap-2">
                  {[ 
                     { id: 'lexend', label: 'Lexend', style: { fontFamily: "'Lexend', sans-serif" } },
                     { id: 'atkinson', label: 'Atkinson Hyperlegible', style: { fontFamily: "'Atkinson Hyperlegible', sans-serif" } },
                  ].map(({ id, label, style }) => (
                    <button
                      key={id}
                      onClick={() => update('font', id)}
                      style={style}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        settings.font === id
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-brand-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Section>

              {/* ── Font Size ── */}
              <Section icon={<ZoomIn size={11} />} title="Font Size">
                <Slider
                  value={settings.fontSize} min={0.875} max={1.5} step={0.0625}
                  onChange={(v) => update('fontSize', v)}
                  leftLabel="A" rightLabel="A+"
                />
                <p className="text-[10px] text-center text-slate-400">{Math.round(settings.fontSize * 16)}px base</p>
              </Section>

              {/* ── Letter Spacing ── */}
              <Section icon={<AlignLeft size={11} />} title="Letter Spacing">
                <Slider
                  value={settings.letterSpacing} min={0} max={6} step={0.5}
                  onChange={(v) => update('letterSpacing', v)}
                  leftLabel="0" rightLabel="6px"
                />
              </Section>

              {/* ── Word Spacing ── */}
              <Section icon={<AlignLeft size={11} />} title="Word Spacing">
                <Slider
                  value={settings.wordSpacing} min={0} max={20} step={1}
                  onChange={(v) => update('wordSpacing', v)}
                  leftLabel="0" rightLabel="20px"
                />
              </Section>

              {/* ── Theme Colors ── */}
              <Section icon={<Palette size={11} />} title="Theme Colors">
                <div className="space-y-2">
                  {Object.entries(THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => update('theme', key)}
                      className="w-full text-left rounded-xl p-3 transition-all relative overflow-hidden group"
                      style={{
                        backgroundColor: theme.bg,
                        border: `2px solid ${settings.theme === key ? theme.primary : 'transparent'}`,
                        boxShadow: settings.theme === key 
                          ? `0 0 0 3px ${theme.primary}20` 
                          : 'none',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Color preview square */}
                        <div 
                          className="w-10 h-10 rounded-lg flex-shrink-0 shadow-sm relative"
                          style={{
                            background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.cardBg} 50%, ${theme.primary} 100%)`,
                            border: `2px solid ${theme.primary}`,
                          }}
                        >
                          {settings.theme === key && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div 
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md"
                                style={{ 
                                  backgroundColor: theme.primary,
                                  color: theme.bg
                                }}
                              >
                                ✓
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Text content */}
                        <div className="flex-1 min-w-0">
                          <div 
                            className="text-sm font-semibold mb-0.5"
                            style={{ color: theme.text }}
                          >
                            {theme.name}
                          </div>
                          <div 
                            className="text-[10px] leading-snug"
                            style={{ color: theme.text, opacity: 0.7 }}
                          >
                            {theme.desc}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Section>

              {/* ── Line Focus ── */}
              <Section icon={<Focus size={11} />} title="Line Focus">
                <RowToggle
                  label={settings.lineFocus ? 'On — move mouse to focus a line' : 'Off'}
                  checked={settings.lineFocus}
                  onChange={(v) => update('lineFocus', v)}
                />
              </Section>

              {/* ── Reset ── */}
              <button
                onClick={() => {
                  console.log('🔘 Reset button clicked');
                  resetAll();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors"
              >
                <RotateCcw size={13} />
                Reset All
              </button>

            </div>
          </div>
        )}

        {/* ── Floating toggle button ── */}
        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-600 to-violet-600 text-white
                     shadow-lg hover:shadow-xl flex items-center justify-center transition-all
                     hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
          aria-label="Open accessibility options"
        >
          {open ? <X size={22} /> : <Accessibility size={22} />}
        </button>
      </div>
    </>
  );
};

export default AccessibilityToolbar;
