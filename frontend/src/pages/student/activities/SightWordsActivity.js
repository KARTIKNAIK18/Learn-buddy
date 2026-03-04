import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAccessibility } from '../../../context/AccessibilityContext';
import useTTS from '../../../hooks/useTTS';
import { addPoints } from '../../../api/student';
import { ArrowLeft, Volume2, ChevronRight, RotateCcw, Shuffle, CheckCircle2, XCircle } from 'lucide-react';
import ConfettiEffect from '../../../components/common/ConfettiEffect';

/*
  Sight Words — very common words a child must recognise instantly.
  Teacher reads the word aloud. Student picks the correct spelling
  from 4 options (3 look-alikes). Forces instant visual recognition.
*/
const SIGHT_GROUPS = [
  {
    label: 'Level 1 — Easiest',
    color: 'from-green-50 to-emerald-50 border-green-200',
    words: [
      { word: 'the',  options: ['the', 'teh', 'het', 'hte']   },
      { word: 'and',  options: ['nad', 'dan', 'and', 'adn']   },
      { word: 'is',   options: ['si', 'is', 'iz', 'ei']       },
      { word: 'a',    options: ['a', 'e', 'i', 'u']           },
      { word: 'it',   options: ['ti', 'it', 'at', 'et']       },
      { word: 'in',   options: ['ni', 'im', 'in', 'on']       },
      { word: 'was',  options: ['saw', 'was', 'wsa', 'swa']   },
      { word: 'he',   options: ['eh', 'he', 'ah', 'ha']       },
    ],
  },
  {
    label: 'Level 2 — Medium',
    color: 'from-amber-50 to-yellow-50 border-amber-200',
    words: [
      { word: 'they',  options: ['tehy', 'they', 'tyhey', 'htey']  },
      { word: 'said',  options: ['said', 'saed', 'daes', 'dais']   },
      { word: 'come',  options: ['cmoе', 'ocme', 'come', 'cmoe']   },
      { word: 'some',  options: ['some', 'smoe', 'soem', 'moes']   },
      { word: 'have',  options: ['hvae', 'have', 'haev', 'avhe']   },
      { word: 'from',  options: ['from', 'fomr', 'frmo', 'ofmr']   },
      { word: 'were',  options: ['weir', 'were', 'wree', 'ewre']   },
      { word: 'there', options: ['theer', 'three', 'there', 'tehre'] },
    ],
  },
  {
    label: 'Level 3 — Challenge',
    color: 'from-red-50 to-rose-50 border-red-200',
    words: [
      { word: 'because', options: ['becuase', 'becasue', 'because', 'becaues'] },
      { word: 'people',  options: ['pepole', 'peolpe', 'peeple', 'people']    },
      { word: 'friend',  options: ['freind', 'friend', 'fiend', 'firned']     },
      { word: 'again',   options: ['agian', 'aigan', 'again', 'aigna']        },
      { word: 'should',  options: ['shuold', 'should', 'shoudl', 'sdould']    },
      { word: 'would',   options: ['wuold', 'wolud', 'would', 'woudl']        },
      { word: 'could',   options: ['coudl', 'cuold', 'coluod', 'could']       },
      { word: 'through', options: ['throug', 'through', 'throguh', 'thrugh']  },
    ],
  },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const SightWordsActivity = () => {
  const navigate              = useNavigate();
  const { settings }          = useAccessibility();
  const tts                   = useTTS(settings.ttsLang, settings.ttsSpeed);
  const [level, setLevel]     = useState(0);
  const [words, setWords]     = useState(() => shuffle(SIGHT_GROUPS[0].words));
  const [index, setIndex]     = useState(0);
  const [opts, setOpts]       = useState([]);
  const [chosen, setChosen]   = useState(null);
  const [score, setScore]          = useState({ correct: 0, total: 0 });
  const [celebrate, setCelebrate]   = useState(0);

  const pointsAdded = useRef(false);
  useEffect(() => {
    if (score.total >= words.length && !pointsAdded.current) {
      pointsAdded.current = true;
      addPoints('sight-words', 10).catch(() => {});
    }
  }, [score.total, words.length]);

  const item = words[index];

  useEffect(() => {
    setOpts(shuffle(item.options));
    setChosen(null);
  }, [index, item]);

  const changeLevel = useCallback((lvl) => {
    setLevel(lvl);
    setWords(shuffle(SIGHT_GROUPS[lvl].words));
    setIndex(0);
    setScore({ correct: 0, total: 0 });
    setChosen(null);
    tts.stop();
  }, [tts]);

  const hear = () => tts.isSpeaking ? tts.stop() : tts.speak(item.word);

  const pick = (opt) => {
    if (chosen) return;
    setChosen(opt);
    const correct = opt === item.word;
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    if (correct) setCelebrate((c) => c + 1);
    tts.speak(correct ? 'Correct! Well done!' : `The correct spelling is ${item.word}.`);
  };

  const next = () => { setIndex((i) => (i + 1) % words.length); };

  const optStyle = (o) => {
    if (!chosen) return 'bg-white border-slate-200 text-slate-800 hover:border-brand-400 hover:bg-brand-50 hover:scale-[1.03]';
    if (o === item.word) return 'bg-green-50 border-green-400 text-green-800 font-bold';
    if (o === chosen)    return 'bg-red-50 border-red-300 text-red-600';
    return 'bg-slate-50 border-slate-100 text-slate-300 opacity-50';
  };

  const grp = SIGHT_GROUPS[level];

  return (
    <DashboardLayout>        <ConfettiEffect trigger={celebrate} />      <button
        onClick={() => { tts.stop(); navigate('/student/activities'); }}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Activities
      </button>

      <div className="max-w-lg mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-slate-900">👁️ Sight Words</h1>
          <p className="text-slate-500 text-sm mt-1">Listen, then pick the correct spelling of the word!</p>
        </div>

        {/* Level tabs */}
        <div className="flex gap-2 justify-center mb-6">
          {SIGHT_GROUPS.map((g, i) => (
            <button
              key={i}
              onClick={() => changeLevel(i)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                level === i
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Level {i + 1}
            </button>
          ))}
        </div>

        {/* Score */}
        <div className="flex justify-center gap-4 mb-5">
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-2 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-600">{score.correct}</p>
            <p className="text-xs text-green-500">Correct</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-600">{score.total}</p>
            <p className="text-xs text-slate-500">Tried</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-600">{index + 1}/{words.length}</p>
            <p className="text-xs text-slate-500">Word</p>
          </div>
        </div>

        {/* Listen card */}
        <div className={`bg-gradient-to-br ${grp.color} border-2 rounded-3xl p-8 text-center mb-6 shadow-md`}>
          <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">{grp.label}</p>
          <p className="text-slate-500 text-sm mb-5">Press <strong>Hear it</strong>, then find the correct spelling below</p>
          <button
            onClick={hear}
            className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-bold transition-all shadow-sm ${
              tts.isSpeaking ? 'bg-red-100 text-red-600 border-2 border-red-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <Volume2 size={20} /> {tts.isSpeaking ? 'Stop' : 'Hear it'}
          </button>
        </div>

        {/* Spelling options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {opts.map((o, i) => (
            <button
              key={i}
              onClick={() => pick(o)}
              disabled={!!chosen}
              className={`px-4 py-5 rounded-2xl border-2 text-xl font-bold font-mono tracking-widest transition-all text-center ${optStyle(o)}`}
            >
              {o}
              {chosen && o === item.word && <CheckCircle2 className="mx-auto mt-1 text-green-500" size={18} />}
              {chosen && o === chosen && o !== item.word && <XCircle className="mx-auto mt-1 text-red-400" size={18} />}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {chosen && (
          <div className={`rounded-3xl p-5 text-center border-2 mb-4 ${
            chosen === item.word ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-200'
          }`}>
            {chosen === item.word
              ? <p className="text-xl font-bold text-green-700">🎉 Correct spelling!</p>
              : <p className="text-base font-semibold text-amber-700">✔ Correct spelling: <span className="font-bold text-green-700 font-mono tracking-widest">{item.word}</span></p>
            }
            <div className="flex gap-2 justify-center mt-4">
              {chosen !== item.word && (
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
                Next Word <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4 text-xs text-slate-400">
          <button onClick={() => { tts.stop(); setIndex(0); setScore({ correct: 0, total: 0 }); setChosen(null); setWords(shuffle(SIGHT_GROUPS[level].words)); }} className="flex items-center gap-1 hover:text-slate-600">
            <RotateCcw size={12} /> Restart
          </button>
          <button onClick={() => { setWords(shuffle(SIGHT_GROUPS[level].words)); setIndex(0); setScore({ correct: 0, total: 0 }); setChosen(null); }} className="flex items-center gap-1 hover:text-slate-600">
            <Shuffle size={12} /> Shuffle
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SightWordsActivity;
