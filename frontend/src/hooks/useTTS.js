import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useTTS — wraps the browser SpeechSynthesis API
 * @param {string} lang  - BCP-47 language tag, e.g. 'en-IN', 'hi-IN'
 * @param {number} rate  - speech rate, 0.5–2.0
 */
const useTTS = (lang = 'en-IN', rate = 1.0) => {
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [wordStart,  setWordStart]    = useState(-1);
  const [wordLength, setWordLength]   = useState(0);
  const utteranceRef = useRef(null);

  // Cancel on unmount
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang   = lang;
    utterance.rate   = rate;
    utterance.pitch  = 1;
    utterance.volume = 1;

    utterance.onstart    = ()  => setIsSpeaking(true);
    utterance.onend      = ()  => { setIsSpeaking(false); setWordStart(-1); };
    utterance.onerror    = ()  => { setIsSpeaking(false); setWordStart(-1); };
    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        setWordStart(e.charIndex);
        setWordLength(e.charLength || 0);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [lang, rate]);

  const stop   = useCallback(() => { window.speechSynthesis?.cancel(); setIsSpeaking(false); setWordStart(-1); }, []);
  const pause  = useCallback(() => window.speechSynthesis?.pause(), []);
  const resume = useCallback(() => window.speechSynthesis?.resume(), []);

  return { speak, stop, pause, resume, isSpeaking, wordStart, wordLength };
};

export default useTTS;
