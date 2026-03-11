import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Volume2, Volume, Globe, Loader2, Sparkles } from 'lucide-react';
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

const CATEGORIES = ['Alphabets', 'Animals', 'Colors', 'Numbers', 'Food', 'Body Parts'];

/* ── Media Files (GIF/Video/Audio) for words ────────────────────── */
// Store your uploaded media files in: frontend/src/images/vocabulary/
// Example: 'A.gif', 'Cat.gif', 'Apple.mp4', etc.
const WORD_MEDIA = {
  // Put your uploaded GIF/video filenames here
  // Example: 'Cat': 'Cat.gif', 'Dog': 'Dog.gif', 'A': 'A.gif'


  // Animals
  'Cat': 'cat.mp4',
  'Dog': 'dog.mp4',
  'Bird': 'bird.mp4',
  'Fish': 'fish.mp4',
  'Cow': 'cow.mp4',
  'Horse': 'horse.mp4',
  'Elephant': 'elephant.mp4',
  'Monkey': 'monkey.mp4',
  'Rice' : 'rice.mp4',

  //food

  'Bread' : 'bread.jpg',
  'Milk' : 'milk.mp4',
  'Water' : 'water.jpg',
  'Apple' : 'apple.mp4',
  'Banana' : 'banana.jpg',
  'Egg' : 'egg.jpg',
  'Sugar' : 'sugar.jpg',

  //body parts
  'Eye' : 'eye.jpg',
  'Ear' : 'ear.jpg',
  'Nose' : 'nose.jpg',
  'Hand' : 'hand.jpg',
  'Foot' : 'foot.jpg',
  'Head' : 'head.jpg',
  'Mouth' : 'mouth.jpg',
  'Heart' : 'heart.jpg',



  
};

// Audio files for pronunciation (optional)
const WORD_AUDIO = {
  // Example: 'Cat': 'Cat.mp3', 'Dog': 'Dog.mp3'
  'Cat': 'cat.mp3',
  'Dog': 'dog.mp3',
  'Bird': 'pecock.mp3',
  'Elephant': 'elephant.mp3',
  'Fish': 'fish.mp3',
  'Cow': 'cow.mp3',
  'Horse': 'horse.mp3',
  'Monkey': 'monkey.mp3', 
};

/* ── Color definitions for visual display ───────────────────────── */
const COLOR_VALUES = {
  'Red': '#EF4444',
  'Blue': '#3B82F6',
  'Green': '#10B981',
  'Yellow': '#F59E0B',
  'Black': '#1F2937',
  'White': '#FFFFFF',
  'Orange': '#F97316',
  'Pink': '#EC4899',
};

/* ── Alphabet associations with child-friendly words ────────────── */
const ALPHABET_WORDS = {
  'A': 'Ant',
  'B': 'ToothBrush',
  'C': 'Clap',
  'D': 'Drink',
  'E': 'Eat',
  'F': 'Fly',
  'G': 'Go',
  'H': 'Hop',
  'I': 'In',
  'J': 'Jump',
  'K': 'Kick',
  'L': 'Look',
  'M': 'Move',
  'N': 'Nod',
  'O': 'Open',
  'P': 'Push',
  'Q': 'Quiet',
  'R': 'Run',
  'S': 'Sit',
  'T': 'Talk',
  'U': 'Up',
  'V': 'View',
  'W': 'Walk',
  'X': 'X-ray',
  'Y': 'Yawn',
  'Z': 'Zip'
};

