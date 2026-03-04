import React, { useState, useCallback } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import useTTS from '../../hooks/useTTS';
import {
  Accessibility, X, Type, AlignLeft, Palette, Focus,
  Volume2, VolumeX, RotateCcw, ZoomIn,
} from 'lucide-react';

/* ── Color swatches ────────────────────────────────────────── */
const BG_SWATCHES = [
  { key: 'none',     bg: '#ffffff', border: '#e2e8f0', label: 'None'     },
  { key: 'cream',    bg: '#FFF8E7', border: '#f59e0b', label: 'Cream'    },
  { key: 'yellow',   bg: '#FFFBCC', border: '#eab308', label: 'Yellow'   },
  { key: 'blue',     bg: '#E8F4FD', border: '#3b82f6', label: 'Blue'     },
  { key: 'green',    bg: '#EDFBF0', border: '#22c55e', label: 'Green'    },
  { key: 'lavender', bg: '#F3EFFE', border: '#8b5cf6', label: 'Lavender' },
];

/* ── TTS languages ─────────────────────────────────────────── */
const TTS_LANGS = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'hi-IN', label: 'हिंदी'            },
  { code: 'ta-IN', label: 'தமிழ்'            },
  { code: 'te-IN', label: 'తెలుగు'            },
  { code: 'kn-IN', label: 'ಕನ್ನಡ'             },
  { code: 'ml-IN', label: 'മലയാളം'           },
  { code: 'bn-IN', label: 'বাংলা'             },
  { code: 'mr-IN', label: 'मराठी'             },
  { code: 'gu-IN', label: 'ગુજરાતી'           },
];

/* ── Small helpers ─────────────────────────────────────────── */
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
  const { settings, update, resetAll } = useAccessibility();
  const [open, setOpen]          = useState(false);

  const tts = useTTS(settings.ttsLang, settings.ttsSpeed);

  const toggleTTSDemo = useCallback(() => {
    if (tts.isSpeaking) tts.stop();
    else tts.speak('Text to speech is working. Accessibility features are ready.');
  }, [tts]);

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

              {/* ── Color Overlay ── */}
              <Section icon={<Palette size={11} />} title="Color Overlay">
                <div className="flex gap-2.5 flex-wrap">
                  {BG_SWATCHES.map(({ key, bg, border, label }) => (
                    <button
                      key={key}
                      onClick={() => update('bgTint', key)}
                      title={label}
                      className="w-8 h-8 rounded-full flex-shrink-0 transition-transform"
                      style={{
                        background: bg,
                        border: `3px solid ${settings.bgTint === key ? border : '#e2e8f0'}`,
                        transform: settings.bgTint === key ? 'scale(1.25)' : 'scale(1)',
                        boxShadow: settings.bgTint === key ? `0 0 0 2px white, 0 0 0 4px ${border}` : 'none',
                      }}
                    />
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

              {/* ── TTS ── */}
              <Section icon={<Volume2 size={11} />} title="Text to Speech">
                <RowToggle
                  label={settings.ttsEnabled ? 'On — click any Read Aloud button' : 'Off'}
                  checked={settings.ttsEnabled}
                  onChange={(v) => update('ttsEnabled', v)}
                />
                {settings.ttsEnabled && (
                  <div className="space-y-3 pt-1">
                    {/* Speed */}
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">Speed: {settings.ttsSpeed}×</p>
                      <Slider
                        value={settings.ttsSpeed} min={0.5} max={2} step={0.25}
                        onChange={(v) => update('ttsSpeed', v)}
                        leftLabel="0.5×" rightLabel="2×"
                      />
                    </div>
                    {/* TTS Language */}
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">TTS Language</p>
                      <select
                        value={settings.ttsLang}
                        onChange={(e) => update('ttsLang', e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:border-brand-400 focus:outline-none"
                      >
                        {TTS_LANGS.map((l) => (
                          <option key={l.code} value={l.code}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Demo button */}
                    <button
                      onClick={toggleTTSDemo}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                        tts.isSpeaking
                          ? 'bg-red-100 text-red-600 border border-red-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                      }`}
                    >
                      {tts.isSpeaking
                        ? <><VolumeX size={13} /> Stop</>
                        : <><Volume2 size={13} /> Read Aloud (demo)</>
                      }
                    </button>
                  </div>
                )}
              </Section>

              {/* ── Reset ── */}
              <button
                onClick={resetAll}
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
