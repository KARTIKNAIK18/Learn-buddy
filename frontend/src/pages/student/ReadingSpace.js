import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAccessibility } from '../../context/AccessibilityContext';
import useTTS from '../../hooks/useTTS';
import {
  Volume2, VolumeX, Pause, Play, RotateCcw, Copy, Trash2,
  ZoomIn, ZoomOut, Type, AlignLeft, Clipboard, MousePointerClick,
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/* ── Tokenise text into word + whitespace chunks with char offsets ─── */
const tokenize = (text) => {
  const tokens = [];
  const re = /\S+|\s+/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    tokens.push({ text: m[0], start: m.index, isWord: /\S/.test(m[0]) });
  }
  return tokens;
};

/* ── Highlight colours ───────────────────────────────────────────── */
const HIGHLIGHT_OPTIONS = [
  { id: 'yellow',  label: 'Yellow',  active: 'bg-yellow-200 text-yellow-900',   dot: 'bg-yellow-300'  },
  { id: 'green',   label: 'Green',   active: 'bg-emerald-200 text-emerald-900', dot: 'bg-emerald-300' },
  { id: 'blue',    label: 'Blue',    active: 'bg-sky-200 text-sky-900',          dot: 'bg-sky-300'     },
  { id: 'pink',    label: 'Pink',    active: 'bg-pink-200 text-pink-900',        dot: 'bg-pink-300'    },
  { id: 'orange',  label: 'Orange',  active: 'bg-orange-200 text-orange-900',   dot: 'bg-orange-300'  },
];

const PLACEHOLDER = `Paste or type any text here that you want to read or learn.

For example:
The quick brown fox jumps over the lazy dog.
Reading every day helps you learn new words and ideas.

Press "Read Aloud" and watch each word get highlighted as it is spoken!`;

