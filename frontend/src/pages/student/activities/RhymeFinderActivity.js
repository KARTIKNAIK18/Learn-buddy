import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAccessibility } from '../../../context/AccessibilityContext';
import useTTS from '../../../hooks/useTTS';
import { addPoints } from '../../../api/student';
import { ArrowLeft, Volume2, CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import ConfettiEffect from '../../../components/common/ConfettiEffect';

/* Hear a word, pick the word that rhymes with it */
const RHYMES = [
  { word: 'CAT',  emoji: '🐱', correct: 'HAT',  distractors: ['BUS', 'DOG', 'SUN']  },
  { word: 'DOG',  emoji: '🐶', correct: 'LOG',  distractors: ['CAT', 'MAP', 'BED']  },
  { word: 'BED',  emoji: '🛏️', correct: 'RED',  distractors: ['CAT', 'DOG', 'PIG']  },
  { word: 'SUN',  emoji: '☀️', correct: 'RUN',  distractors: ['HIT', 'BAG', 'TOP']  },
  { word: 'FISH', emoji: '🐟', correct: 'DISH', distractors: ['BIRD', 'CAKE', 'DRUM'] },
  { word: 'STAR', emoji: '⭐', correct: 'CAR',  distractors: ['BOX', 'HEN', 'MUG']  },
  { word: 'CAKE', emoji: '🎂', correct: 'LAKE', distractors: ['BIRD', 'JUMP', 'PILL'] },
  { word: 'RAIN', emoji: '🌧️', correct: 'TRAIN',distractors: ['BARK', 'JUMP', 'MILK'] },
  { word: 'BELL', emoji: '🔔', correct: 'WELL', distractors: ['RING', 'BANG', 'SOFT'] },
  { word: 'FROG', emoji: '🐸', correct: 'LOG',  distractors: ['CAT', 'SUN', 'CUP']  },
  { word: 'MOON', emoji: '🌙', correct: 'SPOON',distractors: ['BOAT', 'DRUM', 'KING'] },
  { word: 'KING', emoji: '👑', correct: 'RING', distractors: ['FROG', 'MILK', 'BIRD'] },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const RhymeFinderActivity = () => {
  const navigate              = useNavigate();
  const { settings }          = useAccessibility();
  const tts                   = useTTS(settings.ttsLang, settings.ttsSpeed);
  const [questions]           = useState(() =>
    RHYMES.map((q) => ({ ...q, options: shuffle([q.correct, ...q.distractors]) }))
  );
  const [index, setIndex]     = useState(0);
  const [chosen, setChosen]   = useState(null);
  const [score, setScore]          = useState({ correct: 0, total: 0 });
  const [celebrate, setCelebrate]   = useState(0);

  const pointsAdded = useRef(false);
  useEffect(() => {
    if (score.total >= questions.length && !pointsAdded.current) {
      pointsAdded.current = true;
      addPoints('rhyme-finder', 15).catch(() => {});
    }
  }, [score.total, questions.length]);

  const q = questions[index];

  const pick = (option) => {
    if (chosen) return;
    setChosen(option);
    const correct = option === q.correct;
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    if (correct) { setCelebrate((c) => c + 1); tts.speak(`Yes! ${q.word} and ${q.correct} both rhyme!`); }
    else         tts.speak(`Not quite. ${q.word} rhymes with ${q.correct}.`);
  };

  const next = () => { setChosen(null); setIndex((i) => (i + 1) % questions.length); };

  const optionStyle = (o) => {
    if (!chosen) return 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 hover:scale-[1.02]';
    if (o === q.correct) return 'bg-green-50 border-green-400 text-green-800 font-bold';
    if (o === chosen)    return 'bg-red-50 border-red-300 text-red-600';
    return 'bg-slate-50 border-slate-100 text-slate-300 opacity-50';
  };

  return (
    <DashboardLayout>        <ConfettiEffect trigger={celebrate} />      <button
        onClick={() => { tts.stop(); navigate('/student/activities'); }}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Activities
      </button>

      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">🎵 Rhyme Finder</h1>
          <p className="text-slate-500 text-sm mt-1">Listen to the word, then pick the word that sounds like it at the end!</p>
        </div>

        {/* Score */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-3 text-center shadow-sm">
            <p className="text-3xl font-bold text-green-600">{score.correct}</p>
            <p className="text-xs text-green-500 font-medium">Correct</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 text-center shadow-sm">
            <p className="text-3xl font-bold text-slate-600">{score.total}</p>
            <p className="text-xs text-slate-500 font-medium">Tried</p>
          </div>
        </div>

        {/* Word card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-3xl p-8 text-center mb-6 shadow-md">
          <span className="text-7xl block mb-3">{q.emoji}</span>
          <p className="text-5xl font-bold text-emerald-800 tracking-wide mb-4">{q.word}</p>
          <p className="text-sm text-slate-500 mb-4">Which word rhymes with this?</p>
          <button
            onClick={() => tts.isSpeaking ? tts.stop() : tts.speak(`${q.word}. Which word sounds like ${q.word}?`)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm ${
              tts.isSpeaking ? 'bg-red-100 text-red-600' : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            <Volume2 size={16} /> {tts.isSpeaking ? 'Stop' : 'Hear the word'}
          </button>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {q.options.map((option, i) => (
            <button
              key={i}
              onClick={() => pick(option)}
              disabled={!!chosen}
              className={`px-4 py-5 rounded-2xl border-2 text-2xl font-bold text-center transition-all ${optionStyle(option)}`}
            >
              {option}
              {chosen && option === q.correct && <CheckCircle2 className="mx-auto mt-1 text-green-500" size={20} />}
              {chosen && option === chosen && option !== q.correct && <XCircle className="mx-auto mt-1 text-red-400" size={20} />}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {chosen && (
          <div className={`rounded-3xl p-5 text-center border-2 mb-4 ${
            chosen === q.correct ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-200'
          }`}>
            {chosen === q.correct
              ? <p className="text-xl font-bold text-green-700">🎵 Yes! They rhyme!</p>
              : <p className="text-base font-semibold text-amber-700">✔ <span className="font-bold text-slate-700">{q.word}</span> rhymes with <span className="font-bold text-green-700">{q.correct}</span></p>
            }
            <div className="flex gap-2 justify-center mt-4">
              {chosen !== q.correct && (
                <button
                  onClick={() => setChosen(null)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-amber-300 text-amber-700 text-sm font-bold rounded-2xl hover:bg-amber-50 transition-colors"
                >
                  <RotateCcw size={14} /> Try Again
                </button>
              )}
              <button
                onClick={next}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-bold rounded-2xl hover:bg-brand-700"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-6 text-xs text-slate-400">
          <span>{index + 1} / {questions.length}</span>
          <button onClick={() => { tts.stop(); setIndex(0); setScore({ correct: 0, total: 0 }); setChosen(null); }} className="flex items-center gap-1 hover:text-slate-600">
            <RotateCcw size={12} /> Restart
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RhymeFinderActivity;