const ALPHABET_IMAGES = {
  'A': 'https://cdn.bugs.com/wp-content/uploads/iStock-2148971501.jpg', // Ask
  'B': 'https://cdn.pixabay.com/photo/2018/03/01/16/43/toothbrush-3191097_1280.jpg', // Brush
  'C': 'https://media0.giphy.com/media/v1.Y2lkPTZjMDliOTUyNzFkODFjazhmODM5aHl1a3k3NWhrOG5wb3NsNHhmdXQ4YjUxbnEyOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1236TCtX5dsGEo/200.gif', // Clap
  'D': 'https://i.pinimg.com/originals/51/23/d8/5123d8d5ddaac86cafbd832f0390b554.gif', // Drink
  'E': 'https://media.baamboozle.com/uploads/images/253266/1663409179_388808_gif-url.gif', // Eat
  'F': 'https://media3.giphy.com/media/v1.Y2lkPTZjMDliOTUyMWFzOWZiaXp3Z2NiemNxZGV0bjIxMTgzcXM1aWZwcXdnbWFvY2RqMiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/b05CukqUdVhde/200.gif', // Fly
  'G': 'https://www.darwingates.com/uploads/1/2/3/7/12375874/981417.gif', // Gate
  'H': 'https://i.makeagif.com/media/6-22-2017/PLZRqY.gif', // Horse
  'I': 'https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUybnAxdTZkOHMyNmE2ZzRzOGV5bnd4NXhpcXEzdGczZnljMXlkMHoweSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/RlMmeESOkfyNeVgoCr/giphy.gif', // Icecream
  'J': 'https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyODAydGNydnppMHF0bzJiYTB6MzlxN3JrN2IyeXpsbDNidXc4N3lncCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/QDOds18Aq5co2XHs81/source.gif', // Jump
  'K': 'https://media0.giphy.com/media/v1.Y2lkPTZjMDliOTUyZjFwNGpiank0dHN1YXNtdzEzMW8yemdxNGU3dnA5d3JlbWZqcDM0cyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/qiiimDJtLj4XK/giphy.gif', // Kick
  'L': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOl4kaRj6SkHCrlJffkcTrjzMZg-LS9bctAg&s', // Lime
  'M': 'https://i.pinimg.com/originals/5e/c2/f4/5ec2f418c8d141532b958ef90e2ea88c.gif', // Move
  'N': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIHL24nFbXgEyurM0BupcSBa-uA5jzrLV1KA&s', // Nail
  'O': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStKSKTaeh-MPFdbh_982JtVbkGRysH039auQ&s', // Owl
  'P': 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg', // Push
  'Q': 'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg', // Quiet
  'R': 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg', // Run
  'S': 'https://images.pexels.com/photos/935743/pexels-photo-935743.jpeg', // Sit
  'T': 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg', // Talk
  'U': 'https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg', // Up
  'V': 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg', // View
  'W': 'https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg', // Walk
  'X': 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg', // X-ray
  'Y': 'https://images.pexels.com/photos/3775164/pexels-photo-3775164.jpeg', // Yawn
  'Z': 'https://images.pexels.com/photos/1598377/pexels-photo-1598377.jpeg'
};


