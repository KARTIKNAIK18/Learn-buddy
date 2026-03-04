import React, { useState, useMemo, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAccessibility } from '../../context/AccessibilityContext';
import useTTS from '../../hooks/useTTS';
import {
  Volume2, VolumeX, Trash2, Lightbulb, CheckCircle2,
  AlertCircle, Info, Copy, Check, Target, BookOpen,
} from 'lucide-react';

/* ── Rule-based grammar + writing checks ────────────────────────── */
const CONFUSED_WORDS = [
  { wrong: /\btheir\s+is\b/gi,     right: 'there is',        tip: '"their" shows ownership. Use "there" for a place or existence.' },
  { wrong: /\bthere\s+bag\b/gi,    right: 'their bag',       tip: '"there" means a place. Use "their" to show ownership.' },
  { wrong: /\byour\s+welcome\b/gi, right: "you're welcome",  tip: '"your" shows ownership. "you\'re" = you are.' },
  { wrong: /\bshould\s+of\b/gi,    right: 'should have',     tip: 'Use "should have", not "should of".' },
  { wrong: /\bcould\s+of\b/gi,     right: 'could have',      tip: 'Use "could have", not "could of".' },
  { wrong: /\bwould\s+of\b/gi,     right: 'would have',      tip: 'Use "would have", not "would of".' },
  { wrong: /\balot\b/gi,           right: 'a lot',           tip: '"alot" is not a word — write it as two words: "a lot".' },
  { wrong: /\brecieve\b/gi,        right: 'receive',         tip: 'Spelling: "receive" — i before e except after c.' },
  { wrong: /\bseperate\b/gi,       right: 'separate',        tip: 'Spelling: "sep-ar-ate" — there is an "a" in the middle.' },
  { wrong: /\bdefinate\b/gi,       right: 'definite',        tip: 'Spelling: "definite" ends in "-ite" not "-ate".' },
  { wrong: /\boccured\b/gi,        right: 'occurred',        tip: 'Spelling: "occurred" — double c and double r.' },
  { wrong: /\buntill\b/gi,         right: 'until',           tip: 'Spelling: "until" has only one l.' },
  { wrong: /\bwether\b/gi,         right: 'whether',         tip: 'Spelling: "whether" — includes "h" after "w".' },
  { wrong: /\bdont\b/gi,           right: "don't",           tip: 'Contraction: "don\'t" needs an apostrophe.' },
  { wrong: /\bcant\b/gi,           right: "can't",           tip: 'Contraction: "can\'t" needs an apostrophe.' },
  { wrong: /\bwont\b/gi,           right: "won't",           tip: 'Contraction: "won\'t" needs an apostrophe.' },
  { wrong: /\bim\b/gi,             right: "I'm",             tip: '"I\'m" needs an apostrophe and a capital I.' },
  { wrong: /\bi\s+am\s+not\s+sure\s+if\b/gi, right: 'I am not sure whether', tip: 'Use "whether" instead of "if" for uncertainty.' },
];

const analyzeText = (text) => {
  if (!text.trim()) return { suggestions: [], stats: null };
  const suggestions = [];

  CONFUSED_WORDS.forEach(({ wrong, right, tip }) => {
    if (wrong.test(text)) {
      suggestions.push({ type: 'error', message: `Write "${right}" instead.`, detail: tip });
      wrong.lastIndex = 0;
    }
  });

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  sentences.forEach((s) => {
    const trimmed = s.trim();
    if (trimmed && /^[a-z]/.test(trimmed)) {
      suggestions.push({ type: 'error', message: 'Start each sentence with a capital letter.', detail: `"${trimmed.slice(0, 40)}…" starts with a lowercase letter.` });
    }
    const wc = trimmed.split(/\s+/).filter(Boolean).length;
    if (wc > 25) {
      suggestions.push({ type: 'warning', message: 'Long sentence detected.', detail: `This sentence has ${wc} words. Try breaking it into two shorter sentences.` });
    }
  });

  const lastChar = text.trim().slice(-1);
  if (text.trim().length > 10 && !['.', '!', '?'].includes(lastChar)) {
    suggestions.push({ type: 'warning', message: 'Does your writing end with punctuation?', detail: 'End each sentence with a full stop (.), question mark (?), or exclamation mark (!).' });
  }

  const repeats = text.match(/\b(\w+)\s+\1\b/gi);
  if (repeats) {
    repeats.forEach((r) => {
      const word = r.split(/\s+/)[0];
      suggestions.push({ type: 'error', message: `Word repeated twice: "${word} ${word}".`, detail: 'Remove one of the repeated words.' });
    });
  }

  const words      = text.trim().split(/\s+/).filter(Boolean);
  const sentCount  = (text.match(/[.!?]+/g) || []).length;
  const paraCount  = text.split(/\n\s*\n/).filter((p) => p.trim()).length || 1;
  const avgLen     = sentCount > 0 ? Math.round(words.length / sentCount) : words.length;
  const chars      = text.replace(/\s/g, '').length;

  // Simple readability: based on avg sentence length
  let readability = 'Easy';
  if (avgLen > 20) readability = 'Hard';
  else if (avgLen > 12) readability = 'Medium';

  return {
    suggestions: suggestions.slice(0, 10),
    stats: { words: words.length, sentences: sentCount, paragraphs: paraCount, avgLen, chars, readability },
  };
};

