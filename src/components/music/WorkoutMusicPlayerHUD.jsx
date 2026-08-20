import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Music, Radio, ExternalLink, Zap, Flame, Disc, Sliders
} from 'lucide-react';

const WORKOUT_TRACKS = [
  {
    id: 'phonk-1',
    title: 'Immortal Heavy Drive',
    artist: 'Calyxo Phonk Beats',
    bpm: 145,
    genre: 'Phonk / Heavy',
    src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=aggressive-drift-phonk-112349.mp3',
    duration: '02:18'
  },
  {
    id: 'edm-1',
    title: 'Neon Power Surge',
    artist: 'Calyxo EDM Core',
    bpm: 138,
    genre: 'EDM / High BPM',
    src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=electronic-future-beats-117997.mp3',
    duration: '02:45'
  },
  {
    id: 'synth-1',
    title: 'Cyberpunk Hypertrophy',
    artist: 'Synthwave Gym',
    bpm: 128,
    genre: 'Synthwave',
    src: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=cyberpunk-2099-10701.mp3',
    duration: '02:30'
  },
  {
    id: 'lofi-1',
    title: 'Deep Recovery Pace',
    artist: 'Calyxo Chill Zone',
    bpm: 90,
    genre: 'Lofi / Stretch',
    src: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=lofi-study-112191.mp3',
    duration: '02:12'
  }
];