/* ── Vocabulary ──────────────────────────────────────────────────── */
const VOCAB = {
  Alphabets: [
    { en: 'A', kn: 'ಎ', tul: 'ಎ' },
    { en: 'B', kn: 'ಬಿ', tul: 'ಬಿ' },
    { en: 'C', kn: 'ಸಿ', tul: 'ಸಿ' },
    { en: 'D', kn: 'ಡಿ', tul: 'ಡಿ' },
    { en: 'E', kn: 'ಇ', tul: 'ಇ' },
    { en: 'F', kn: 'ಎಫ್', tul: 'ಎಫ್' },
    { en: 'G', kn: 'ಜಿ', tul: 'ಜಿ' },
    { en: 'H', kn: 'ಎಚ್', tul: 'ಎಚ್' },
    { en: 'I', kn: 'ಐ', tul: 'ಐ' },
    { en: 'J', kn: 'ಜೇ', tul: 'ಜೇ' },
    { en: 'K', kn: 'ಕೇ', tul: 'ಕೇ' },
    { en: 'L', kn: 'ಎಲ್', tul: 'ಎಲ್' },
    { en: 'M', kn: 'ಎಮ್', tul: 'ಎಮ್' },
    { en: 'N', kn: 'ಎನ್', tul: 'ಎನ್' },
    { en: 'O', kn: 'ಓ', tul: 'ಓ' },
    { en: 'P', kn: 'ಪಿ', tul: 'ಪಿ' },
    { en: 'Q', kn: 'ಕ್ಯೂ', tul: 'ಕ್ಯೂ' },
    { en: 'R', kn: 'ಆರ್', tul: 'ಆರ್' },
    { en: 'S', kn: 'ಎಸ್', tul: 'ಎಸ್' },
    { en: 'T', kn: 'ಟಿ', tul: 'ಟಿ' },
    { en: 'U', kn: 'ಯು', tul: 'ಯು' },
    { en: 'V', kn: 'ವಿ', tul: 'ವಿ' },
    { en: 'W', kn: 'ಡಬ್ಲ್ಯೂ', tul: 'ಡಬ್ಲ್ಯೂ' },
    { en: 'X', kn: 'ಎಕ್ಸ್', tul: 'ಎಕ್ಸ್' },
    { en: 'Y', kn: 'ವೈ', tul: 'ವೈ' },
    { en: 'Z', kn: 'ಝೆಡ್', tul: 'ಝೆಡ್' },
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
  console.log('🔊 Using Web Speech API fallback for:', text, 'lang:', lang);
  window.speechSynthesis.cancel();
  const utt  = new SpeechSynthesisUtterance(text);
  
  // Map language codes - Tulu uses Kannada voice
  utt.lang   = (lang === 'kn' || lang === 'tul') ? 'kn-IN' : 'en-US';
  
  // Make it sound more natural (slower and smoother)
  utt.rate   = 0.75;  // Slower speed for clarity
  utt.pitch  = 1.0;   // Natural pitch
  utt.volume = 1.0;   // Full volume
  
  // Try to find the best voice available
  const voices = window.speechSynthesis.getVoices();
  console.log('📢 Available voices:', voices.length, 'total');
  
  // For Kannada/Tulu, try to find any Indian voice
  let match;
  if (lang === 'kn' || lang === 'tul') {
    // Try Kannada voice first
    match = voices.find((v) => v.lang.startsWith('kn'));
    if (match) console.log('✅ Found Kannada voice:', match.name);
    // If no Kannada, try any Indian English voice (better than robotic)
    if (!match) {
      match = voices.find((v) => v.lang === 'en-IN');
      if (match) console.log('✅ Using Indian English voice:', match.name);
    }
    // Last resort: any English voice
    if (!match) {
      match = voices.find((v) => v.lang.startsWith('en'));
      if (match) console.log('⚠️ Using English voice as fallback:', match.name);
    }
  } else {
    // English - prefer natural/premium voices
    match = voices.find((v) => v.lang === 'en-US' && (v.name.includes('Natural') || v.name.includes('Premium')));
    if (!match) match = voices.find((v) => v.lang === 'en-US');
    if (!match) match = voices.find((v) => v.lang.startsWith('en'));
    if (match) console.log('✅ Selected English voice:', match.name);
  }
  
  if (match) {
    utt.voice = match;
  } else {
    console.warn('⚠️ No suitable voice found for language:', lang);
  }
  
  utt.onend   = () => clearSafety(onEnd);
  utt.onerror = (e) => {
    console.error('❌ Web Speech error:', e);
    clearSafety(onEnd);
  };
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
  console.log('🎤 Requesting TTS from backend:', url);

  // Use fetch so we get a real error immediately if backend is down
  const controller = new AbortController();
  const fetchTimer = setTimeout(() => controller.abort(), 5000);

  fetch(url, { signal: controller.signal })
    .then((res) => {
      clearTimeout(fetchTimer);
      if (!res.ok) {
        console.warn('⚠️ Backend TTS returned error:', res.status);
        throw new Error(`HTTP ${res.status}`);
      }
      console.log('✅ Backend TTS successful, playing audio...');
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const audio   = new Audio(blobUrl);
      currentAudio  = audio;
      audio.onended = () => { URL.revokeObjectURL(blobUrl); clearSafety(onEnd); };
      audio.onerror = () => { 
        console.error('❌ Audio playback error'); 
        URL.revokeObjectURL(blobUrl); 
        clearSafety(onEnd); 
      };
      audio.play().catch((err) => {
        console.error('❌ Audio play() failed:', err);
        clearSafety(onEnd);
      });
    })
    .catch((err) => {
      // Backend not running or failed → try Web Speech API
      console.warn('❌ Backend TTS failed, using Web Speech API fallback:', err.message);
      clearTimeout(fetchTimer);
      tryWebSpeech(text, lang, onEnd);
    });
};

/* ── Component ───────────────────────────────────────────────────── */
const LanguageLearning = () => {
  const [langCode,    setLangCode]    = useState('kn');
  const [category,    setCategory]    = useState('Alphabets');
  const [flipped,     setFlipped]     = useState({});
  const [playing,     setPlaying]     = useState(null); // 'en-i' | 'lang-i'
  const [customWords, setCustomWords] = useState([]);   // teacher-added words
  const [loadingVocab, setLoadingVocab] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // Current word index

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
      mergedVocab[cat].push({ 
        en: w.en, 
        kn: w.kn || '', 
        tul: w.tul || '', 
        image_url: w.image_url,
        audio_url: w.audio_url,
        _custom: true 
      });
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
    // Always use TTS for pronunciation
    speakWord(text, lang, null, () => setPlaying(null));
  };

  const handlePlaySound = (audioUrl, key) => {
    // Play sound effect file (from database URL or local file)
    if (!audioUrl) return;
    
    setPlaying(key);
    try {
      const audio = new Audio(audioUrl);
      audio.play()
        .then(() => {
          audio.onended = () => setPlaying(null);
        })
        .catch((err) => {
          console.log('Sound playback failed:', err);
          setPlaying(null);
        });
    } catch (err) {
      console.log('Sound file error:', err);
      setPlaying(null);
    }
  };

  const toggleFlip = useCallback(() => {
    setFlipped((f) => ({ ...f, [currentWordIndex]: !f[currentWordIndex] }));
  }, [currentWordIndex]);

  // Navigation functions
  const nextWord = useCallback(() => {
    setCurrentWordIndex((prev) => prev < words.length - 1 ? prev + 1 : prev);
  }, [words.length]);

  const prevWord = useCallback(() => {
    setCurrentWordIndex((prev) => prev > 0 ? prev - 1 : prev);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextWord();
      if (e.key === 'ArrowLeft') prevWord();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleFlip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextWord, prevWord, toggleFlip]);

  // Reset index when category or language changes
  useEffect(() => {
    setCurrentWordIndex(0);
    setFlipped({});
  }, [category, langCode]);

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

      {/* ── Single word card with navigation ── */}
      {words.length > 0 ? (
        <div className="max-w-6xl mx-auto">
          {/* Navigation Info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              Word <span className="font-bold text-indigo-600">{currentWordIndex + 1}</span> of <span className="font-bold">{words.length}</span>
            </p>
            <p className="text-xs text-slate-400">
              Use ← → arrow keys to navigate
            </p>
          </div>

          {/* Card with Side Navigation */}
          <div className="flex items-center justify-center gap-6">
            {/* Left Arrow Button */}
            <button
              onClick={prevWord}
              disabled={currentWordIndex === 0}
              className="flex-shrink-0 w-16 h-16 rounded-full bg-white border-2 border-slate-200
                         text-slate-700 font-semibold hover:bg-slate-50 hover:border-indigo-300 transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200
                         flex items-center justify-center text-3xl shadow-lg"
            >
              ←
            </button>

            {/* Word Card */}
            {(() => {
              const w = words[currentWordIndex];
              const isFlipped   = !!flipped[currentWordIndex];
              const displayWord = w[langCode] || w.en;
              const isPlayingEN = playing === `en-${currentWordIndex}`;

              return (
                <div
                  onClick={toggleFlip}
                  className={`cursor-pointer rounded-3xl border-2 p-10 flex flex-col items-center gap-5 shadow-xl
                              transition-all hover:shadow-2xl flex-1 max-w-3xl
                    ${isFlipped
                      ? 'bg-gradient-to-br from-indigo-900 to-violet-900 border-indigo-700'
                      : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'}`}
                  style={{ minHeight: '600px' }}
                >
                  {/* Teacher-added badge */}
                  {w._custom && (
                    <span className="self-start flex items-center gap-1 text-xs font-bold text-indigo-300 bg-indigo-950 border border-indigo-700 px-2.5 py-0.5 rounded-full">
                      <Sparkles size={11} /> Teacher Added
                    </span>
                  )}

                {/* Visual content - Dynamic based on category */}
                <div className="w-full flex items-center justify-center mb-2" style={{ minHeight: '300px' }}>
                  {(() => {
                    // Priority 1: Check for database image_url (teacher uploaded via ManageVocabulary)
                    if (w.image_url) {
                      const isVideo = w.image_url.includes('.mp4') || w.image_url.includes('.webm') || w.image_url.endsWith('/video/');
                      return isVideo ? (
                        <video 
                          src={w.image_url}
                          autoPlay 
                          loop 
                          muted
                          className="max-w-full max-h-72 rounded-2xl shadow-lg"
                          style={{ objectFit: 'contain' }}
                        />
                      ) : (
                        <img 
                          src={w.image_url}
                          alt={w.en}
                          className="max-w-full max-h-72 rounded-2xl shadow-lg"
                          style={{ objectFit: 'contain' }}
                        />
                      );
                    }
                    
                    // Priority 2: Check for local uploaded media (hardcoded WORD_MEDIA)
                    if (WORD_MEDIA[w.en]) {
                      return WORD_MEDIA[w.en].endsWith('.mp4') || WORD_MEDIA[w.en].endsWith('.webm') ? (
                        <video 
                          src={require(`../../images/vocabulary/${WORD_MEDIA[w.en]}`)}
                          autoPlay 
                          loop 
                          muted
                          className="max-w-full max-h-72 rounded-2xl shadow-lg"
                          style={{ objectFit: 'contain' }}
                        />
                      ) : (
                        <img 
                          src={require(`../../images/vocabulary/${WORD_MEDIA[w.en]}`)}
                          alt={w.en}
                          className="max-w-full max-h-72 rounded-2xl shadow-lg"
                          style={{ objectFit: 'contain' }}
                        />
                      );
                    }

                    // Priority 3: Generate icons for Colors
                    if (category === 'Colors' && COLOR_VALUES[w.en]) {
                      return (
                        <div className="flex flex-col items-center gap-4">
                          <div 
                            className="w-64 h-64 rounded-3xl shadow-2xl"
                            style={{ 
                              backgroundColor: COLOR_VALUES[w.en],
                              border: w.en === 'White' ? '3px solid #e5e7eb' : 'none'
                            }}
                          />
                          <div className="text-2xl font-bold text-slate-100">{w.en}</div>
                        </div>
                      );
                    }

                    // Generate icons for Numbers
                    if (category === 'Numbers') {
                      const numberMap = {
                        'One': '1', 'Two': '2', 'Three': '3', 'Four': '4', 'Five': '5',
                        'Six': '6', 'Seven': '7', 'Eight': '8', 'Nine': '9', 'Ten': '10'
                      };
                      const numValue = numberMap[w.en];
                      return (
                        <div className="relative">
                          <div className="w-56 h-56 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
                                        flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform">
                            <span className="text-9xl font-black text-white">{numValue}</span>
                          </div>
                          <div className="mt-4 text-2xl font-bold text-slate-100 text-center">{w.en}</div>
                        </div>
                      );
                    }

                    // Generate icons for Alphabets
                    if (category === 'Alphabets' && ALPHABET_IMAGES[w.en]) {
                      return (
                        <div className="flex flex-col items-center gap-6">
                          {/* Image from Internet */}
                          <img 
                            src={ALPHABET_IMAGES[w.en]} 
                            alt={`${w.en} for ${ALPHABET_WORDS[w.en]}`}
                            className="max-w-full max-h-72 rounded-2xl shadow-lg"
                            style={{ objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/400?text=' + w.en;
                            }}
                          />
                          {/* Letter and Word */}
                          <div className="text-center">
                            <div className="text-7xl font-black text-indigo-300 mb-2">
                              {w.en}
                            </div>
                            <div className="text-3xl font-semibold text-slate-200">
                              for {ALPHABET_WORDS[w.en]}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Placeholder for Food and Body Parts (need uploads)
                    return (
                      <div className="text-slate-300 text-sm font-medium text-center">
                        <div className="text-6xl mb-4">📁</div>
                        Upload {w.en}.gif or {w.en}.mp4
                      </div>
                    );
                  })()}
                </div>

                {/* Word text */}
                <p className="text-6xl font-black text-white text-center leading-snug">
                  {isFlipped ? displayWord : w.en}
                </p>
                <p className="text-sm text-slate-300 text-center">
                  {isFlipped
                    ? <span className="text-indigo-300 font-semibold">{langMeta.label} · tap to flip back</span>
                    : <span>English · tap to see {langMeta.label}</span>}
                </p>

                {/* TTS & Sound buttons */}
                <div className="flex gap-3 w-full mt-2" onClick={(e) => e.stopPropagation()}>
                  {/* Sound Effect button (if available from DB or local) */}
                  {(w.audio_url || WORD_AUDIO[w.en]) && (
                    <button
                      onClick={() => {
                        const audioUrl = w.audio_url || (WORD_AUDIO[w.en] ? require(`../../images/vocabulary/${WORD_AUDIO[w.en]}`) : null);
                        if (audioUrl) handlePlaySound(audioUrl, `sound-${currentWordIndex}`);
                      }}
                      disabled={!!playing}
                      className="flex-1 flex items-center justify-center gap-1.5 py-4 rounded-xl bg-green-100
                                 text-green-700 font-semibold hover:bg-green-200 transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                      title="Play sound effect"
                    >
                      {playing === `sound-${currentWordIndex}` ? <Loader2 size={16} className="animate-spin" /> : <Volume size={16} />}
                      Sound
                    </button>
                  )}

                  {/* English TTS */}
                  <button
                    onClick={() => handleSpeak(w.en, 'en', `en-${currentWordIndex}`)}
                    disabled={!!playing}
                    className="flex-1 flex items-center justify-center gap-1.5 py-4 rounded-xl bg-slate-100
                               text-slate-600 font-semibold hover:bg-slate-200 transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    title="English pronunciation"
                  >
                    {isPlayingEN ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                    EN
                  </button>

                  {/* Target language TTS — shown for KN and TUL */}
                  {langCode !== 'en' && (
                    <button
                      onClick={() => handleSpeak(displayWord, langMeta.ttsLang, `lang-${currentWordIndex}`)}
                      disabled={!!playing}
                      className="flex-1 flex items-center justify-center gap-1.5 py-4 rounded-xl bg-indigo-100
                                 text-indigo-700 font-semibold hover:bg-indigo-200 transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                      title={`${langMeta.label} pronunciation`}
                    >
                      {playing === `lang-${currentWordIndex}` ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                      {langMeta.label.slice(0,3).toUpperCase()}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

            {/* Right Arrow Button */}
            <button
              onClick={nextWord}
              disabled={currentWordIndex === words.length - 1}
              className="flex-shrink-0 w-16 h-16 rounded-full bg-indigo-500 border-2 border-indigo-500
                         text-white font-semibold hover:bg-indigo-600 hover:border-indigo-600 transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-500 disabled:hover:border-indigo-500
                         flex items-center justify-center text-3xl shadow-lg"
            >
              →
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-slate-400 py-12">No words available in this category</p>
      )}
    </DashboardLayout>
  );
};

export default LanguageLearning;
