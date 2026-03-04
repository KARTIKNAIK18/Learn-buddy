import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Volume2, Globe, Loader2, Sparkles } from 'lucide-react';
import { getCustomVocab } from '../../api/student';

/* ── Backend TTS base URL (matches axiosInstance) ────────────────── */
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/* ── Languages: English · Kannada · Tulu ────────────────────────── */
// ttsLang = lang code sent to backend /tts endpoint.
// Tulu has no TTS voice → backend uses 'kn' (Kannada) which is the
// closest related language with full TTS support.
const LANGUAGES = [
  { code: 'en',  label: 'English', flag: '🇬🇧', nativeName: 'English', ttsLang: 'en' },
  { code: 'kn',  label: 'Kannada', flag: '🇮🇳', nativeName: 'ಕನ್ನಡ',  ttsLang: 'kn' },
  { code: 'tul', label: 'Tulu',    flag: '🇮🇳', nativeName: 'ತುಳು',    ttsLang: 'kn' },
];

const CATEGORIES = ['Greetings', 'Animals', 'Colors', 'Numbers', 'Food', 'Body Parts'];

/* ── Vocabulary ──────────────────────────────────────────────────── */
const VOCAB = {
  Greetings: [
    { en: 'Hello',        kn: 'ನಮಸ್ಕಾರ',   tul: 'ನಮಸ್ಕಾರ'    },
    { en: 'Good morning', kn: 'ಶುಭೋದಯ',    tul: 'ಶುಭೋದಯ'     },
    { en: 'Thank you',    kn: 'ಧನ್ಯವಾದ',   tul: 'ಧನ್ಯವಾದೊ'   },
    { en: 'Please',       kn: 'ದಯವಿಟ್ಟು',  tul: 'ದಯಮಾಡಿ'     },
    { en: 'Sorry',        kn: 'ಕ್ಷಮಿಸಿ',   tul: 'ಕ್ಷಮೆ' },
    { en: 'Yes',          kn: 'ಹೌದು',       tul: 'ಅವು'         },
    { en: 'No',           kn: 'ಇಲ್ಲ',       tul: 'ಇಜ್ಜಿ'       },
    { en: 'Goodbye',      kn: 'ವಿದಾಯ',      tul: 'ಬಲ್ಲ'        },
  ],
  Animals: [
    { en: 'Cat',      kn: 'ಬೆಕ್ಕು',   tul: 'ಪೂಚೆ'   },
    { en: 'Dog',      kn: 'ನಾಯಿ',     tul: 'ನಾಯಿ'   },
    { en: 'Bird',     kn: 'ಹಕ್ಕಿ',    tul: 'ಪಕ್ಕಿ'   },
    { en: 'Fish',     kn: 'ಮೀನು',     tul: 'ಮೀನ್'   },
    { en: 'Cow',      kn: 'ಹಸು',      tul: 'ಆವ್'    },
    { en: 'Horse',    kn: 'ಕುದುರೆ',   tul: 'ಕುದ್ರೆ' },
    { en: 'Elephant', kn: 'ಆನೆ',      tul: 'ಆನೆ'    },
    { en: 'Monkey',   kn: 'ಕೋತಿ',     tul: 'ಕೋಡಿ'   },
  ],
  Colors: [
    { en: 'Red',    kn: 'ಕೆಂಪು',   tul: 'ಕೆಂಪು'  },
    { en: 'Blue',   kn: 'ನೀಲಿ',    tul: 'ನೀಲಿ'   },
    { en: 'Green',  kn: 'ಹಸಿರು',   tul: 'ಪಚ್ಚೆ'  },
    { en: 'Yellow', kn: 'ಹಳದಿ',    tul: 'ಮಂಜಲ್'  },
    { en: 'Black',  kn: 'ಕಪ್ಪು',   tul: 'ಕಪ್ಪು'  },
    { en: 'White',  kn: 'ಬಿಳಿ',    tul: 'ಬೊಳ್ಪು' },
    { en: 'Orange', kn: 'ಕಿತ್ತಳೆ', tul: 'ಕಿತ್ತಳೆ'},
    { en: 'Pink',   kn: 'ಗುಲಾಬಿ',  tul: 'ಗುಲಾಬಿ' },
  ],
  Numbers: [
    { en: 'One',   kn: 'ಒಂದು',   tul: 'ಒಂಜಿ'  },
    { en: 'Two',   kn: 'ಎರಡು',   tul: 'ರಡ್ಡ್' },
    { en: 'Three', kn: 'ಮೂರು',   tul: 'ಮೂಜಿ'  },
    { en: 'Four',  kn: 'ನಾಲ್ಕು', tul: 'ನಾಲ್'  },
    { en: 'Five',  kn: 'ಐದು',    tul: 'ಐನ್'   },
    { en: 'Six',   kn: 'ಆರು',    tul: 'ಆಜಿ'   },
    { en: 'Seven', kn: 'ಏಳು',    tul: 'ಏಳ್'   },
    { en: 'Eight', kn: 'ಎಂಟು',   tul: 'ಎಣ್ಮ'  },
    { en: 'Nine',  kn: 'ಒಂಬತ್ತು', tul: 'ಒರ್ಮಬ್' },
    { en: 'Ten',   kn: 'ಹತ್ತು',  tul: 'ಪತ್ತ್'  },
  ],
  Food: [
    { en: 'Rice',   kn: 'ಅನ್ನ',      tul: 'ಅಕ್ಕಿ'   },
    { en: 'Bread',  kn: 'ರೊಟ್ಟಿ',    tul: 'ರೊಟ್ಟಿ'  },
    { en: 'Milk',   kn: 'ಹಾಲು',      tul: 'ಪಾಲ್'    },
    { en: 'Water',  kn: 'ನೀರು',      tul: 'ನೀರ್'    },
    { en: 'Apple',  kn: 'ಸೇಬು',      tul: 'ಸೇಬು'    },
    { en: 'Banana', kn: 'ಬಾಳೆಹಣ್ಣು', tul: 'ಬಾಳೆ'    },
    { en: 'Egg',    kn: 'ಮೊಟ್ಟೆ',    tul: 'ಮೊಟ್ಟೆ'  },
    { en: 'Sugar',  kn: 'ಸಕ್ಕರೆ',    tul: 'ಸಕ್ಕರೆ'  },
  ],
  'Body Parts': [
    { en: 'Eye',   kn: 'ಕಣ್ಣು', tul: 'ಕಣ್ಣ್' },
    { en: 'Ear',   kn: 'ಕಿವಿ',  tul: 'ಕೆಬಿ'  },
    { en: 'Nose',  kn: 'ಮೂಗು',  tul: 'ಮೂಗ್'  },
    { en: 'Hand',  kn: 'ಕೈ',    tul: 'ಕೈ'    },
    { en: 'Foot',  kn: 'ಕಾಲು',  tul: 'ಕಾಲ್'  },
    { en: 'Head',  kn: 'ತಲೆ',   tul: 'ತಲೆ'   },
    { en: 'Mouth', kn: 'ಬಾಯಿ',  tul: 'ಬಾಯಿ'  },
    { en: 'Heart', kn: 'ಹೃದಯ',  tul: 'ಹೃದಯ'  },
  ],
};


