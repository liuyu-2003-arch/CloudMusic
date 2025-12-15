import React, { useEffect, useRef, useState } from 'react';
import { Song } from '../types';
import { Play, Pause, SkipBack, SkipForward, Volume2, ListMusic, Repeat, Shuffle } from 'lucide-react';

interface PlayerProps {
  currentSong: Song | null;
  onNext?: () => void;
  onPrev?: () => void;
}

const Player: React.FC<PlayerProps> = ({ currentSong, onNext, onPrev }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      if (currentSong.audioUrl) {
          audioRef.current.src = currentSong.audioUrl;
          audioRef.current.play().then(() => setIsPlaying(true)).catch(e => {
            console.error("Auto-play failed:", e);
            setIsPlaying(false);
          });
      } else {
        // Mock playing if no URL
        setIsPlaying(true);
        setDuration(180); // Mock 3 mins
      }
    }
  }, [currentSong]);

  useEffect(() => {
     if(audioRef.current) {
         audioRef.current.volume = volume;
     }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current || !currentSong?.audioUrl) {
        setIsPlaying(!isPlaying); // Mock toggle
        return;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      if (total) {
          setDuration(total);
          setProgress((current / total) * 100);
      }
    }
  };

  // Mock progress interval for songs without audioUrl
  useEffect(() => {
      let interval: any;
      if (isPlaying && (!currentSong?.audioUrl) && currentSong) {
          interval = setInterval(() => {
              setProgress(p => (p >= 100 ? 0 : p + 0.5));
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [isPlaying, currentSong]);


  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong) return null;

  return (
    <div className="h-[88px] bg-white/95 backdrop-blur-xl border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50 flex items-center px-6 shadow-lg">
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Track Info */}
      <div className="flex items-center w-1/4 min-w-[200px]">
        <div className="h-12 w-12 rounded-md overflow-hidden shadow-sm bg-gray-200 mr-4 relative group">
           <img src={currentSong.coverUrl} alt="Cover" className="h-full w-full object-cover" />
           <div className="absolute inset-0 bg-black/10 hidden group-hover:block" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{currentSong.title}</h4>
          <p className="text-xs text-gray-500 truncate">{currentSong.artist}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto">
        <div className="flex items-center space-x-6 mb-1">
          <button className="text-gray-400 hover:text-apple-accent transition-colors"><Shuffle size={18} /></button>
          <button onClick={onPrev} className="text-gray-800 hover:scale-105 transition-transform"><SkipBack size={24} fill="currentColor" /></button>
          <button 
            onClick={togglePlay} 
            className="h-9 w-9 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-full flex items-center justify-center transition-all shadow-sm hover:scale-105"
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
          <button onClick={onNext} className="text-gray-800 hover:scale-105 transition-transform"><SkipForward size={24} fill="currentColor" /></button>
          <button className="text-gray-400 hover:text-apple-accent transition-colors"><Repeat size={18} /></button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full flex items-center space-x-3 group">
          <span className="text-[10px] text-gray-500 font-medium tabular-nums w-8 text-right">
             {audioRef.current ? formatTime(audioRef.current.currentTime) : formatTime((progress / 100) * duration)}
          </span>
          <div className="flex-1 h-1 bg-gray-300 rounded-full relative cursor-pointer overflow-hidden">
            <div 
                className="h-full bg-apple-gray rounded-full absolute top-0 left-0 group-hover:bg-apple-accent transition-colors" 
                style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-500 font-medium tabular-nums w-8">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume & Extras */}
      <div className="w-1/4 flex items-center justify-end space-x-4">
        <button className="text-gray-500 hover:text-apple-accent">
            {currentSong.lyricsUrl ? <span className="text-[10px] border border-current px-1 rounded font-bold">LYRICS</span> : <ListMusic size={18} />}
        </button>
        <div className="flex items-center space-x-2 w-24 group">
            <Volume2 size={18} className="text-gray-500" />
            <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100"
            />
        </div>
      </div>
    </div>
  );
};

export default Player;