/* ── Connective word bank ────────────────────────────────────────── */
const WORD_BANK = [
  { label: 'Adding',     words: ['also', 'and', 'furthermore', 'in addition', 'moreover'] },
  { label: 'Contrast',   words: ['but', 'however', 'although', 'on the other hand', 'yet'] },
  { label: 'Cause',      words: ['because', 'so', 'therefore', 'as a result', 'since'] },
  { label: 'Time',       words: ['first', 'then', 'next', 'after that', 'finally'] },
  { label: 'Examples',   words: ['for example', 'such as', 'for instance', 'like'] },
];

/* ── Sentence starters ───────────────────────────────────────────── */
const STARTERS = [
  'I think that…',
  'One reason is…',
  'For example,…',
  'This shows that…',
  'In conclusion,…',
  'On the other hand,…',
  'I believe…',
  'As a result,…',
];

/* ── Writing tips ────────────────────────────────────────────────── */
const WRITING_TIPS = [
  'Start every sentence with a capital letter.',
  'End sentences with a full stop, question mark, or exclamation mark.',
  'Keep sentences short — 10 to 15 words is great!',
  'Use connecting words like "and", "but", "because", "so".',
  'Read your writing aloud to catch mistakes.',
  'One idea per sentence makes writing easier to understand.',
];

const READABILITY_COLOR = { Easy: 'text-green-600 bg-green-50', Medium: 'text-amber-600 bg-amber-50', Hard: 'text-red-600 bg-red-50' };

