import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import useTTS from '../../hooks/useTTS';

/**
 * ReadAloudButton — shows only when TTS is enabled in accessibility settings.
 * Usage: <ReadAloudButton text="The text you want spoken aloud" />
 */
const ReadAloudButton = ({ text, className = '' }) => {
  const { settings }  = useAccessibility();
  const tts           = useTTS(settings.ttsLang, settings.ttsSpeed);

  if (!settings.ttsEnabled) return null;

  const handleClick = () => {
    if (tts.isSpeaking) tts.stop();
    else tts.speak(text);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  transition-all ${
        tts.isSpeaking
          ? 'bg-red-100 text-red-600 border border-red-200 hover:bg-red-200'
          : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
      } ${className}`}
      title={tts.isSpeaking ? 'Stop' : 'Read Aloud'}
    >
      {tts.isSpeaking
        ? <><VolumeX size={13} /> Stop</>
        : <><Volume2 size={13} /> Read Aloud</>
      }
    </button>
  );
};

export default ReadAloudButton;
