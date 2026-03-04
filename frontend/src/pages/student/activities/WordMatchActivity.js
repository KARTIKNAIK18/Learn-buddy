import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAccessibility } from '../../../context/AccessibilityContext';
import useTTS from '../../../hooks/useTTS';
import { addPoints } from '../../../api/student';
import { ArrowLeft, Volume2, CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import ConfettiEffect from '../../../components/common/ConfettiEffect';

const QUESTIONS = [
  { word: 'Happy',   emoji: '😊', correct: 'Feeling joyful and glad',      options: ['Feeling sad', 'Feeling joyful and glad', 'Feeling angry', 'Very tired']        },
  { word: 'Big',     emoji: '🐘', correct: 'Very large in size',            options: ['Very small', 'Very loud', 'Very large in size', 'Very fast']                   },
  { word: 'Cold',    emoji: '🧊', correct: 'Very low in temperature',       options: ['Very hot', 'Very bright', 'Very low in temperature', 'Very heavy']             },
  { word: 'Brave',   emoji: '🦁', correct: 'Not afraid, full of courage',   options: ['Feeling scared', 'Not afraid, full of courage', 'Very sleepy', 'Very small']   },
  { word: 'Kind',    emoji: '🤝', correct: 'Friendly and caring to others', options: ['Mean and rude', 'Loud and noisy', 'Friendly and caring to others', 'Very fast'] },
  { word: 'Fast',    emoji: '🐇', correct: 'Moving very quickly',           options: ['Moving very slowly', 'Moving very quietly', 'Moving very quickly', 'Standing still'] },
  { word: 'Bright',  emoji: '💡', correct: 'Giving out a lot of light',     options: ['Very dark', 'Giving out a lot of light', 'Very quiet', 'Very small']           },
  { word: 'Tiny',    emoji: '🐜', correct: 'Very very small',               options: ['Very very big', 'Very very loud', 'Very very small', 'Very very fast']         },
  { word: 'Sleepy',  emoji: '😴', correct: 'Feeling like you need to sleep',options: ['Full of energy', 'Feeling like you need to sleep', 'Very excited', 'Very hungry'] },
  { word: 'Loud',    emoji: '📢', correct: 'Making a lot of noise',         options: ['Very quiet', 'Making a lot of noise', 'Very colourful', 'Very soft']            },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const WordMatchActivity = () => {
  const navigate               = useNavigate();
  const { settings }           = useAccessibility();
  const tts                    = useTTS(settings.ttsLang, settings.ttsSpeed);
  const [questions]            = useState(() => QUESTIONS.map((q) => ({ ...q, options: shuffle(q.options) })));
  const [index, setIndex]      = useState(0);
  const [chosen, setChosen]    = useState(null);
  const [score, setScore]           = useState({ correct: 0, total: 0 });
  const [celebrate, setCelebrate]    = useState(0);

  const pointsAdded = useRef(false);
  useEffect(() => {
    if (score.total >= questions.length && !pointsAdded.current) {
      pointsAdded.current = true;
      addPoints('word-match', 15).catch(() => {});
    }
  }, [score.total, questions.length]);

  const q = questions[index];

  const pick = (option) => {
    if (chosen) return;
    setChosen(option);
    const correct = option === q.correct;
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    if (correct) setCelebrate((c) => c + 1);
    tts.speak(correct ? 'Correct! Great job!' : `The answer is: ${q.correct}`);
  };

  const next = () => { setChosen(null); setIndex((i) => (i + 1) % questions.length); };

  const optionStyle = (o) => {
    if (!chosen) return 'bg-white border-slate-200 text-slate-700 hover:border-brand-400 hover:bg-brand-50 hover:scale-[1.02]';
    if (o === q.correct) return 'bg-green-50 border-green-400 text-green-800 font-bold scale-[1.02]';
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
          <h1 className="text-2xl font-bold text-slate-900">🎯 Word Match</h1>
          <p className="text-slate-500 text-sm mt-1">Read the word, then pick the correct meaning!</p>
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
        <div className="bg-gradient-to-br from-brand-50 to-violet-50 border-2 border-brand-200 rounded-3xl p-8 text-center mb-6 shadow-md">
          <span className="text-6xl mb-3 block">{q.emoji}</span>
          <p className="text-5xl font-bold text-brand-800 tracking-wide mb-4">{q.word}</p>
          <button
            onClick={() => tts.isSpeaking ? tts.stop() : tts.speak(`${q.word}. What does it mean?`)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              tts.isSpeaking ? 'bg-red-100 text-red-600' : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 shadow-sm'
            }`}
          >
            <Volume2 size={16} /> {tts.isSpeaking ? 'Stop' : 'Hear the word'}
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {q.options.map((option, i) => (
            <button
              key={i}
              onClick={() => pick(option)}
              disabled={!!chosen}
              className={`w-full px-5 py-4 rounded-2xl border-2 text-base text-left transition-all ${optionStyle(option)}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full border-2 border-current flex-shrink-0 flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
                {chosen && option === q.correct && <CheckCircle2 className="ml-auto text-green-500 flex-shrink-0" size={20} />}
                {chosen && option === chosen && option !== q.correct && <XCircle className="ml-auto text-red-400 flex-shrink-0" size={20} />}
              </div>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {chosen && (
          <div className={`rounded-3xl p-5 text-center border-2 mb-4 ${
            chosen === q.correct ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-200'
          }`}>
            {chosen === q.correct
              ? <p className="text-xl font-bold text-green-700">🎉 Correct! You got it!</p>
              : <p className="text-base font-semibold text-amber-700">✔ Correct answer: <span className="text-green-700 font-bold">{q.correct}</span></p>
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

        <div className="flex justify-center text-xs text-slate-400">
          <span>{index + 1} / {questions.length}</span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WordMatchActivity;