let currentAudio = null;
let safetyTimer  = null;

const clearSafety = (onEnd) => {
  if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  onEnd && onEnd();
};

const tryWebSpeech = (text, lang, onEnd) => {
  if (!window.speechSynthesis) { clearSafety(onEnd); return; }
  window.speechSynthesis.cancel();
  const utt  = new SpeechSynthesisUtterance(text);
  utt.lang   = lang === 'kn' ? 'kn-IN' : 'en-US';
  utt.rate   = 0.9;
  const voices = window.speechSynthesis.getVoices();
  const match  = voices.find((v) => v.lang.startsWith(lang === 'kn' ? 'kn' : 'en'));
  if (match) utt.voice = match;
  utt.onend   = () => clearSafety(onEnd);
  utt.onerror = () => clearSafety(onEnd);
  window.speechSynthesis.speak(utt);
};

const speakWord = (text, lang, onStart, onEnd) => {
  if (!text) return;
  // stop anything currently playing
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (safetyTimer) clearTimeout(safetyTimer);

  onStart && onStart();

  // Safety: no matter what, reset spinner after 6 s
  safetyTimer = setTimeout(() => clearSafety(onEnd), 6000);

  const url = `${API_BASE}/tts?text=${encodeURIComponent(text)}&lang=${lang}`;

  // Use fetch so we get a real error immediately if backend is down
  const controller = new AbortController();
  const fetchTimer = setTimeout(() => controller.abort(), 5000);

  fetch(url, { signal: controller.signal })
    .then((res) => {
      clearTimeout(fetchTimer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const audio   = new Audio(blobUrl);
      currentAudio  = audio;
      audio.onended = () => { URL.revokeObjectURL(blobUrl); clearSafety(onEnd); };
      audio.onerror = () => { URL.revokeObjectURL(blobUrl); clearSafety(onEnd); };
      audio.play().catch(() => clearSafety(onEnd));
    })
    .catch(() => {
      // Backend not running or failed → try Web Speech API
      clearTimeout(fetchTimer);
      tryWebSpeech(text, lang, onEnd);
    });
};

/* ── Component ───────────────────────────────────────────────────── */
const LanguageLearning = () => {
  const [langCode,    setLangCode]    = useState('kn');
  const [category,    setCategory]    = useState('Greetings');
  const [flipped,     setFlipped]     = useState({});
  const [playing,     setPlaying]     = useState(null); // 'en-i' | 'lang-i'
  const [customWords, setCustomWords] = useState([]);   // teacher-added words
  const [loadingVocab, setLoadingVocab] = useState(true);

  useEffect(() => {
    getCustomVocab()
      .then((res) => setCustomWords(res.data || []))
      .catch(() => {}) // silently ignore if not enrolled or API down
      .finally(() => setLoadingVocab(false));
  }, []);

  const langMeta = LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[1];

  // Build merged vocab: default VOCAB + teacher-added custom words
  const mergedVocab = { ...VOCAB };
  customWords.forEach((w) => {
    const cat = w.category;
    if (!mergedVocab[cat]) mergedVocab[cat] = [];
    // Avoid duplicates by en word
    if (!mergedVocab[cat].some((x) => x.en.toLowerCase() === w.en.toLowerCase())) {
      mergedVocab[cat].push({ en: w.en, kn: w.kn || '', tul: w.tul || '', _custom: true });
    }
  });

  // All categories = defaults + any teacher-added custom ones
  const allCategories = [
    ...CATEGORIES,
    ...Object.keys(mergedVocab).filter((k) => !CATEGORIES.includes(k)).sort(),
  ];

  const words = mergedVocab[category] || [];

  const handleSpeak = (text, lang, key) => {
    setPlaying(key);
    speakWord(text, lang, null, () => setPlaying(null));
  };

  const toggleFlip = (i) => setFlipped((f) => ({ ...f, [i]: !f[i] }));

  // Count teacher-added words in current category
  const teacherCount = customWords.filter((w) => w.category === category).length;

  return (
    <DashboardLayout>
      {/* ── Header ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Globe size={24} className="text-indigo-500" /> Language Learning
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Tap a card to flip it. Use the <strong>Hear</strong> buttons to listen to pronunciation.
        </p>
      </div>

      {/* ── Language selector ── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => { setLangCode(l.code); setFlipped({}); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold border-2 transition-all
              ${langCode === l.code
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}
          >
            <span>{l.flag}</span> {l.label}
            <span className="text-xs opacity-60">{l.nativeName}</span>
          </button>
        ))}
      </div>

      {/* ── Category tabs ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {allCategories.map((cat) => {
          const hasCustom = customWords.some((w) => w.category === cat);
          return (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setFlipped({}); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5
                ${category === cat
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300'}`}
            >
              {cat}
              {hasCustom && <Sparkles size={10} className={category === cat ? 'text-yellow-300' : 'text-indigo-400'} />}
            </button>
          );
        })}
      </div>

      {/* ── Info banner ── */}
      <div className="mb-5 p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 flex items-start justify-between gap-3">
        <p>
          <strong>Tip:</strong> Tap any card to see the {langMeta.label} word.
          Use the <strong>EN</strong> and <strong>{langMeta.label.slice(0,3).toUpperCase()}</strong> buttons to hear the pronunciation.
          {langMeta.code === 'tul' && (
            <span className="ml-2 text-amber-700 font-medium">⚠️ Tulu words are read using Kannada voice — the closest available.</span>
          )}
        </p>
        {!loadingVocab && teacherCount > 0 && (
          <span className="flex-shrink-0 flex items-center gap-1 bg-indigo-200 text-indigo-800 rounded-xl px-2.5 py-1 font-semibold whitespace-nowrap">
            <Sparkles size={11} /> {teacherCount} teacher word{teacherCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Word cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {words.map((w, i) => {
          const isFlipped   = !!flipped[i];
          const displayWord = w[langCode] || w.en;
          const isPlayingEN = playing === `en-${i}`;

          return (
            <div
              key={i}
              onClick={() => toggleFlip(i)}
              className={`cursor-pointer rounded-3xl border-2 p-8 flex flex-col items-center gap-4 shadow-sm
                          transition-all hover:shadow-lg hover:-translate-y-1
                ${isFlipped
                  ? 'bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-300'
                  : 'bg-white border-slate-200'}`}
            >
              {/* Teacher-added badge */}
              {w._custom && (
                <span className="self-start flex items-center gap-1 text-xs font-bold text-indigo-500 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  <Sparkles size={11} /> Teacher Added
                </span>
              )}
              <p className="text-4xl font-black text-slate-800 text-center leading-snug">
                {isFlipped ? displayWord : w.en}
              </p>
              <p className="text-sm text-slate-400 text-center">
                {isFlipped
                  ? <span className="text-indigo-500 font-semibold">{langMeta.label} · tap to flip back</span>
                  : <span>English · tap to see {langMeta.label}</span>}
              </p>

              {/* TTS buttons */}
              <div className="flex gap-3 w-full mt-1" onClick={(e) => e.stopPropagation()}>
                {/* English audio */}
                <button
                  onClick={() => handleSpeak(w.en, 'en', `en-${i}`)}
                  disabled={!!playing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-100
                             text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlayingEN ? <Loader2 size={15} className="animate-spin" /> : <Volume2 size={15} />}
                  EN
                </button>

                {/* Target language audio — shown for KN and TUL */}
                {langCode !== 'en' && (
                  <button
                    onClick={() => handleSpeak(displayWord, langMeta.ttsLang, `lang-${i}`)}
                    disabled={!!playing}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-indigo-100
                               text-indigo-700 text-sm font-semibold hover:bg-indigo-200 transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {playing === `lang-${i}` ? <Loader2 size={15} className="animate-spin" /> : <Volume2 size={15} />}
                    {langMeta.label.slice(0,3).toUpperCase()}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default LanguageLearning;
