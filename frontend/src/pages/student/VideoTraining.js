import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings, Zap, Maximize, Minimize } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const TRAINING_VIDEOS = [
    {
    id: 1,
    title: 'Sight Words - Common Words',
    category: 'Reading',
    level: 'Beginner',
    cloudinary_url: 'https://res.cloudinary.com/dtvodpygh/video/upload/v1773337299/YTDown.com_YouTube_How-to-Pronounce-ALL-ENGLISH-Sounds-Amer_Media_tpN9CPwZ-oE_002_720p_lcr9q9.mp4',
    thumbnail: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/sight-words.jpg',
    description: 'Master 50 most common sight words.',
    duration: 600,
  },
    {
    id: 2,
    title: 'Phonics Blending',
    category: 'Phonics',
    level: 'Intermediate',
    cloudinary_url: 'https://res.cloudinary.com/dtvodpygh/video/upload/v1773334218/WhatsApp_Video_2026-03-12_at_10.11.00_PM_ileiec.mp4',
    thumbnail: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/phonics-blend.jpg',
    description: 'This video shows exercises that improve eye movement and visual tracking while reading. Dyslexic students often struggle to follow words on a line, so these exercises help them track letters and words more accurately and improve reading fluency.',
    duration: 450,
  },
  {
    id: 3,
    title: 'Letter Recognition - A to M',
    category: 'Letter Recognition',
    level: 'Beginner',
    cloudinary_url: 'https://res.cloudinary.com/dtvodpygh/video/upload/v1773334104/WhatsApp_Video_2026-03-12_at_10.08.03_PM_erhfia.mp4',
    thumbnail: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/letter-recognition.jpg',
    description: ' BUILD SOUNDS WITH CONSONANT TEAMS IN FRONT OF VOWELS AND  BEHIND VOWELS (CREATING WELDED SOUNDS OR WORD FAMILIES) USING MAGNETIC ALPHABET LETTERS.   ',
    duration: 300,
  },            
  {
    id: 4,
    title: 'Spelling Practice',
    category: 'Spelling',
    level: 'Beginner',
    cloudinary_url: 'https://res.cloudinary.com/dtvodpygh/video/upload/v1773369186/dc2m1fpzjjdlgypnoprj.mp4',
    thumbnail: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/spelling.jpg',
    description: ' Spelll SOUNDS WITH CONSONANT TEAMS IN FRONT OF VOWELS AND  BEHIND VOWELS (CREATING WELDED SOUNDS OR WORD FAMILIES) USING MAGNETIC ALPHABET LETTERS.   ',
    duration: 300,
  },            
  
];

