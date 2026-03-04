import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAccessibility } from '../../../context/AccessibilityContext';
import useTTS from '../../../hooks/useTTS';
import { addPoints } from '../../../api/student';
import { ArrowLeft, Volume2, RotateCcw, ChevronRight } from 'lucide-react';
import ConfettiEffect from '../../../components/common/ConfettiEffect';

const QUESTIONS = [
  { word: 'CAT',    blank: 1, choices: ['A','O','U','I'] },
  { word: 'DOG',    blank: 2, choices: ['A','G','E','O'] },
  { word: 'SUN',    blank: 0, choices: ['S','B','R','T'] },
  { word: 'BED',    blank: 2, choices: ['D','G','T','S'] },
  { word: 'HOP',    blank: 1, choices: ['A','O','E','I'] },
  { word: 'FAN',    blank: 0, choices: ['F','B','D','M'] },
  { word: 'MAP',    blank: 2, choices: ['P','T','S','N'] },
  { word: 'RUN',    blank: 1, choices: ['U','A','I','O'] },
  { word: 'PIG',    blank: 2, choices: ['G','D','T','S'] },
  { word: 'HEN',    blank: 0, choices: ['H','W','T','B'] },
  { word: 'CUP',    blank: 1, choices: ['U','A','E','I'] },
  { word: 'BOX',    blank: 2, choices: ['X','S','Z','K'] },
  { word: 'LOG',    blank: 1, choices: ['O','A','E','I'] },
  { word: 'NET',    blank: 0, choices: ['N','M','B','D'] },
  { word: 'JET',    blank: 2, choices: ['T','S','D','N'] },
  { word: 'WIG',    blank: 1, choices: ['I','O','A','U'] },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const MissingLetterActivity = () => {
  const navigate            = useNavigate();
  const { settings }        = useAccessibility();
  const tts                 = useTTS(settings.ttsLang, settings.ttsSpeed);

  const [questions]         = useState(() => shuffle(QUESTIONS));
  const [index, setIndex]   = useState(0);
  const [score, setScore]   = useState(0);
  const [chosen, setChosen] = useState(null);   // letter picked
  const [done, setDone]          = useState(false);
  const [celebrate, setCelebrate] = useState(0);

  const pointsAdded = useRef(false);
  useEffect(() => {
    if (done && !pointsAdded.current) {
      pointsAdded.current = true;
      addPoints('missing-letter', 15).catch(() => {});
    }
  }, [done]);

  const q          = questions[index];
  const answer   = q.word[q.blank];
  const shuffled  = shuffle(q.choices);

  const pick = (letter) => {
    if (chosen) return;
    setChosen(letter);
    const correct = letter === answer;
    if (correct) { setScore((s) => s + 1); setCelebrate((c) => c + 1); }
    tts.speak(correct ? `Correct! The word is ${q.word}` : `Oops! The answer is ${answer}. The word is ${q.word}`);
  };

  const next = () => {
    if (index + 1 >= questions.length) { setDone(true); } else { setIndex((i) => i + 1); setChosen(null); }
  };

  const tryAgain = () => { setChosen(null); };

  const restart = () => { setIndex(0); setScore(0); setChosen(null); setDone(false); tts.stop(); };

  if (done) {
    return (
      <DashboardLayout>
        <ConfettiEffect trigger={celebrate} />
        <div className="max-w-md mx-auto mt-16 text-center">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">All done!</h2>
          <p className="text-slate-500 mb-6">You scored <strong className="text-indigo-600">{score}</strong> out of <strong>{questions.length}</strong>.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={restart} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all">
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
    <DashboardLayout>
      {/* Back */}
      <button onClick={() => { tts.stop(); navigate('/student/activities'); }}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Activities
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🔤 Missing Letter</h1>
          <p className="text-slate-500 text-sm mt-0.5">Pick the missing letter to complete the word.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Score</p>
          <p className="text-2xl font-bold text-indigo-600">{score} <span className="text-base text-slate-400">/ {questions.length}</span></p>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-8">
        <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div className="max-w-sm mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-violet-200 p-10 text-center shadow-sm">
          {/* Word display */}
          <p className="text-5xl font-black tracking-widest text-slate-800 mb-2">
            {q.word.split('').map((l, i) => (
              <span key={i} className={i === q.blank
                ? 'text-indigo-400 border-b-4 border-indigo-400 px-1'
                : ''}>
                {i === q.blank ? '_' : l}
              </span>
            ))}
          </p>
          <p className="text-xs text-slate-400 mb-6">Word {index + 1} of {questions.length}</p>

          {/* Hear it */}
          <button onClick={() => tts.speak(q.word)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-100 text-indigo-700 text-sm font-semibold hover:bg-indigo-200 transition-all mb-8">
            <Volume2 size={16} /> Hear the Word
          </button>

          {/* Letter choices */}
          <div className="grid grid-cols-2 gap-3">
            {shuffled.map((letter) => {
              let cls = 'bg-white border-2 border-slate-200 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50';
              if (chosen) {
                if (letter === answer)   cls = 'bg-green-100 border-2 border-green-400 text-green-800';
                else if (letter === chosen) cls = 'bg-red-100 border-2 border-red-400 text-red-800';
                else                    cls = 'bg-white border-2 border-slate-100 text-slate-400 opacity-50';
              }
              return (
                <button key={letter} onClick={() => pick(letter)}
                  className={`py-4 rounded-2xl text-3xl font-black transition-all ${cls}`}>
                  {letter}
                </button>
              );
            })}
          </div>

          {/* Result feedback */}
          {chosen && (
            <div className={`mt-5 rounded-2xl p-4 text-center border ${
              chosen === answer ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-200'
            }`}>
              {chosen === answer
                ? <p className="text-base font-bold text-green-700">🎉 Correct! The word is <strong>{q.word}</strong></p>
                : <p className="text-base font-bold text-red-600">The missing letter is <strong className="text-green-700">{answer}</strong> — word: <strong>{q.word}</strong></p>
              }
              <div className="flex gap-2 justify-center mt-3">
                {chosen !== answer && (
                  <button onClick={tryAgain}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-red-300 text-red-600 text-sm font-bold hover:bg-red-50 transition-all">
                    <RotateCcw size={13} /> Try Again
                  </button>
                )}
                <button onClick={next}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all">
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MissingLetterActivity;
