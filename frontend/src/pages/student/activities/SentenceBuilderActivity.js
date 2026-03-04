import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAccessibility } from '../../../context/AccessibilityContext';
import useTTS from '../../../hooks/useTTS';
import { addPoints } from '../../../api/student';
import { ArrowLeft, Volume2, RotateCcw, Undo2 } from 'lucide-react';
import ConfettiEffect from '../../../components/common/ConfettiEffect';

const SENTENCES = [
  'The cat sat on the mat.',
  'I like to eat apples.',
  'The dog runs in the park.',
  'She reads a book every day.',
  'The sun is bright and warm.',
  'We play games after school.',
  'Birds sing in the morning.',
  'He drinks milk before bed.',
  'The fish swims in the pond.',
  'I brush my teeth at night.',
  'The flowers are red and pink.',
  'My cat likes to sleep all day.',
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Strip trailing punctuation from word for display tile, keep for answer check
const stripPunct = (w) => w.replace(/[.,!?]$/, '');

const SentenceBuilderActivity = () => {
  const navigate             = useNavigate();
  const { settings }         = useAccessibility();
  const tts                  = useTTS(settings.ttsLang, settings.ttsSpeed);

  const [sentences]          = useState(() => shuffle(SENTENCES));
  const [index, setIndex]    = useState(0);
  const [score, setScore]    = useState(0);
  const [built, setBuilt]    = useState([]);    // words placed by user
  const [available, setAvail]= useState(() => getShuffled(SENTENCES[0]));
  const [status, setStatus]  = useState(null);  // 'correct' | 'wrong' | null
  const [done, setDone]      = useState(false);
  const [celebrate, setCelebrate] = useState(0);

  const pointsAdded = useRef(false);
  useEffect(() => {
    if (done && !pointsAdded.current) {
      pointsAdded.current = true;
      addPoints('sentence-builder', 20).catch(() => {});
    }
  }, [done]);

  function getShuffled(sentence) {
    return shuffle(sentence.replace(/\.$/, '').replace(/[!?]$/, '').split(' ')
      .map((w, i) => ({ word: w, id: i })));
  }

  const sentence    = sentences[index];
  const targetWords = sentence.split(' ').map(stripPunct);

  const pickWord = (item) => {
    if (status) return;
    setBuilt((b) => [...b, item]);
    setAvail((a) => a.filter((x) => x.id !== item.id));
  };

  const undo = () => {
    if (!built.length || status) return;
    const last = built[built.length - 1];
    setBuilt((b) => b.slice(0, -1));
    setAvail((a) => shuffle([...a, last]));
  };

  const check = () => {
    if (built.length !== targetWords.length) return;
    const userWords = built.map((x) => stripPunct(x.word));
    const correct   = userWords.join(' ') === targetWords.join(' ');
    setStatus(correct ? 'correct' : 'wrong');
    if (correct) { setScore((s) => s + 1); setCelebrate((c) => c + 1); }
    tts.speak(correct ? `Correct! "${sentence}"` : `Not quite. Try again!`);
    if (correct) {
      setTimeout(advance, 1800);
    }
  };

  const advance = () => {
    if (index + 1 >= sentences.length) { setDone(true); return; }
    const next = index + 1;
    setIndex(next);
    setAvail(getShuffled(sentences[next]));
    setBuilt([]);
    setStatus(null);
  };

  const restart = () => {
    setIndex(0); setScore(0); setStatus(null); setDone(false);
    setBuilt([]); setAvail(getShuffled(sentences[0])); tts.stop();
  };

  const tryAgain = () => { setBuilt([]); setAvail(getShuffled(sentence)); setStatus(null); };

  if (done) {
    return (
      <DashboardLayout>        <ConfettiEffect trigger={celebrate} />        <div className="max-w-md mx-auto mt-16 text-center">
          <div className="text-7xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Finished!</h2>
          <p className="text-slate-500 mb-6">You scored <strong className="text-emerald-600">{score}</strong> out of <strong>{sentences.length}</strong>.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={restart} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all">
              <RotateCcw size={16} /> Play Again
            </button>
            <button onClick={() => { tts.stop(); navigate('/student/activities'); }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all">
              All Activities
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>      <ConfettiEffect trigger={celebrate} />      <button onClick={() => { tts.stop(); navigate('/student/activities'); }}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Activities
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🧩 Sentence Builder</h1>
          <p className="text-slate-500 text-sm mt-0.5">Tap the words in the right order to build the sentence.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Score</p>
          <p className="text-2xl font-bold text-emerald-600">{score} <span className="text-base text-slate-400">/ {sentences.length}</span></p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-8">
        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((index + 1) / sentences.length) * 100}%` }} />
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Hear it */}
        <div className="text-center">
          <button onClick={() => tts.speak(sentence)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-100 text-emerald-700 text-sm font-semibold hover:bg-emerald-200 transition-all">
            <Volume2 size={16} /> Hear the Sentence
          </button>
        </div>

        {/* Built sentence area */}
        <div className={`min-h-[72px] rounded-2xl border-2 p-4 flex flex-wrap gap-2 items-center transition-all
          ${status === 'correct' ? 'border-green-400 bg-green-50'
          : status === 'wrong'   ? 'border-red-300 bg-red-50'
          : 'border-dashed border-slate-300 bg-slate-50'}`}>
          {built.length === 0
            ? <span className="text-slate-300 text-sm">Tap words below to place them here…</span>
            : built.map((item, i) => (
              <span key={i}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold border ${
                  status === 'correct' ? 'bg-green-200 border-green-400 text-green-800'
                  : status === 'wrong' ? 'bg-red-100 border-red-300 text-red-700'
                  : 'bg-white border-slate-300 text-slate-700'}`}>
                {item.word}
              </span>
            ))}
        </div>

        {/* Status message */}
        {status === 'wrong' && (
          <p className="text-center text-red-600 text-sm font-semibold">
            Not quite! Try again.
          </p>
        )}

        {/* Word tiles */}
        <div className="flex flex-wrap gap-2 justify-center min-h-[48px]">
          {available.map((item) => (
            <button key={item.id} onClick={() => pickWord(item)}
              className="px-4 py-2 rounded-xl bg-white border-2 border-emerald-300 text-slate-700 text-sm font-bold
                         hover:bg-emerald-50 hover:border-emerald-500 active:scale-95 transition-all shadow-sm">
              {item.word}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center">
          <button onClick={undo} disabled={!built.length || !!status}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold
                       hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <Undo2 size={14} /> Undo
          </button>
          {status === 'wrong' ? (
            <button onClick={tryAgain}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-100 text-red-700 text-sm font-bold hover:bg-red-200 transition-all">
              <RotateCcw size={14} /> Try Again
            </button>
          ) : (
            <button onClick={check} disabled={built.length !== targetWords.length || !!status}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold
                         hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Check ✓
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SentenceBuilderActivity;
