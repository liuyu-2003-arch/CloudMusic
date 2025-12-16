import React, { useEffect, useRef, useState } from 'react';
import { Song } from '../types';
import { ChevronDown, SkipBack, SkipForward, Play, Pause, Volume2, Heart } from 'lucide-react';

interface LyricsViewProps {
  song: Song;
  currentTime: number;
  duration: number;
  onClose: () => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  onSeek: (val: number) => void;
}

// Simulated lyrics generation for demo purposes
const getLyrics = (song: Song) => {
  // If we had real lyrics, we'd parse them here.
  // For the demo, we create a structure based on description or generic text
  const baseLyrics = [
    "Verse 1",
    `Listening to ${song.title}`,
    `By the amazing ${song.artist}`,
    "In the silence of the night",
    "Music takes a flight",
    " ",
    "Chorus",
    "Feel the rhythm, feel the beat",
    "Moving fast beneath your feet",
    "Colors swirling in the mind",
    "Leave the worries all behind",
    " ",
    "Verse 2",
    "Every note a story told",
    "Memories of days of old",
    "Melodies that softly play",
    "Guiding us along the way",
    " ",
    "Bridge",
    "Rise above the noise",
    "Find your inner voice",
    " ",
    "Chorus",
    "Feel the rhythm, feel the beat",
    "Moving fast beneath your feet",
    "End"
  ];
  return baseLyrics;
};

const LyricsView: React.FC<LyricsViewProps> = ({ 
  song, currentTime, duration, onClose, isPlaying, 
  onPlayPause, onNext, onPrev, volume, onVolumeChange, onSeek
}) => {
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setLyrics(getLyrics(song));
  }, [song]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
        onClose();
    }, 300); // Matches duration-300
  };
  
  // Calculate active line based on simple time division for demo
  const activeLineIndex = Math.floor((currentTime / (duration || 1)) * lyrics.length);

  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.children[activeLineIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLineIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={`fixed inset-0 z-[60] flex flex-col bg-gray-900 text-white overflow-hidden ${isClosing ? 'animate-out slide-out-to-bottom fade-out' : 'animate-in slide-in-from-bottom fade-in'} duration-300`}>
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={song.coverUrl} 
          alt="Background" 
          className="w-full h-full object-cover blur-3xl opacity-40 scale-150 transform" 
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 md:px-8 shrink-0">
         <button onClick={handleClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-colors">
            <ChevronDown size={24} />
         </button>
         <div className="flex flex-col items-center opacity-80">
             <span className="text-xs font-semibold uppercase tracking-widest text-white/60">Playing from Library</span>
             <span className="text-sm font-bold truncate max-w-[200px]">{song.album}</span>
         </div>
         <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-colors ${isLiked ? 'text-red-500' : 'text-white'}`}
         >
            <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
         </button>
      </div>

      {/* Main Content (Lyrics Only) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-8 pb-4 overflow-hidden">
        
        {/* Lyrics Area */}
        <div 
            className="w-full max-w-2xl flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']" 
            style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}
            ref={scrollRef}
        >
            <div className="space-y-8 text-center py-[50vh]">
                {lyrics.map((line, idx) => (
                    <p 
                      key={idx} 
                      className={`text-2xl md:text-4xl font-bold transition-all duration-500 cursor-pointer leading-tight ${
                          idx === activeLineIndex 
                            ? 'text-white scale-100 blur-none opacity-100' 
                            : 'text-white/30 scale-95 blur-[0.5px] hover:text-white/60 hover:opacity-80'
                      }`}
                      onClick={() => {
                          const newTime = (idx / lyrics.length) * duration;
                          onSeek(newTime);
                      }}
                    >
                        {line}
                    </p>
                ))}
            </div>
        </div>
      </div>

      {/* Bottom Controls (Compact) */}
      <div className="relative z-20 w-full bg-black/20 backdrop-blur-xl border-t border-white/5 pb-8 pt-4 px-6 md:px-12 shrink-0">
          <div className="max-w-5xl mx-auto flex flex-col gap-3">
              
              {/* Progress Bar */}
              <div className="group flex items-center space-x-3 w-full">
                  <span className="text-xs font-medium text-white/50 w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
                  <div className="flex-1 h-1 bg-white/20 rounded-full relative cursor-pointer group-hover:h-1.5 transition-all">
                      <div 
                        className="absolute top-0 left-0 h-full bg-white/90 rounded-full" 
                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} 
                      />
                      <input 
                        type="range" 
                        min={0} 
                        max={duration || 100} 
                        value={currentTime} 
                        onChange={(e) => onSeek(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      />
                  </div>
                  <span className="text-xs font-medium text-white/50 w-8 tabular-nums">{formatTime(duration)}</span>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between mt-1">
                  
                  {/* Left: Song Info + Cover Art */}
                  <div className="flex items-center w-[30%] gap-4 overflow-hidden">
                      <div className="h-12 w-12 md:h-14 md:w-14 rounded-lg shadow-lg overflow-hidden flex-shrink-0 bg-gray-800">
                          <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col overflow-hidden justify-center">
                          <h2 className="text-base md:text-lg font-bold text-white truncate">{song.title}</h2>
                          <h3 className="text-xs md:text-sm text-white/60 truncate">{song.artist}</h3>
                      </div>
                  </div>

                  {/* Center: Play Buttons */}
                  <div className="flex items-center justify-center space-x-6 w-[40%]">
                      <button onClick={onPrev} className="text-white/70 hover:text-white transition-transform hover:scale-110">
                          <SkipBack size={24} md:size={28} fill="currentColor" />
                      </button>
                      
                      <button 
                        onClick={onPlayPause}
                        className="w-12 h-12 md:w-14 md:h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                      >
                          {isPlaying ? (
                              <Pause size={22} md:size={24} fill="currentColor" />
                          ) : (
                              <Play size={22} md:size={24} fill="currentColor" className="ml-1" />
                          )}
                      </button>

                      <button onClick={onNext} className="text-white/70 hover:text-white transition-transform hover:scale-110">
                           <SkipForward size={24} md:size={28} fill="currentColor" />
                      </button>
                  </div>
                  
                  {/* Right: Volume / Extras */}
                  <div className="flex items-center justify-end space-x-3 w-[30%]">
                       <div className="hidden sm:flex items-center space-x-2 w-24 group">
                           <Volume2 size={16} className="text-white/50 group-hover:text-white" />
                           <input 
                              type="range" min="0" max="1" step="0.01" 
                              value={volume} onChange={e => onVolumeChange(parseFloat(e.target.value))}
                              className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100"
                           />
                       </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default LyricsView;