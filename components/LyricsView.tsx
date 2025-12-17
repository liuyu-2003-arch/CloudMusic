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
  isLiked?: boolean;
  onLikeToggle?: () => void;
}

// Simulated lyrics generation for demo purposes
const getLyrics = (song: Song) => {
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
  onPlayPause, onNext, onPrev, volume, onVolumeChange, onSeek,
  isLiked = false, onLikeToggle
}) => {
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setLyrics(getLyrics(song));
  }, [song]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
        onClose();
    }, 400); // Matches the new CSS slide-down-ios duration
  };

  const handleLike = () => {
      setAnimateHeart(true);
      if (onLikeToggle) onLikeToggle();
      setTimeout(() => setAnimateHeart(false), 450); // Matches animation-duration
  };
  
  // Calculate active line based on simple time division for demo
  const activeLineIndex = Math.floor((currentTime / (duration || 1)) * lyrics.length);

  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const lyricsContainer = container.firstElementChild as HTMLElement;
      
      if (lyricsContainer && lyricsContainer.children[activeLineIndex]) {
        const activeEl = lyricsContainer.children[activeLineIndex] as HTMLElement;
        const containerHeight = container.clientHeight;
        const offset = containerHeight * 0.15; 
        const newScrollTop = activeEl.offsetTop - offset;

        container.scrollTo({
            top: newScrollTop,
            behavior: 'smooth'
        });
      }
    }
  }, [activeLineIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={`fixed inset-0 z-[60] flex flex-col bg-gray-900 text-white overflow-hidden ${isClosing ? 'animate-out-ios' : 'animate-in-ios'}`}>
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={song.coverUrl} 
          alt="Background" 
          className="w-full h-full object-cover blur-3xl opacity-40 scale-150 transform transition-transform duration-[10s]" 
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 md:px-8 shrink-0">
         <button 
           onClick={handleClose} 
           className="bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-all active:scale-90"
         >
            <ChevronDown size={24} />
         </button>
         <div className="flex flex-col items-center opacity-0 animate-[fadeIn_0.5s_ease-out_0.3s_forwards]">
             <span className="text-xs font-semibold uppercase tracking-widest text-white/60">Playing from Library</span>
             <span className="text-sm font-bold truncate max-w-[200px]">{song.album}</span>
         </div>
         <button 
            onClick={handleLike}
            className={`bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-colors active:scale-90 ${isLiked ? 'text-apple-accent' : 'text-white'}`}
         >
            <Heart size={24} fill={isLiked ? "currentColor" : "none"} className={animateHeart ? 'animate-like-bounce' : ''} />
         </button>
      </div>

      {/* Main Content (Lyrics Only) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-8 pb-4 overflow-hidden">
        
        {/* Lyrics Area */}
        <div 
            className="w-full max-w-2xl flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']" 
            style={{ 
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)', 
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)' 
            }}
            ref={scrollRef}
        >
            {/* Lyrics content fading in slightly later than the sheet */}
            <div className="space-y-8 text-center pt-[20vh] pb-[60vh] opacity-0 animate-[fadeIn_0.6s_ease-out_0.2s_forwards]">
                {lyrics.map((line, idx) => (
                    <p 
                      key={idx} 
                      className={`text-2xl md:text-4xl font-bold transition-all duration-500 cursor-pointer leading-tight ${
                          idx === activeLineIndex 
                            ? 'text-white scale-100 blur-none opacity-100 origin-center' 
                            : 'text-white/40 scale-95 blur-[0.5px] hover:text-white/70 hover:opacity-80 origin-center'
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
      <div className="relative z-20 w-full bg-black/20 backdrop-blur-xl border-t border-white/5 pb-8 pt-4 px-4 md:px-12 shrink-0 animate-[slideUp_0.5s_ease-out_0.1s]">
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
                  <div className="flex items-center flex-1 min-w-0 sm:w-[30%] gap-3 sm:gap-4 overflow-hidden">
                      <div className="h-10 w-10 md:h-14 md:w-14 rounded-lg shadow-lg overflow-hidden flex-shrink-0 bg-gray-800">
                          <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col overflow-hidden justify-center min-w-0">
                          <h2 className="text-sm md:text-lg font-bold text-white truncate leading-tight">{song.title}</h2>
                          <h3 className="text-xs md:text-sm text-white/60 truncate leading-tight">{song.artist}</h3>
                      </div>
                  </div>

                  {/* Center: Play Buttons */}
                  <div className="flex items-center justify-end sm:justify-center space-x-4 md:space-x-6 flex-none sm:w-[40%]">
                      <button onClick={onPrev} className="text-white/70 hover:text-white transition-transform active:scale-90">
                          <SkipBack size={20} className="md:w-7 md:h-7" fill="currentColor" />
                      </button>
                      
                      <button 
                        onClick={onPlayPause}
                        className="w-10 h-10 md:w-14 md:h-14 bg-white text-black rounded-full flex items-center justify-center transition-transform shadow-lg active:scale-90 hover:scale-105"
                      >
                          {isPlaying ? (
                              <Pause size={20} className="md:w-6 md:h-6" fill="currentColor" />
                          ) : (
                              <Play size={20} className="md:w-6 md:h-6 ml-0.5" fill="currentColor" />
                          )}
                      </button>

                      <button onClick={onNext} className="text-white/70 hover:text-white transition-transform active:scale-90">
                           <SkipForward size={20} className="md:w-7 md:h-7" fill="currentColor" />
                      </button>
                  </div>
                  
                  {/* Right: Volume / Extras */}
                  <div className="hidden sm:flex items-center justify-end space-x-3 w-[30%]">
                       <div className="flex items-center space-x-2 w-24 group">
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