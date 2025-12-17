import React, { useEffect, useRef, useState } from 'react';
import { Song } from '../types';
import { ChevronDown, SkipBack, SkipForward, Play, Pause, Heart } from 'lucide-react';

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

const LyricsView: React.FC<LyricsViewProps> = ({ 
  song, currentTime, duration, onClose, isPlaying, 
  onPlayPause, onNext, onPrev, onSeek,
  isLiked = false, onLikeToggle
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [popHeart, setPopHeart] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // 模拟歌词数据
  const lyrics = [
    "Verse 1", `Now playing ${song.title}`, `By ${song.artist}`, "Music is the language", "of the human soul.", " ",
    "Chorus", "Feel the rhythm in your heart", "Never let the music part", "Every note a brand new start", " ",
    "Verse 2", "Golden days and neon nights", "Guided by the studio lights", "Melodies at all time heights", "End"
  ];

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 400); 
  };

  const handleLike = () => {
    setPopHeart(true);
    onLikeToggle?.();
    setTimeout(() => setPopHeart(false), 500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const activeIndex = Math.floor((currentTime / (duration || 1)) * lyrics.length);

  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        // 让高亮行永远在视口靠上的位置（模拟“第二行”位置）
        scrollRef.current.scrollTo({ top: activeEl.offsetTop - 120, behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col bg-gray-900 text-white shadow-2xl ${isClosing ? 'animate-ios-down' : 'animate-ios-up'}`}>
      
      {/* Dynamic Background Blur */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img src={song.coverUrl} className="w-full h-full object-cover blur-[80px] opacity-40 scale-150 animate-[pulse_8s_infinite]" alt="" />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 md:px-8 shrink-0">
         <button 
           onClick={handleClose} 
           className="bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-all active:scale-75"
         >
            <ChevronDown size={24} />
         </button>
         <div className="text-center opacity-60">
             <span className="block text-[10px] font-bold uppercase tracking-widest">Playing From</span>
             <span className="text-xs font-bold truncate max-w-[150px] inline-block">{song.album}</span>
         </div>
         <button 
            onClick={handleLike}
            className={`p-2 transition-all active:scale-75 ${isLiked ? 'text-apple-accent' : 'text-white/30'}`}
         >
            <Heart size={24} fill={isLiked ? "currentColor" : "none"} className={popHeart ? 'heart-animate' : ''} />
         </button>
      </div>

      {/* Lyrics Main Scroll Area */}
      <div 
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-8 py-10 space-y-12 text-left scroll-smooth no-scrollbar"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 80%, transparent)' }}
      >
          <div className="h-[10vh]"></div> {/* Top Spacer adjusted for "2nd line" feel */}
          {lyrics.map((line, idx) => (
              <p 
                key={idx} 
                className={`text-3xl md:text-5xl font-bold transition-all duration-700 cursor-pointer max-w-2xl mx-auto leading-tight ${
                  idx === activeIndex 
                  ? 'text-white scale-100 opacity-100 blur-none' 
                  : 'text-white/20 scale-95 opacity-30 blur-[1px] hover:opacity-50'
                }`}
                onClick={() => onSeek((idx / lyrics.length) * duration)}
              >
                  {line}
              </p>
          ))}
          <div className="h-[40vh]"></div> {/* Bottom Spacer */}
      </div>

      {/* Compact Re-designed Footer Controls */}
      <div className="relative z-20 px-6 pt-4 pb-10 md:px-12 bg-black/40 backdrop-blur-3xl border-t border-white/5">
          <div className="max-w-4xl mx-auto flex flex-col gap-5">
              
              {/* Top Row: Meta & Controls & Actions */}
              <div className="flex items-center justify-between gap-4">
                  {/* Left: Metadata */}
                  <div className="flex items-center gap-4 w-1/3 min-w-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shadow-2xl flex-shrink-0 bg-gray-800">
                          <img src={song.coverUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="min-w-0">
                          <h2 className="font-bold truncate text-base leading-tight">{song.title}</h2>
                          <h3 className="text-xs text-white/50 truncate font-medium mt-0.5">{song.artist}</h3>
                      </div>
                  </div>

                  {/* Center: Playback Core Controls (Smaller, matching home player) */}
                  <div className="flex items-center gap-6 md:gap-8">
                      <button onClick={onPrev} className="text-white/60 hover:text-white active:scale-75 transition-all">
                          <SkipBack className="w-6 h-6" fill="currentColor" />
                      </button>
                      <button 
                        onClick={onPlayPause} 
                        className="w-12 h-12 md:w-14 md:h-14 bg-white text-black rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-lg hover:scale-105"
                      >
                          {isPlaying ? (
                              <Pause className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
                          ) : (
                              <Play className="w-5 h-5 md:w-6 md:h-6 ml-1" fill="currentColor" />
                          )}
                      </button>
                      <button onClick={onNext} className="text-white/60 hover:text-white active:scale-75 transition-all">
                          <SkipForward className="w-6 h-6" fill="currentColor" />
                      </button>
                  </div>

                  {/* Right: Spacing */}
                  <div className="w-1/3"></div>
              </div>

              {/* Bottom Row: Progress Slider (Moved below buttons) */}
              <div className="w-full space-y-1.5 px-1">
                  <div className="relative h-1.5 w-full bg-white/10 rounded-full cursor-pointer group">
                      <div 
                        className="absolute h-full bg-white/80 rounded-full transition-all duration-300" 
                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                      />
                      <input 
                        type="range" min="0" max={duration || 100} value={currentTime}
                        onChange={(e) => onSeek(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-white/30 tabular-nums uppercase tracking-tighter">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};

export default LyricsView;