export default function WorkoutMusicPlayerHUD({ onNotification }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('player'); // 'player' | 'apps'

  const audioRef = useRef(null);
  const currentTrack = WORKOUT_TRACKS[currentTrackIndex];

  // Setup HTML5 Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.src = currentTrack.src;
    audio.volume = volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => handleNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    // Setup Web Media Session API for iOS Control Center & Android Lock Screen
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: 'Calyxo Workout Beats',
        artwork: [
          { src: '/icon.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => handlePlay());
      navigator.mediaSession.setActionHandler('pause', () => handlePause());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
      navigator.mediaSession.setActionHandler('seekbackward', () => handleSeek(-15));
      navigator.mediaSession.setActionHandler('seekforward', () => handleSeek(15));
    }

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  const handlePlay = async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    } catch (err) {
      console.warn('[Calyxo-Music] Audio play error:', err);
    }
  };

  const handlePause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleNext = () => {
    const nextIdx = (currentTrackIndex + 1) % WORKOUT_TRACKS.length;
    setCurrentTrackIndex(nextIdx);
    setCurrentTime(0);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = WORKOUT_TRACKS[nextIdx].src;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 100);
  };

  const handlePrev = () => {
    const prevIdx = (currentTrackIndex - 1 + WORKOUT_TRACKS.length) % WORKOUT_TRACKS.length;
    setCurrentTrackIndex(prevIdx);
    setCurrentTime(0);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = WORKOUT_TRACKS[prevIdx].src;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 100);
  };

  const handleSeek = (delta) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + delta));
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      if (audioRef.current) audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      if (audioRef.current) audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Launch external music app
  const openExternalMusic = (platform) => {
    if (onNotification) onNotification(`Launching ${platform} workout playlist... 🎧`);
    let url = '';
    if (platform === 'Spotify') {
      url = 'https://open.spotify.com/genre/workout-page';
    } else if (platform === 'Apple Music') {
      url = 'https://music.apple.com/browse/curators/apple-music-fitness';
    } else if (platform === 'YouTube Music') {
      url = 'https://music.youtube.com/search?q=workout+music';
    }
    window.open(url, '_blank');
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? `0${s}` : s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="glass p-4 sm:p-5 rounded-2xl border border-[var(--card-border)] shadow-lg relative overflow-hidden bg-gradient-to-br from-surface/90 to-surface/50">
      {/* Ambient background glow when playing */}
      {isPlaying && (
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
            isPlaying 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
              : 'bg-white/5 text-gray-400 border-white/10'
          }`}>
            <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xs font-black text-foreground uppercase tracking-wider">Workout Beats HUD</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase">
                {currentTrack.genre}
              </span>
            </div>
            <span className="text-[10px] text-muted font-bold block mt-0.5">
              ⚡ {currentTrack.bpm} BPM Pace • In-App & Background
            </span>
          </div>
        </div>

        {/* Tab Switcher (Embedded Player / App Links) */}
        <div className="flex bg-surface rounded-lg p-0.5 border border-card-border">
          <button
            onClick={() => setActiveTab('player')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase cursor-pointer transition-all border-none ${
              activeTab === 'player'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-muted hover:text-foreground bg-transparent'
            }`}
          >
            Player
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase cursor-pointer transition-all border-none ${
              activeTab === 'apps'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-muted hover:text-foreground bg-transparent'
            }`}
          >
            Apps
          </button>
        </div>
      </div>

      {activeTab === 'player' ? (
        <div className="space-y-3 relative z-10">
          {/* Current Track Display */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface/80 border border-card-border">
            <div className="truncate pr-2">
              <div className="text-xs font-black text-foreground truncate">{currentTrack.title}</div>
              <div className="text-[10px] text-muted font-medium truncate mt-0.5">{currentTrack.artist}</div>
            </div>

            {/* Dynamic Soundwave Equalizer Bars */}
            <div className="flex items-end gap-1 h-5 shrink-0 px-1">
              {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlaying ? 'bg-emerald-400' : 'bg-gray-600'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(20, Math.random() * 100)}%` : `${h * 40}%`,
                    transitionDelay: `${i * 80}ms`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Progress Slider */}
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden relative cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                if (audioRef.current) {
                  audioRef.current.currentTime = pos * duration;
                }
              }}
            >
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-muted font-bold">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Player Media Controls */}
          <div className="flex items-center justify-between pt-1">
            {/* Volume Control */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="text-muted hover:text-foreground cursor-pointer bg-transparent border-none p-1"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
                className="w-14 h-1 accent-emerald-400 bg-surface rounded-lg cursor-pointer"
              />
            </div>

            {/* Playback Transport Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Track"
                className="p-2 rounded-xl bg-surface hover:bg-surface/80 border border-card-border text-foreground hover:text-emerald-400 active:scale-95 transition-all cursor-pointer"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_4px_16px_rgba(16,185,129,0.4)] active:scale-90 transition-all cursor-pointer border-none"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={handleNext}
                aria-label="Next Track"
                className="p-2 rounded-xl bg-surface hover:bg-surface/80 border border-card-border text-foreground hover:text-emerald-400 active:scale-95 transition-all cursor-pointer"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Quick 15s Rewind / Skip */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSeek(-15)}
                aria-label="Rewind 15s"
                className="text-[9px] font-mono font-bold px-2 py-1 rounded-lg bg-surface border border-card-border text-muted hover:text-foreground cursor-pointer"
              >
                -15s
              </button>
              <button
                onClick={() => handleSeek(15)}
                aria-label="Forward 15s"
                className="text-[9px] font-mono font-bold px-2 py-1 rounded-lg bg-surface border border-card-border text-muted hover:text-foreground cursor-pointer"
              >
                +15s
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* External Music Apps Quick-Launcher */
        <div className="space-y-2 relative z-10 pt-1">
          <p className="text-[11px] text-muted leading-relaxed">
            Listen on your favorite streaming service in background. Control playback via headphones, lock screen, or Calyxo HUD:
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => openExternalMusic('Spotify')}
              className="p-2.5 rounded-xl bg-[#1DB954]/10 hover:bg-[#1DB954]/20 border border-[#1DB954]/30 text-[#1DB954] text-[11px] font-black uppercase flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Music className="w-4 h-4" />
              <span>Spotify</span>
            </button>

            <button
              onClick={() => openExternalMusic('Apple Music')}
              className="p-2.5 rounded-xl bg-[#FC3C44]/10 hover:bg-[#FC3C44]/20 border border-[#FC3C44]/30 text-[#FC3C44] text-[11px] font-black uppercase flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Radio className="w-4 h-4" />
              <span>Apple</span>
            </button>

            <button
              onClick={() => openExternalMusic('YouTube Music')}
              className="p-2.5 rounded-xl bg-[#FF0000]/10 hover:bg-[#FF0000]/20 border border-[#FF0000]/30 text-[#FF0000] text-[11px] font-black uppercase flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>YouTube</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
