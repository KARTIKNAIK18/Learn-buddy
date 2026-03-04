import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAccessibility } from '../../../context/AccessibilityContext';
import useTTS from '../../../hooks/useTTS';
import { addPoints } from '../../../api/student';
import { ArrowLeft, Volume2, CheckCircle2, XCircle, RotateCcw, ChevronRight } from 'lucide-react';
import ConfettiEffect from '../../../components/common/ConfettiEffect';

const WORDS = [
  { word: 'CAT',    hint: 'A furry animal that says meow',        emoji: '🐱' },
  { word: 'DOG',    hint: 'A friendly pet that barks',             emoji: '🐶' },
  { word: 'BUS',    hint: 'A big vehicle that carries people',     emoji: '🚌' },
  { word: 'SUN',    hint: 'It shines in the sky during the day',   emoji: '☀️' },
  { word: 'FISH',   hint: 'It lives in water and has fins',        emoji: '🐟' },
  { word: 'BIRD',   hint: 'It has wings and can fly',              emoji: '🐦' },
  { word: 'MILK',   hint: 'A white drink that comes from a cow',   emoji: '🥛' },
  { word: 'FROG',   hint: 'A green animal that loves to jump',     emoji: '🐸' },
  { word: 'CAKE',   hint: 'A sweet food eaten on birthdays',       emoji: '🎂' },
  { word: 'STAR',   hint: 'A bright light you see at night',       emoji: '⭐' },
  { word: 'RAIN',   hint: 'Water that falls from clouds',          emoji: '🌧️' },
  { word: 'SHIP',   hint: 'A large boat that sails on the sea',    emoji: '🚢' },
  { word: 'DRUM',   hint: 'A musical instrument you hit',          emoji: '🥁' },
  { word: 'DUCK',   hint: 'A bird that swims and says quack',      emoji: '🦆' },
  { word: 'LAMP',   hint: 'A thing that gives light in a room',    emoji: '💡' },
  { word: 'KITE',   hint: 'You fly this in the wind',              emoji: '🪁' },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const WordScrambleActivity = () => {
  const navigate                    = useNavigate();
  const { settings }                = useAccessibility();
  const tts                         = useTTS(settings.ttsLang, settings.ttsSpeed);
  const [words]                     = useState(() => shuffle(WORDS));
  const [index, setIndex]           = useState(0);
  const [scrambled, setScrambled]   = useState([]);
  const [picked, setPicked]         = useState([]);
  const [result, setResult]         = useState(null);
  const [score, setScore]           = useState({ correct: 0, total: 0 });
  const [celebrate, setCelebrate]   = useState(0);

  const pointsAdded = useRef(false);
  useEffect(() => {
    if (score.total >= words.length && !pointsAdded.current) {
      pointsAdded.current = true;
      addPoints('word-scramble', 15).catch(() => {});
    }
  }, [score.total, words.length]);

  const item = words[index];

  useEffect(() => {
    setScrambled(shuffle(item.word.split('')));
    setPicked([]);
    setResult(null);
  }, [index, item.word]);

  const pickLetter = (letter, i) => {
    if (result) return;
    const next = [...picked, { letter, i }];
    setPicked(next);
    if (next.length === item.word.length) {
      const formed  = next.map((l) => l.letter).join('');
      const correct = formed === item.word;
      setResult(correct ? 'correct' : 'wrong');
      setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
      if (correct) setCelebrate((c) => c + 1);
      tts.speak(correct ? 'Well done! That is correct!' : `Not quite. The word is ${item.word.toLowerCase()}.`);
    }
  };

  const usedIdx = new Set(picked.map((p) => p.i));

  return (
    <DashboardLayout>      <ConfettiEffect trigger={celebrate} />      <button
        onClick={() => { tts.stop(); navigate('/student/activities'); }}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Activities
      </button>

      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">🔤 Word Scramble</h1>
          <p className="text-slate-500 text-sm mt-1">Tap the letters in the right order to spell the word!</p>
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
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 text-center shadow-sm">
            <p className="text-3xl font-bold text-slate-600">{index + 1}/{words.length}</p>
            <p className="text-xs text-slate-500 font-medium">Word</p>
          </div>
        </div>

        {/* Emoji + hint card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-6 text-center mb-6 shadow-sm">
          <span className="text-7xl">{item.emoji}</span>
          <p className="text-base text-slate-600 mt-3 font-medium">{item.hint}</p>
          <button
            onClick={() => tts.isSpeaking ? tts.stop() : tts.speak(item.hint)}
            className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tts.isSpeaking ? 'bg-red-100 text-red-600' : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            <Volume2 size={15} /> {tts.isSpeaking ? 'Stop' : 'Hear hint'}
          </button>
        </div>

        {/* Answer tray */}
        <div className="flex justify-center gap-2 mb-5 min-h-[64px] items-center flex-wrap">
          {Array.from({ length: item.word.length }).map((_, i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold
                          transition-all shadow-sm
                          ${result === 'correct' ? 'bg-green-100 border-green-400 text-green-700' :
                            result === 'wrong'   ? 'bg-red-100 border-red-300 text-red-600' :
                            picked[i]            ? 'bg-brand-50 border-brand-400 text-brand-700' :
                                                   'bg-white border-dashed border-slate-300 text-slate-200'
                          }`}
            >
              {picked[i]?.letter || ''}
            </div>
          ))}
        </div>

        {/* Undo button */}
        {picked.length > 0 && !result && (
          <div className="flex justify-center mb-3">
            <button
              onClick={() => setPicked((p) => p.slice(0, -1))}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors underline"
            >
              ← Undo last letter
            </button>
          </div>
        )}

        {/* Scrambled letters */}
        {!result && (
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {scrambled.map((letter, i) => (
              <button
                key={i}
                disabled={usedIdx.has(i)}
                onClick={() => pickLetter(letter, i)}
                className={`w-14 h-14 rounded-2xl text-2xl font-bold transition-all border-2 shadow-sm
                            ${usedIdx.has(i)
                              ? 'bg-slate-100 text-slate-300 opacity-30 cursor-not-allowed'
                              : 'bg-white border-brand-200 text-brand-700 hover:bg-brand-50 hover:border-brand-500 hover:scale-105'
                            }`}
              >
                {letter}
              </button>
            ))}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`rounded-3xl p-6 text-center border-2 mb-4 ${
            result === 'correct' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-200'
          }`}>
            {result === 'correct'
              ? <><CheckCircle2 className="mx-auto text-green-500 mb-2" size={40} /><p className="text-2xl font-bold text-green-700">Amazing! 🎉</p></>
              : <><XCircle className="mx-auto text-red-400 mb-2" size={40} /><p className="text-xl font-bold text-red-600">The word was: <span className="underline">{item.word}</span></p></>
            }
            <div className="flex gap-2 justify-center mt-4">
              {result === 'wrong' && (
                <button
                  onClick={() => { setPicked([]); setResult(null); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-300 text-red-600 text-sm font-bold rounded-2xl hover:bg-red-50 transition-colors"
                >
                  <RotateCcw size={14} /> Try Again
                </button>
              )}
              <button
                onClick={() => { setIndex((i) => (i + 1) % words.length); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-bold rounded-2xl hover:bg-brand-700 transition-colors"
              >
                Next Word <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={() => { tts.stop(); setIndex(0); setScore({ correct: 0, total: 0 }); }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RotateCcw size={13} /> Restart from beginning
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WordScrambleActivity;