const VideoTraining = () => {
  const [selectedVideo, setSelectedVideo] = useState(TRAINING_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);

  // Set initial volume and fullscreen listener
  useEffect(() => {
    // Set initial volume on video element
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }

    // Add fullscreen change listener
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [volume]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      videoRef.current.currentTime = parseFloat(e.target.value);
      setCurrentTime(parseFloat(e.target.value));
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    if (vol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handlePlaybackSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <DashboardLayout>
      {!isFullscreen && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <span className="inline-flex w-10 h-10 rounded-xl bg-purple-100 text-purple-600 items-center justify-center">
              <Play size={20} />
            </span>
            Video Training
          </h1>
          <p className="text-slate-600 text-base">
            Watch specialized video lessons designed to help with reading and dyslexia support.
          </p>
        </div>
      )}

      <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
        {/* Main Video Player */}
        <div className={isFullscreen ? '' : 'lg:col-span-3 space-y-4'}>
          {/* Video Player Container */}
          <div 
            ref={playerContainerRef}
            className={`relative bg-black overflow-hidden shadow-2xl w-full ${
              isFullscreen ? 'h-screen' : 'rounded-2xl'
            }`}
            style={!isFullscreen ? { aspectRatio: '16/9' } : undefined}
          >
            <video
              ref={videoRef}
              src={selectedVideo.cloudinary_url}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full object-cover"
            />

            {/* Play Button Overlay */}
            {!isPlaying && (
              <button
                onClick={handlePlayPause}
                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition group cursor-pointer z-10"
              >
                <div className="w-28 h-28 bg-purple-600/90 rounded-full flex items-center justify-center group-hover:bg-purple-700 transition shadow-2xl">
                  <Play size={56} className="text-white ml-2" fill="white" />
                </div>
              </button>
            )}

            {/* Bottom Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-10 pb-4 px-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-slate-700 rounded-full cursor-pointer accent-purple-500 hover:h-3 transition-all"
                />
                <div className="flex justify-between text-white text-xs mt-2 font-semibold">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons Row */}
              <div className="flex items-center justify-between gap-3">
                {/* Play/Pause Button */}
                <button
                  onClick={handlePlayPause}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition shadow-lg flex-shrink-0"
                  title="Play/Pause"
                >
                  {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
                </button>

                {/* Center Info */}
                <div className="text-white text-center flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{selectedVideo.title}</p>
                </div>

                {/* Right Controls */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={toggleMute}
                    className="bg-slate-700/80 hover:bg-slate-600 text-white p-2.5 rounded-full transition shadow-lg"
                    title="Mute/Unmute"
                  >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="bg-slate-700/80 hover:bg-slate-600 text-white p-2.5 rounded-full transition shadow-lg"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                  </button>

                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`text-white p-2.5 rounded-full transition shadow-lg font-bold ${
                      showSettings
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700/80 hover:bg-slate-600'
                    }`}
                    title="Settings"
                  >
                    <Settings size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Playlist Sidebar - Hidden in fullscreen */}
        {!isFullscreen && (
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-3xl p-6 sticky top-4 shadow-2xl max-h-screen overflow-y-auto">
              <h3 className="font-bold text-white mb-6 text-xl flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Play size={20} className="text-white" />
                </div>
                Video Playlist
              </h3>
              <div className="space-y-3">
                {TRAINING_VIDEOS.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => {
                      setSelectedVideo(video);
                      setCurrentTime(0);
                      setIsPlaying(false);
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                      selectedVideo.id === video.id
                        ? 'bg-white text-slate-900 shadow-xl ring-2 ring-white scale-105'
                        : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${
                        selectedVideo.id === video.id
                          ? 'text-purple-600'
                          : 'text-white/60'
                      }`}>
                        <Play size={16} fill="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm leading-tight mb-1">{video.title}</p>
                        <p className={`text-xs ${
                          selectedVideo.id === video.id
                            ? 'text-slate-600'
                            : 'text-white/70'
                        }`}>
                          {video.category}
                        </p>
                        <div className="flex gap-2 mt-2 text-xs">
                          <span className={`px-2 py-1 rounded-full ${
                            selectedVideo.id === video.id
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-white/10 text-white/80'
                          }`}>
                            {video.level}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${
                            selectedVideo.id === video.id
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-white/10 text-white/80'
                          }`}>
                            {formatTime(video.duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Information - Hidden in fullscreen */}
      {!isFullscreen && (
        <div className="mt-8">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-8 rounded-3xl shadow-2xl text-white">
            <div className="flex items-start gap-6">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <Play size={48} className="text-white" fill="white" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-3">{selectedVideo.title}</h3>
                <p className="text-purple-100 text-lg leading-relaxed mb-4">{selectedVideo.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    📚 {selectedVideo.category}
                  </span>
                  <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    🎯 {selectedVideo.level}
                  </span>
                  <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    ⏱️ {formatTime(selectedVideo.duration)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Simplified Settings Panel - Only Speed and Volume */}
          {showSettings && (
            <div className="mt-6 bg-white p-6 rounded-2xl border-2 border-purple-200 shadow-lg">
              <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Settings size={24} className="text-purple-600" />
                Playback Settings
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Playback Speed */}
                <div className="space-y-3">
                  <label className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <Zap size={20} className="text-purple-600" />
                    Playback Speed
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[0.5, 0.75, 1, 1.25, 1.5].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handlePlaybackSpeed(speed)}
                        className={`px-4 py-2 rounded-lg font-bold transition shadow-md ${
                          playbackSpeed === speed
                            ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume Control */}
                <div className="space-y-3">
                  <label className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <Volume2 size={20} className="text-purple-600" />
                    Volume
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-3 accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default VideoTraining;