/* ── Component ───────────────────────────────────────────────────── */
const WritingHelper = () => {
  const { settings }          = useAccessibility();
  const tts                   = useTTS(settings.ttsLang, settings.ttsSpeed);
  const [text, setText]       = useState('');
  const [copied, setCopied]   = useState(false);
  const [wordGoal, setWordGoal] = useState(50);
  const [activeBank, setActiveBank] = useState(null);
  const textareaRef           = React.useRef(null);

  const { suggestions, stats } = useMemo(() => analyzeText(text), [text]);
  const hasErrors   = suggestions.filter((s) => s.type === 'error').length;
  const hasWarnings = suggestions.filter((s) => s.type === 'warning').length;
  const goalPct     = stats ? Math.min(100, Math.round((stats.words / wordGoal) * 100)) : 0;
  const goalMet     = stats && stats.words >= wordGoal;

  const handleClear  = () => { tts.stop(); setText(''); };

  const handleCopy = () => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Insert a word/phrase at cursor position in textarea
  const insertWord = useCallback((word) => {
    const el = textareaRef.current;
    if (!el) { setText((t) => t + (t.endsWith(' ') || !t ? '' : ' ') + word + ' '); return; }
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const before = text.slice(0, start);
    const after  = text.slice(end);
    const spaceBefore = before && !before.endsWith(' ') ? ' ' : '';
    const newText = before + spaceBefore + word + ' ' + after;
    setText(newText);
    // Restore cursor after inserted word
    setTimeout(() => {
      el.focus();
      const pos = start + spaceBefore.length + word.length + 1;
      el.setSelectionRange(pos, pos);
    }, 0);
  }, [text]);

  return (
    <DashboardLayout>
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            ✍️ Writing Helper
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Write anything and get instant feedback on spelling, grammar, and style.
          </p>
        </div>
        {/* Word goal setter */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
          <Target size={15} className="text-indigo-500 shrink-0" />
          <span className="text-xs text-slate-500 font-medium">Word goal:</span>
          <input
            type="number"
            min={10} max={500} step={10}
            value={wordGoal}
            onChange={(e) => setWordGoal(Number(e.target.value) || 50)}
            className="w-16 text-sm font-bold text-indigo-700 bg-transparent outline-none border-b border-indigo-200 text-center"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">

        {/* ══ LEFT COLUMN (2/3) ══ */}
        <div className="xl:col-span-2 flex flex-col gap-5">

          {/* ── Writing area card ── */}
          <div className="card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-700 text-sm">Your Writing</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => tts.isSpeaking ? tts.stop() : tts.speak(text)}
                  disabled={!text.trim()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed
                    ${tts.isSpeaking ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                >
                  {tts.isSpeaking ? <><VolumeX size={12} /> Stop</> : <><Volume2 size={12} /> Read Aloud</>}
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!text.trim()}
                  title="Copy to clipboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {copied ? <><Check size={12} className="text-green-600" /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
                <button onClick={handleClear} title="Clear all"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start writing here… For example: My name is Sam. i like to play football in the park. its really fun."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800
                         focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors
                         placeholder:text-slate-300 leading-relaxed resize-none"
              style={{ minHeight: '220px' }}
            />

            {/* Word goal progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400">
                  {stats ? stats.words : 0} / {wordGoal} words
                </span>
                {goalMet && (
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <CheckCircle2 size={11} /> Goal reached! 🎉
                  </span>
                )}
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${goalMet ? 'bg-green-500' : 'bg-indigo-500'}`}
                  style={{ width: `${goalPct}%` }}
                />
              </div>
            </div>

            {/* Stats row */}
            {stats && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
                {[
                  { label: 'Words',       value: stats.words      },
                  { label: 'Sentences',   value: stats.sentences  },
                  { label: 'Paragraphs',  value: stats.paragraphs },
                  { label: 'Avg. length', value: `${stats.avgLen}w` },
                  { label: 'Characters',  value: stats.chars      },
                  { label: 'Reading level', value: stats.readability,
                    extra: READABILITY_COLOR[stats.readability] },
                ].map(({ label, value, extra }) => (
                  <div key={label} className="text-center">
                    <p className={`text-base font-black ${extra ? `px-1.5 py-0.5 rounded-lg text-sm ${extra}` : 'text-indigo-600'}`}>
                      {value}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Suggestions panel ── */}
          <div className="card flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-500" />
              <h2 className="font-semibold text-slate-700 text-sm">Suggestions</h2>
              {(hasErrors > 0 || hasWarnings > 0) && (
                <span className="ml-auto text-xs">
                  {hasErrors > 0 && <span className="text-red-500 font-semibold mr-2">{hasErrors} error{hasErrors > 1 ? 's' : ''}</span>}
                  {hasWarnings > 0 && <span className="text-amber-500 font-semibold">{hasWarnings} tip{hasWarnings > 1 ? 's' : ''}</span>}
                </span>
              )}
            </div>

            {!text.trim() ? (
              <p className="text-slate-400 text-sm">Start writing above to see suggestions here.</p>
            ) : suggestions.length === 0 ? (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-green-700 font-medium">No issues found — your writing looks great! 🎉</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {suggestions.map((s, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border text-sm
                    ${s.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                    {s.type === 'error'
                      ? <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                      : <Info size={15} className="text-amber-500 mt-0.5 shrink-0" />}
                    <div>
                      <p className={`font-semibold text-sm ${s.type === 'error' ? 'text-red-700' : 'text-amber-700'}`}>{s.message}</p>
                      {s.detail && <p className="text-xs text-slate-500 mt-0.5">{s.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Word bank ── */}
          <div className="card flex flex-col gap-3">
            <h2 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
              <BookOpen size={15} className="text-indigo-400" /> Word Bank
              <span className="ml-1 text-xs text-slate-400 font-normal">— click any word to insert it</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {WORD_BANK.map((group) => (
                <button
                  key={group.label}
                  onClick={() => setActiveBank(activeBank === group.label ? null : group.label)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                    ${activeBank === group.label
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300'}`}
                >
                  {group.label}
                </button>
              ))}
            </div>
            {activeBank && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                {WORD_BANK.find((g) => g.label === activeBank)?.words.map((w) => (
                  <button
                    key={w}
                    onClick={() => insertWord(w)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700
                               border border-indigo-200 hover:bg-indigo-100 transition-all"
                  >
                    + {w}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ══ RIGHT COLUMN (1/3) ══ */}
        <div className="flex flex-col gap-5">

          {/* ── Read aloud card ── */}
          <div className="card bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200">
            <h2 className="font-semibold text-indigo-800 text-sm mb-2">📢 Read It Aloud</h2>
            <p className="text-xs text-indigo-600 leading-relaxed mb-3">
              Hearing your writing spoken back helps you catch mistakes and awkward sentences.
            </p>
            <button
              onClick={() => tts.isSpeaking ? tts.stop() : tts.speak(text)}
              disabled={!text.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {tts.isSpeaking ? <><VolumeX size={14} /> Stop Reading</> : <><Volume2 size={14} /> Read Aloud</>}
            </button>
          </div>

          {/* ── Sentence starters ── */}
          <div className="card">
            <h2 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
              💬 Sentence Starters
              <span className="text-xs text-slate-400 font-normal">— click to insert</span>
            </h2>
            <div className="flex flex-col gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => insertWord(s.replace('…', ''))}
                  className="text-left px-3 py-2 rounded-xl text-xs text-slate-600 bg-slate-50 border border-slate-200
                             hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* ── Writing tips ── */}
          <div className="card">
            <h2 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
              <Lightbulb size={15} className="text-amber-400" /> Writing Tips
            </h2>
            <ul className="flex flex-col gap-3">
              {WRITING_TIPS.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default WritingHelper;
