import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAccessibility } from '../../../context/AccessibilityContext';
import useTTS from '../../../hooks/useTTS';
import { addPoints } from '../../../api/student';
import { ArrowLeft, ChevronLeft, ChevronRight, Shuffle, Volume2, RotateCcw } from 'lucide-react';
import ConfettiEffect from '../../../components/common/ConfettiEffect';

const CARDS = [
  { word: 'Apple',    emoji: 'https://i.pinimg.com/originals/32/6d/6e/326d6eaf6c633c0d41c8e3cf1f4c927d.gif', meaning: 'A round fruit, red or green',          sentence: 'I eat an apple every day.'          },
  { word: 'Book',     emoji: 'https://cdn.dribbble.com/userupload/19646652/file/original-b84277d6110f0722a534324ac2c977a8.gif', meaning: 'Pages full of words to read',           sentence: 'She reads a book at night.'         },
  { word: 'Cat',      emoji: 'https://i.pinimg.com/originals/a6/1d/e1/a61de12663904e43b4a677d200e894e5.gif', meaning: 'A soft furry animal that says meow',    sentence: 'The cat sat on the mat.'            },
  { word: 'Dog',      emoji: 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/08ab7226885953.5635dd02cd8d4.gif', meaning: 'A friendly animal that barks',          sentence: 'My dog likes to run and play.'      },
  { word: 'Sun',      emoji: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqsHR6s7hdY0tyUxRAPUPYqRr_eR3giLKqNA&s', meaning: 'The bright star that lights our sky',   sentence: 'The sun comes up every morning.'    },
  { word: 'Rain',     emoji: 'https://i.pinimg.com/originals/36/6f/fd/366ffdc50a42bcd1055c1c18f5f56bad.gif', meaning: 'Water drops falling from clouds',      sentence: 'Plants need rain to grow.'          },
  { word: 'Tree',     emoji: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWN9Gw3yKj3nlIgYOz4UbNXMSi90bvNYRerg&s', meaning: 'A tall plant with a trunk and leaves',  sentence: 'Birds build nests in trees.'        },
  { word: 'Fish',     emoji: '🐟', meaning: 'An animal that swims in water',         sentence: 'The fish swims in the pond.'        },
  { word: 'Star',     emoji: '⭐', meaning: 'A glowing light in the night sky',      sentence: 'I count the stars at night.'        },
  { word: 'House',    emoji: '🏠', meaning: 'A building where people live',          sentence: 'My house has a big garden.'         },
  { word: 'Flower',   emoji: '🌸', meaning: 'A beautiful plant that blooms',         sentence: 'The flower smells very nice.'       },
  { word: 'Moon',     emoji: '🌙', meaning: 'The round light we see at night',       sentence: 'The moon shines at night.'          },
  { word: 'Boat',     emoji: '⛵', meaning: 'A vehicle that travels on water',       sentence: 'The boat sailed on the river.'      },
  { word: 'Bird',     emoji: '🐦', meaning: 'An animal with wings that can fly',     sentence: 'A bird sings in the morning.'       },
  { word: 'Bread',    emoji: '🍞', meaning: 'A soft food we eat at breakfast',       sentence: 'I had bread and butter today.'      },
  { word: 'Frog',     emoji: '🐸', meaning: 'A small green animal that jumps',       sentence: 'The frog jumped into the pond.'     },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const FlashCardsActivity = () => {
  const navigate               = useNavigate();
  const { settings }           = useAccessibility();
  const tts                    = useTTS(settings.ttsLang, settings.ttsSpeed);
  const [cards, setCards]      = useState(CARDS);
  const [index, setIndex]      = useState(0);
  const [flipped, setFlipped]  = useState(false);
  const [seen, setSeen]           = useState(new Set());
  const [celebrate, setCelebrate] = useState(0);

  const pointsAdded = useRef(false);
  useEffect(() => {
    if (seen.size >= cards.length && !pointsAdded.current) {
      pointsAdded.current = true;
      addPoints('flashcards', 10).catch(() => {});
      setCelebrate((c) => c + 1);
    }
  }, [seen, cards.length]);

  const card = cards[index];

  useEffect(() => { tts.stop(); setFlipped(false); }, [index]); // eslint-disable-line

  const go = (dir) => {
    setSeen((s) => new Set([...s, index]));
    setIndex((i) => (i + dir + cards.length) % cards.length);
  };

  const reshuffle = () => { setCards(shuffle(CARDS)); setIndex(0); setFlipped(false); setSeen(new Set()); };

  const readCard = () => {
    const text = flipped
      ? `${card.word}. ${card.meaning}. Example: ${card.sentence}`
      : card.word;
    tts.isSpeaking ? tts.stop() : tts.speak(text);
  };

  return (
    <DashboardLayout>
      <ConfettiEffect trigger={celebrate} />
      {/* Back */}
      <button
        onClick={() => { tts.stop(); navigate('/student/activities'); }}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Activities
      </button>

      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">🃏 Flash Cards</h1>
          <p className="text-slate-500 text-sm mt-1">Click the card to flip it. Press <strong>Hear it</strong> to listen.</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-400 rounded-full transition-all"
              style={{ width: `${(seen.size / cards.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 flex-shrink-0">{seen.size}/{cards.length} seen</span>
        </div>

        {/* Card */}
        <div
          onClick={() => setFlipped(!flipped)}
          className={`rounded-3xl border-2 min-h-[280px] cursor-pointer select-none
                      flex flex-col items-center justify-center gap-4 p-8 transition-all
                      shadow-xl hover:shadow-2xl
                      ${flipped
                        ? 'bg-gradient-to-br from-brand-50 to-violet-50 border-brand-300'
                        : 'bg-white border-slate-200 hover:border-brand-200'
                      }`}
        >
          {!flipped ? (
            <>
              {/* <span className="text-8xl leading-none">{card.emoji}</span>
              <p className="text-5xl font-bold text-slate-800 tracking-wide">{card.word}</p>
              <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Tap to see meaning →</span> */}
            
              {card.emoji && card.emoji.startsWith('http') ? (
              <img src={card.emoji} alt={card.word} style={{ height: '18rem',width: '24rem', objectFit: 'contain' }} className="mx-auto"/>
              ) : (
                <span className="text-8xl leading-none">{card.emoji}</span>
                
              )}
              <p className="text-5xl font-bold text-slate-800 tracking-wide">{card.word}</p>
              <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                Tap to see meaning →
  </span>
            </>
          ) : (
            <>
              <img src={card.emoji} alt={card.word} style={{ height: '18rem',width: '24rem', objectFit: 'contain' }} className="mx-auto"/>
              {/* <span className="text-5xl">{card.emoji}</span> */}
              <p className="text-xl font-bold text-brand-700 text-center leading-snug">{card.meaning}</p>
              <div className="bg-white border border-brand-100 rounded-2xl px-5 py-3 mt-1">
                <p className="text-sm text-slate-600 italic text-center">"{card.sentence}"</p>
              </div>
              <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Tap to flip back</span>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => go(-1)}
            className="w-12 h-12 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all hover:border-brand-300 shadow-sm"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={readCard}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm ${
              tts.isSpeaking
                ? 'bg-red-100 text-red-600 border-2 border-red-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <Volume2 size={18} />
            {tts.isSpeaking ? 'Stop' : 'Hear it'}
          </button>

          <button
            onClick={() => go(1)}
            className="w-12 h-12 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all hover:border-brand-300 shadow-sm"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Card counter + shuffle */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-400">
          <span className="font-medium">{index + 1} / {cards.length}</span>
          <button onClick={reshuffle} className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
            <Shuffle size={14} /> Shuffle
          </button>
          <button onClick={() => { setIndex(0); setSeen(new Set()); setFlipped(false); }} className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FlashCardsActivity;