const ReadingSpace = () => {
  const { settings }            = useAccessibility();
  const tts                     = useTTS(settings.ttsLang, settings.ttsSpeed);

  const [inputText, setInputText]   = useState('');
  const [readText,  setReadText]    = useState('');      // locked copy when reading starts
  const [isReading, setIsReading]   = useState(false);
  const [isPaused,  setIsPaused]    = useState(false);
  const [fontSize,  setFontSize]    = useState(1.125);   // rem
  const [lineH,     setLineH]       = useState(2.0);
  const [font,      setFont]        = useState('normal');
  const [hlColor,   setHlColor]     = useState('yellow');
  const [copied,    setCopied]      = useState(false);
  const [ttsLang,   setTtsLang]     = useState('en');    // 'en' | 'kn'
  const [clickWord, setClickWord]   = useState(null);    // word currently playing via click-TTS
  const audioRef                    = useRef(null);
  const readingRef                  = useRef(null);
  const prevSpeakingRef             = useRef(false);

  /* ── Backend TTS: speak a single word via /tts proxy ── */
  const speakWord = useCallback(async (word) => {
    const clean = word.replace(/[^a-zA-Z0-9\u0C80-\u0CFF\s]/g, '').trim();
    if (!clean) return;
    setClickWord(word);
    try {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      const url = `${API_BASE}/tts?text=${encodeURIComponent(clean)}&lang=${ttsLang}`;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setClickWord(null);
      audio.onerror = () => setClickWord(null);
      await audio.play();
    } catch {
      setClickWord(null);
    }
  }, [ttsLang]);

  // Keep TTS lang/speed in sync with accessibility settings
  // (useTTS already receives them; just restart if mid-speech)

  /* Scroll active word into view */
  useEffect(() => {
    if (!isReading || tts.wordStart < 0) return;
    const el = readingRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [tts.wordStart, isReading]);

  /* When TTS finishes naturally — only trigger when isSpeaking goes true→false */
  useEffect(() => {
    if (prevSpeakingRef.current && !tts.isSpeaking && isReading && !isPaused) {
      setIsReading(false);
      setIsPaused(false);
    }
    prevSpeakingRef.current = tts.isSpeaking;
  }, [tts.isSpeaking, isReading, isPaused]);

  const handleRead = () => {
    const text = inputText.trim();
    if (!text) return;
    setReadText(text);
    setIsReading(true);
    setIsPaused(false);
    tts.speak(text);
  };

  const handleStop = () => {
    tts.stop();
    setIsReading(false);
    setIsPaused(false);
  };

  const handlePause = () => { tts.pause(); setIsPaused(true); };
  const handleResume = () => { tts.resume(); setIsPaused(false); };

  const handleClear = () => {
    handleStop();
    setInputText('');
    setReadText('');
  };

  const handleCopy = async () => {
    if (!inputText) return;
    await navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch {
      // Clipboard access denied — user must paste manually
    }
  };

  /* Tokenised + highlighted text */
  const tokens = useMemo(() => tokenize(readText), [readText]);
  const hlCfg  = HIGHLIGHT_OPTIONS.find((h) => h.id === hlColor);

  const fontFamily = font === 'dyslexic'
    ? "'OpenDyslexic', 'Arial', sans-serif"
    : "'Lexend', 'ui-sans-serif', system-ui, sans-serif";

  const hasText = inputText.trim().length > 0;

  return (
    <DashboardLayout>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">📖 My Reading Space</h1>
        <p className="text-slate-500 text-sm mt-1">
          Type or paste any text you want to read. Press <strong>Read Aloud</strong> and each word will be highlighted as it is spoken.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── LEFT: Input panel ──────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 text-sm">Your Text</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePaste}
                  title="Paste from clipboard"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <Clipboard size={15} />
                </button>
                <button
                  onClick={handleCopy}
                  title="Copy text"
                  className={`p-1.5 rounded-lg transition-colors ${
                    copied ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50'
                  }`}
                >
                  <Copy size={15} />
                </button>
                <button
                  onClick={handleClear}
                  title="Clear"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={PLACEHOLDER}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700
                         resize-none focus:outline-none focus:border-brand-400 focus:bg-white transition-colors
                         placeholder:text-slate-300 leading-relaxed"
              style={{ fontFamily, fontSize: `${fontSize}rem`, lineHeight: lineH, height: '220px', overflow: 'auto' }}
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">{inputText.trim().split(/\s+/).filter(Boolean).length} words</span>
              <button
                onClick={isReading ? handleStop : handleRead}
                disabled={!hasText}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold
                            transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed
                            ${isReading
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
              >
                {isReading ? <><VolumeX size={16} /> Stop</> : <><Volume2 size={16} /> Read Aloud</>}
              </button>
            </div>
          </div>


        </div>

        {/* ── RIGHT: Settings ──────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Settings bar */}
          <div className="card">
            <h2 className="font-semibold text-slate-800 text-sm mb-3">Reading Settings</h2>
            <div className="space-y-4">

              {/* Word-click TTS language */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <MousePointerClick size={11} /> Click-a-Word Language
                </p>
                <div className="flex gap-2">
                  {[{ id: 'en', label: '🇬🇧 English' }, { id: 'kn', label: '🇮🇳 Kannada' }].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setTtsLang(id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        ttsLang === id
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-brand-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                  <MousePointerClick size={10} /> Click any word in the reading view to hear it spoken.
                </p>
              </div>

              {/* Font */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1"><Type size={11} /> Font</p>
                <div className="flex gap-2">
                  {[
                    { id: 'normal',   label: 'Normal',        style: {} },
                    { id: 'dyslexic', label: 'OpenDyslexic',  style: { fontFamily: "'OpenDyslexic', sans-serif" } },
                  ].map(({ id, label, style }) => (
                    <button
                      key={id}
                      onClick={() => setFont(id)}
                      style={style}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        font === id
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-brand-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <ZoomIn size={11} /> Font Size — <span className="font-medium text-slate-700">{Math.round(fontSize * 16)}px</span>
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setFontSize((s) => Math.max(0.875, +(s - 0.125).toFixed(3)))} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                    <ZoomOut size={13} />
                  </button>
                  <input
                    type="range" min={0.875} max={1.75} step={0.125}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1 h-1.5 cursor-pointer accent-brand-600"
                  />
                  <button onClick={() => setFontSize((s) => Math.min(1.75, +(s + 0.125).toFixed(3)))} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                    <ZoomIn size={13} />
                  </button>
                </div>
              </div>

              {/* Line height */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <AlignLeft size={11} /> Line Spacing — <span className="font-medium text-slate-700">{lineH}×</span>
                </p>
                <input
                  type="range" min={1.4} max={3.0} step={0.2}
                  value={lineH}
                  onChange={(e) => setLineH(Number(e.target.value))}
                  className="w-full h-1.5 cursor-pointer accent-brand-600"
                />
              </div>

              {/* Highlight colour */}
              <div>
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                  Word Highlight Colour
                </p>
                <div className="flex gap-2">
                  {HIGHLIGHT_OPTIONS.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setHlColor(h.id)}
                      title={h.label}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${h.dot}
                                  ${hlColor === h.id ? 'border-brand-500 scale-125 shadow-md' : 'border-white'}`}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ── FULL-WIDTH Reading View — below both panels ─────────────── */}
      {(isReading || readText) ? (
        <div className="card mt-6 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-semibold text-slate-800">📄 Reading View</h2>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <MousePointerClick size={10} /> Click any word to hear it spoken ({ttsLang === 'en' ? 'English' : 'Kannada'})
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isReading && (
                <>
                  {!isPaused ? (
                    <button
                      onClick={handlePause}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 text-white text-xs font-bold hover:bg-amber-500 shadow-sm transition-all"
                    >
                      <Pause size={14} /> Pause
                    </button>
                  ) : (
                    <button
                      onClick={handleResume}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 shadow-sm transition-all"
                    >
                      <Play size={14} /> Resume
                    </button>
                  )}
                  <button
                    onClick={handleStop}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 shadow-sm transition-all"
                  >
                    <VolumeX size={14} /> Stop
                  </button>
                </>
              )}
              {!isReading && readText && (
                <button onClick={() => setReadText('')} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  <RotateCcw size={12} /> Clear
                </button>
              )}
            </div>
          </div>

          <div
            ref={readingRef}
            className="rounded-2xl bg-white border-2 border-slate-100 p-6 overflow-y-auto leading-relaxed"
            style={{
              fontFamily,
              fontSize: `${fontSize}rem`,
              lineHeight: lineH,
              minHeight: '320px',
              maxHeight: '60vh',
            }}
          >
            {tokens.map((token, i) => {
              if (!token.isWord) return <span key={i}>{token.text}</span>;
              const isActive = tts.wordStart >= token.start &&
                               tts.wordStart <  token.start + token.text.length;
              const isClicked = clickWord === token.text;
              return (
                <span
                  key={i}
                  data-active={isActive}
                  title="Click to hear this word"
                  onClick={() => speakWord(token.text)}
                  className={`transition-all duration-100 cursor-pointer select-none ${
                    isActive
                      ? `${hlCfg.active} px-1 py-0.5 rounded-lg font-semibold`
                      : isClicked
                        ? 'bg-violet-200 text-violet-900 px-1 py-0.5 rounded-lg font-semibold'
                        : 'text-slate-700 hover:bg-slate-100 hover:rounded-md px-0.5'
                  }`}
                >
                  {token.text}
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center" style={{ minHeight: '200px' }}>
          <p className="text-slate-400 text-sm text-center">
            Type your text above and press <strong className="text-indigo-600">Read Aloud</strong><br />to see it highlighted word by word here.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReadingSpace;
