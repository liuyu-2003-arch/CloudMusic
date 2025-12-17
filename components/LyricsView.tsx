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
  const lyrics = [
    "Verse 1", `Now playing ${song.title}`, `By ${song.artist}`, "Music is the language", "of the human soul.", " ",
    "Chorus", "Feel the rhythm in your heart", "Never let the music part", "Every note a brand new start", " ",
    "Verse 2", "Golden days and neon nights", "Guided by the studio lights", "Melodies at all time heights", "End"
  ];

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 400); // 等待动画结束
  };

  const handleLike = () => {
    setPopHeart(true);
    onLikeToggle?.();
    setTimeout(() => setPopHeart(false), 500);
  };

  const activeIndex = Math.floor((currentTime / (duration || 1)) * lyrics.length);

  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        scrollRef.current.scrollTo({ top: activeEl.offsetTop - 200, behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col bg-gray-900 text-white shadow-2xl ${isClosing ? 'animate-ios-down' : 'animate-ios-up'}`}>
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={song.coverUrl} className="w-full h-full object-cover blur-3xl opacity-30 scale-150" alt="" />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Header - 点击左上角收起 */}
      <div className="relative z-10 flex items-center justify-between px-6 py-6 shrink-0">
         <button 
           onClick={handleClose} 
           className="bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-all active:scale-75"
         >
            <ChevronDown size={28} />
         </button>
         <div className="text-center">
             <span className="block text-[10px] font-bold uppercase tracking-widest text-white/50">Playing From</span>
             <span className="text-sm font-bold">{song.album}</span>
         </div>
         <button 
            onClick={handleLike}
            className={`p-2 transition-all active:scale-75 ${isLiked ? 'text-apple-accent' : 'text-white/30'}`}
         >
            <Heart size={28} fill={isLiked ? "currentColor" : "none"} className={popHeart ? 'heart-animate' : ''} />
         </button>
      </div>

      {/* Lyrics View */}
      <div 
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-8 py-10 space-y-8 text-center scroll-smooth no-scrollbar"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)' }}
      >
          {lyrics.map((line, idx) => (
              <p 
                key={idx} 
                className={`text-3xl md:text-5xl font-bold transition-all duration-500 ${idx === activeIndex ? 'text-white scale-100 opacity-100' : 'text-white/20 scale-90 opacity-40'}`}
              >
                  {line}
              </p>
          ))}
      </div>

      {/* Footer Controls */}
      <div className="relative z-10 p-8 pb-12 bg-black/20 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-xl mx-auto flex flex-col items-center gap-6">
              <div className="flex items-center gap-4 w-full">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shadow-lg"><img src={song.coverUrl} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0 text-left">
                      <h2 className="font-bold truncate">{song.title}</h2>
                      <h3 className="text-sm text-white/50 truncate">{song.artist}</h3>
                  </div>
              </div>

              <div className="flex items-center gap-8">
                  <button onClick={onPrev} className="text-white/60 active:scale-75 transition-transform"><SkipBack size={32} fill="currentColor" /></button>
                  <button onClick={onPlayPause} className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center active:scale-90 transition-transform">
                      {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                  </button>
                  <button onClick={onNext} className="text-white/60 active:scale-75 transition-transform"><SkipForward size={32} fill="currentColor" /></button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default LyricsView;