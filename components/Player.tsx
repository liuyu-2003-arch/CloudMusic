import React, { useEffect, useRef, useState } from 'react';
import { Song } from '../types';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';
import LyricsView from './LyricsView';

interface PlayerProps {
  currentSong: Song | null;
  onNext?: () => void;
  onPrev?: () => void;
  isLiked?: boolean;
  onLikeToggle?: () => void;
  isLyricsOpen: boolean;
  onSetLyricsOpen: (open: boolean) => void;
}

const Player: React.FC<PlayerProps> = ({ 
  currentSong, onNext, onPrev, isLiked, onLikeToggle,
  isLyricsOpen, onSetLyricsOpen
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      if (currentSong.audioUrl) {
          audioRef.current.src = currentSong.audioUrl;
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(true);
        setDuration(180);
      }
    }
  }, [currentSong]);

  const togglePlay = () => {
    if (!audioRef.current || !currentSong?.audioUrl) {
        setIsPlaying(!isPlaying);
        return;
    }
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      setDuration(audioRef.current.duration);
    }
  };

  if (!currentSong) return null;

  return (
    <>
      <div className={`h-[88px] bg-white/95 backdrop-blur-2xl border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50 flex items-center px-4 md:px-6 shadow-lg transition-transform duration-500 ${isLyricsOpen ? 'translate-y-full' : 'translate-y-0'}`}>
        <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={() => setIsPlaying(false)} />
        
        {/* Track Info & Cover - 点击展开 */}
        <div 
          onClick={() => onSetLyricsOpen(true)}
          className="flex items-center flex-1 md:w-1/4 min-w-0 group cursor-pointer active:scale-95 transition-transform duration-200"
        >
          <div className="h-12 w-12 rounded-lg overflow-hidden shadow-sm bg-gray-200 mr-3 flex-shrink-0 relative">
             <img src={currentSong.coverUrl} alt="Cover" className="h-full w-full object-cover" />
             <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 size={16} className="text-white" />
             </div>
          </div>
          <div className="flex flex-col overflow-hidden min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{currentSong.title}</h4>
            <p className="text-xs text-gray-500 truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center justify-center flex-1 max-w-xl">
          <div className="flex items-center space-x-6">
            <button onClick={onPrev} className="text-gray-800 active:scale-90 transition-transform"><SkipBack size={22} fill="currentColor" /></button>
            <button onClick={togglePlay} className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center active:scale-90 transition-transform">
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>
            <button onClick={onNext} className="text-gray-800 active:scale-90 transition-transform"><SkipForward size={22} fill="currentColor" /></button>
          </div>
          <div className="w-full mt-2 hidden md:flex items-center space-x-3">
            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-apple-accent" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Lyrics Toggle Button */}
        <div className="flex items-center justify-end md:w-1/4">
          <button 
            onClick={() => onSetLyricsOpen(true)}
            className="text-[10px] border border-gray-300 px-2 py-1 rounded font-bold hover:bg-gray-50 active:scale-95 transition-all"
          >
            LYRICS
          </button>
        </div>
      </div>

      {isLyricsOpen && (
        <LyricsView 
          song={currentSong}
          currentTime={audioRef.current?.currentTime || 0}
          duration={duration || 180}
          isPlaying={isPlaying}
          onPlayPause={togglePlay}
          onNext={() => onNext?.()}
          onPrev={() => onPrev?.()}
          volume={volume}
          onVolumeChange={setVolume}
          onClose={() => onSetLyricsOpen(false)}
          onSeek={(t) => audioRef.current && (audioRef.current.currentTime = t)}
          isLiked={isLiked}
          onLikeToggle={onLikeToggle}
        />
      )}
    </>
  );
};

export default Player;