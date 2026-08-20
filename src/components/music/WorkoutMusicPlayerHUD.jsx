import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Music, Radio, ExternalLink, Zap, Flame, Disc, X, ChevronUp, ChevronDown
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';

const WORKOUT_TRACKS = [
  {
    id: 'spotify-workout',
    title: 'Workout Beats Active',
    artist: 'Background Audio Stream',
    bpm: 142,
    genre: 'Energy Gym',
    src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=aggressive-drift-phonk-112349.mp3',
  },
  {
    id: 'phonk-1',
    title: 'Immortal Heavy Drive',
    artist: 'Calyxo Phonk',
    bpm: 145,
    genre: 'Heavy Phonk',
    src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=aggressive-drift-phonk-112349.mp3',
  },
  {
    id: 'edm-1',
    title: 'Neon Power Surge',
    artist: 'Calyxo EDM Core',
    bpm: 138,
    genre: 'High BPM EDM',
    src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=electronic-future-beats-117997.mp3',
  }
];

export default function WorkoutMusicPlayerHUD({ onNotification }) {
  const [isDevicePlaying, setIsDevicePlaying] = useState(false);
  const [isInAppPlaying, setIsInAppPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  const currentTrack = WORKOUT_TRACKS[currentTrackIndex];

  // 1. Device Background Audio Detection Loop (iOS & Android)
  useEffect(() => {
    let isMounted = true;

    const checkDeviceMusic = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const { CalyxoWidget } = Capacitor.Plugins;
          if (CalyxoWidget && CalyxoWidget.isMusicPlaying) {
            const res = await CalyxoWidget.isMusicPlaying();
            if (isMounted) {
              if (res && res.isPlaying) {
                setIsDevicePlaying(true);
                setIsDismissed(false);
              } else if (!isInAppPlaying) {
                setIsDevicePlaying(false);
              }
            }
          }
        } catch (e) {
          // Native call fallback
        }
      }
    };

    checkDeviceMusic();
    const interval = setInterval(checkDeviceMusic, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isInAppPlaying]);

  // 2. Setup Web Media Session for background control
  useEffect(() => {
    const audio = new Audio();
    audio.src = currentTrack.src;
    audio.volume = volume;
    audioRef.current = audio;

    const handleEnded = () => handleNext();
    audio.addEventListener('ended', handleEnded);

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: 'Calyxo Workout Beats',
        artwork: [{ src: '/icon.png', sizes: '512x512', type: 'image/png' }]
      });

      navigator.mediaSession.setActionHandler('play', () => handlePlay());
      navigator.mediaSession.setActionHandler('pause', () => handlePause());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
    }

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  const handlePlay = async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setIsInAppPlaying(true);
      setIsDevicePlaying(true);
      setIsDismissed(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    } catch (e) {
      console.warn('Playback error:', e);
    }
  };

  const handlePause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsInAppPlaying(false);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  };

  const togglePlay = () => {
    if (isInAppPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleNext = () => {
    const nextIdx = (currentTrackIndex + 1) % WORKOUT_TRACKS.length;
    setCurrentTrackIndex(nextIdx);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = WORKOUT_TRACKS[nextIdx].src;
        audioRef.current.play().then(() => setIsInAppPlaying(true)).catch(() => {});
      }
    }, 100);
  };

  const handlePrev = () => {
    const prevIdx = (currentTrackIndex - 1 + WORKOUT_TRACKS.length) % WORKOUT_TRACKS.length;
    setCurrentTrackIndex(prevIdx);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = WORKOUT_TRACKS[prevIdx].src;
        audioRef.current.play().then(() => setIsInAppPlaying(true)).catch(() => {});
      }
    }, 100);
  };

  const isAudioActive = (isDevicePlaying || isInAppPlaying) && !isDismissed;

  // If no audio is detected and user hasn't started in-app music, show small discrete trigger icon
  if (!isAudioActive) {
    return (
      <div className="fixed bottom-24 right-5 z-[9970]">
        <button
          onClick={() => {
            setIsDismissed(false);
            setIsDevicePlaying(true);
            handlePlay();
          }}
          aria-label="Open Workout Beats"
          className="w-10 h-10 rounded-full bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-400 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_24px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer"
        >
          <Music className="w-4 h-4 animate-pulse" />
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[9980] w-[calc(100%-2rem)] max-w-md select-none"
      >
        {/* Floating Spotify-Style Pill */}
        <div className="relative p-[1.5px] rounded-2xl overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(16,185,129,0.35)]">
          {/* Subtle animated border runner */}
          <div className="absolute inset-[-100%] animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_300deg,#10B981_340deg,#00F0FF_360deg)]" />

          <div className="relative bg-[#09090C]/95 text-white rounded-2xl border border-white/10 backdrop-blur-2xl p-3">
            {/* Top Compact Bar */}
            <div className="flex items-center justify-between gap-2.5">
              {/* Spinning Disc / Brand Icon */}
              <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Disc className={`w-4 h-4 ${isInAppPlaying || isDevicePlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">
                      {isDevicePlaying && !isInAppPlaying ? '🎧 SPOTIFY / BACKGROUND ACTIVE' : '⚡ WORKOUT BEATS'}
                    </span>
                  </div>
                  <span className="text-xs font-black text-white truncate block leading-tight mt-1 font-sans">
                    {isInAppPlaying ? currentTrack.title : 'Device Music Playing'}
                  </span>
                </div>
              </div>

              {/* Compact Quick Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handlePrev}
                  aria-label="Previous Track"
                  className="p-1.5 rounded-lg text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 active:scale-95 transition-all cursor-pointer border-none"
                >
                  <SkipBack className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  onClick={togglePlay}
                  aria-label={isInAppPlaying ? "Pause" : "Play"}
                  className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_2px_12px_rgba(16,185,129,0.5)] active:scale-90 transition-all cursor-pointer border-none"
                >
                  {isInAppPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  aria-label="Next Track"
                  className="p-1.5 rounded-lg text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 active:scale-95 transition-all cursor-pointer border-none"
                >
                  <SkipForward className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-label="Toggle Expand"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-transparent transition-all cursor-pointer border-none"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setIsDismissed(true)}
                  aria-label="Dismiss Player"
                  className="p-1 rounded-full text-gray-500 hover:text-gray-300 bg-transparent transition-all cursor-pointer border-none ml-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expanded Detailed Tray (When Tapped) */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 mt-2.5 border-t border-white/10 space-y-2.5"
              >
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span>Track: <strong className="text-white">{currentTrack.title}</strong></span>
                  <span className="text-emerald-400 font-mono font-bold">⚡ {currentTrack.bpm} BPM</span>
                </div>

                {/* Quick App Launchers */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => window.open('https://open.spotify.com/genre/workout-page', '_blank')}
                    className="py-1.5 px-2 rounded-xl bg-[#1DB954]/15 hover:bg-[#1DB954]/25 border border-[#1DB954]/40 text-[#1DB954] text-[10px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <Music className="w-3 h-3" /> Spotify
                  </button>

                  <button
                    onClick={() => window.open('https://music.apple.com/browse/curators/apple-music-fitness', '_blank')}
                    className="py-1.5 px-2 rounded-xl bg-[#FC3C44]/15 hover:bg-[#FC3C44]/25 border border-[#FC3C44]/40 text-[#FC3C44] text-[10px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <Radio className="w-3 h-3" /> Apple Music
                  </button>

                  <button
                    onClick={() => window.open('https://music.youtube.com/search?q=workout+music', '_blank')}
                    className="py-1.5 px-2 rounded-xl bg-[#FF0000]/15 hover:bg-[#FF0000]/25 border border-[#FF0000]/40 text-[#FF0000] text-[10px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <Zap className="w-3 h-3" /> YouTube
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
