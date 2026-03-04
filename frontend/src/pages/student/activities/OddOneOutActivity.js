import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAccessibility } from '../../../context/AccessibilityContext';
import useTTS from '../../../hooks/useTTS';
import { addPoints } from '../../../api/student';
import { ArrowLeft, Volume2, RotateCcw, ChevronRight } from 'lucide-react';
import ConfettiEffect from '../../../components/common/ConfettiEffect';

// Each question: 4 words, one doesn't belong. oddIndex = index of the odd one.
const QUESTIONS = [
  { words: ['Cat',    'Dog',    'Bird',  'Apple' ], oddIndex: 3, reason: 'Apple is a fruit, not an animal.'          },
  { words: ['Red',    'Blue',   'Chair', 'Green' ], oddIndex: 2, reason: 'Chair is furniture, not a colour.'         },
  { words: ['Run',    'Walk',   'Table', 'Jump'  ], oddIndex: 2, reason: 'Table is furniture, not an action.'        },
  { words: ['Rose',   'Tulip',  'Lily',  'Mango' ], oddIndex: 3, reason: 'Mango is a fruit, not a flower.'          },
  { words: ['Happy',  'Sad',    'Angry', 'Pen'   ], oddIndex: 3, reason: 'Pen is an object, not a feeling.'         },
  { words: ['Circle', 'Square', 'Tiger', 'Triangle'], oddIndex: 2, reason: 'Tiger is an animal, not a shape.'       },
  { words: ['Milk',   'Juice',  'Water', 'Bread' ], oddIndex: 3, reason: 'Bread is food, not a drink.'              },
  { words: ['Bus',    'Car',    'Train', 'Banana'], oddIndex: 3, reason: 'Banana is a fruit, not a vehicle.'        },
  { words: ['Sing',   'Dance',  'Sleep', 'Draw'  ], oddIndex: 2, reason: 'Sleep is rest, not a creative activity.'  },
  { words: ['Hat',    'Shoe',   'Sock',  'Cloud' ], oddIndex: 3, reason: 'Cloud is in the sky, not clothing.'       },
  { words: ['Hand',   'Foot',   'Eye',   'Stone' ], oddIndex: 3, reason: 'Stone is not a body part.'                },
  { words: ['Tiger',  'Lion',   'Bear',  'Daisy' ], oddIndex: 3, reason: 'Daisy is a flower, not a wild animal.'   },
  { words: ['Pencil', 'Eraser', 'Ruler', 'Frog'  ], oddIndex: 3, reason: 'Frog is an animal, not a school supply.' },
  { words: ['Monday', 'Friday', 'Sunday','Orange'], oddIndex: 3, reason: 'Orange is a fruit, not a day of the week.'},
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const OddOneOutActivity = () => {
  const navigate            = useNavigate();
  const { settings }        = useAccessibility();
  const tts                 = useTTS(settings.ttsLang, settings.ttsSpeed);

  const [questions]         = useState(() => shuffle(QUESTIONS));
  const [index, setIndex]   = useState(0);
  const [score, setScore]   = useState(0);
  const [chosen, setChosen] = useState(null);
  const [done, setDone]          = useState(false);
  const [celebrate, setCelebrate] = useState(0);

  const pointsAdded = useRef(false);
  useEffect(() => {
    if (done && !pointsAdded.current) {
      pointsAdded.current = true;
      addPoints('odd-one-out', 15).catch(() => {});
    }
  }, [done]);

  const q = questions[index];

  const pick = (wordIndex) => {
    if (chosen !== null) return;
    setChosen(wordIndex);
    const correct = wordIndex === q.oddIndex;
    if (correct) { setScore((s) => s + 1); setCelebrate((c) => c + 1); }
    const msg = correct
      ? `Correct! ${q.words[q.oddIndex]} is the odd one out. ${q.reason}`
      : `Not quite. ${q.words[q.oddIndex]} is the odd one out. ${q.reason}`;
    tts.speak(msg);
  };

  const advance = () => {
    if (index + 1 >= questions.length) { setDone(true); } else { setIndex((i) => i + 1); setChosen(null); }
  };

  const tryAgain = () => { setChosen(null); };

  const readAll = () => tts.speak(q.words.join(', '));

  const restart = () => { setIndex(0); setScore(0); setChosen(null); setDone(false); tts.stop(); };

  if (done) {
    return (
      <DashboardLayout>
        <ConfettiEffect trigger={celebrate} />
        <div className="max-w-md mx-auto mt-16 text-center">
          <div className="text-7xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Well done!</h2>
          <p className="text-slate-500 mb-6">You scored <strong className="text-rose-600">{score}</strong> out of <strong>{questions.length}</strong>.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={restart} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all">
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
    <DashboardLayout>        <ConfettiEffect trigger={celebrate} />      <button onClick={() => { tts.stop(); navigate('/student/activities'); }}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-600 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Activities
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🔍 Odd One Out</h1>
          <p className="text-slate-500 text-sm mt-0.5">Which word does not belong with the others?</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Score</p>
          <p className="text-2xl font-bold text-rose-600">{score} <span className="text-base text-slate-400">/ {questions.length}</span></p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-10">
        <div className="bg-rose-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="max-w-sm mx-auto">
        <p className="text-center text-slate-400 text-xs mb-2">Question {index + 1} of {questions.length}</p>
        <p className="text-center text-slate-700 font-semibold text-lg mb-5">Which one doesn't belong?</p>

        {/* Hear all button */}
        <div className="text-center mb-6">
          <button onClick={readAll}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-rose-100 text-rose-700 text-sm font-semibold hover:bg-rose-200 transition-all">
            <Volume2 size={15} /> Hear All Words
          </button>
        </div>

        {/* 2×2 word grid */}
        <div className="grid grid-cols-2 gap-4">
          {q.words.map((word, i) => {
            let cls = 'bg-white border-2 border-slate-200 text-slate-800 hover:border-rose-400 hover:bg-rose-50';
            if (chosen !== null) {
              if (i === q.oddIndex)   cls = 'bg-green-100 border-2 border-green-500 text-green-800';
              else if (i === chosen)  cls = 'bg-red-100 border-2 border-red-400 text-red-700';
              else                   cls = 'bg-white border-2 border-slate-100 text-slate-400 opacity-50';
            }
            return (
              <button key={i} onClick={() => pick(i)}
                className={`py-6 px-4 rounded-2xl text-xl font-black text-center transition-all shadow-sm active:scale-95 ${cls}`}>
                {word}
                {chosen !== null && i === q.oddIndex && (
                  <span className="block text-xs font-normal mt-1 text-green-600">✓ Odd one out</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Reason shown after answer */}
        {chosen !== null && (
          <div className={`mt-5 rounded-2xl p-4 text-sm text-center font-medium ${
            chosen === q.oddIndex ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {chosen === q.oddIndex ? '🎉 Correct! ' : '😊 Good try! '}{q.reason}
            <div className="flex gap-2 justify-center mt-3">
              {chosen !== q.oddIndex && (
                <button onClick={tryAgain}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-red-300 text-red-600 text-sm font-bold hover:bg-red-50 transition-all">
                  <RotateCcw size={13} /> Try Again
                </button>
              )}
              <button onClick={advance}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition-all">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OddOneOutActivity;
