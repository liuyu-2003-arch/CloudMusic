import React, { useEffect, useRef, useState } from 'react';
import { Song } from '../types';
import { ChevronDown, SkipBack, SkipForward, Play, Pause, Heart } from 'lucide-react';

interface LyricLine {
  startTime: number;
  endTime: number;
  text: string;
}

interface LyricsViewProps {
  isOpen: boolean;
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
  isOpen, song, currentTime, duration, onClose, isPlaying, 
  onPlayPause, onNext, onPrev, onSeek,
  isLiked = false, onLikeToggle
}) => {
  const [popHeart, setPopHeart] = useState(false);
  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
  const [dragOffset, setDragOffset] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const wheelAccumulator = useRef<number>(0);
  const wheelResetTimeout = useRef<number | null>(null);
  const isDragging = useRef(false);

  // SRT Parsing Logic
  const parseTimestamp = (timestamp: string): number => {
    try {
      const [hms, ms] = timestamp.split(/[,.]/); 
      const [h, m, s] = hms.split(':').map(Number);
      return h * 3600 + m * 60 + s + (Number(ms) || 0) / 1000;
    } catch {
      return 0;
    }
  };

  const parseSRT = (data: string): LyricLine[] => {
    const lines: LyricLine[] = [];
    try {
      const blocks = data.trim().split(/\r?\n\r?\n/);
      for (const block of blocks) {
        const parts = block.split(/\r?\n/);
        if (parts.length >= 3) {
          const timeMatch = parts[1].match(/(\d{2}:\d{2}:\d{2}[,.]\d{3}) --> (\d{2}:\d{2}:\d{2}[,.]\d{3})/);
          if (timeMatch) {
            const start = parseTimestamp(timeMatch[1]);
            const end = parseTimestamp(timeMatch[2]);
            const text = parts.slice(2).join(' ').trim();
            if (text) lines.push({ startTime: start, endTime: end, text });
          }
        }
      }
    } catch (e) {
      console.warn("Error parsing SRT:", e);
    }
    return lines;
  };

  useEffect(() => {
    const loadLyrics = async () => {
      let lyricsLoaded = false;
      if (song.lyricsUrl) {
        try {
          // Add a simple timeout to the fetch to avoid hanging on bad links
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(song.lyricsUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (response.ok) {
            const text = await response.text();
            if (text.includes('-->')) {
              const parsed = parseSRT(text);
              if (parsed.length > 0) {
                setParsedLyrics(parsed);
                lyricsLoaded = true;
              }
            }
          }
        } catch (err) {
          // If fetch fails (CORS, network), we just fail silently and use fallback
          console.warn("Lyrics fetch failed, using fallback:", err);
        }
      }

      if (!lyricsLoaded) {
        const mockLines = [
          "Verse 1", `Now playing ${song.title}`, `By ${song.artist}`, 
          "Add an SRT link to see real sync", "Or enjoy the music as it is",
          "Chorus", "Music feels better with you", "Right here in the morning light",
          "Bridge", "Everything is falling into place", "The rhythm takes us home", "End"
        ];
        
        const interval = (duration || 180) / mockLines.length;
        setParsedLyrics(mockLines.map((text, i) => ({
          startTime: i * interval,
          endTime: (i + 1) * interval,
          text
        })));
      }
    };

    loadLyrics();
  }, [song.lyricsUrl, song.id, duration]);

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

  const activeIndex = parsedLyrics.findIndex(
    line => currentTime >= line.startTime && currentTime < line.endTime
  );

  useEffect(() => {
    if (scrollRef.current && activeIndex !== -1 && !isDragging.current) {
      const activeEl = scrollRef.current.children[activeIndex + 1] as HTMLElement;
      if (activeEl) {
        scrollRef.current.scrollTo({ 
          top: activeEl.offsetTop - 120, 
          behavior: 'smooth' 
        });
      }
    }
  }, [activeIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    const isAtTop = scrollRef.current ? scrollRef.current.scrollTop <= 0 : true;

    if (isAtTop && deltaY > 0) {
      isDragging.current = true;
      // Exponentially dampen the drag to make it feel more "heavy" and premium
      const dampedOffset = Math.pow(deltaY, 0.85) * 2;
      setDragOffset(deltaY > 10 ? dampedOffset : deltaY);
      if (e.cancelable) e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    // If pulled down enough, close immediately to sync with Toolbar slide-up
    if (dragOffset > 120) {
      onClose();
    }
    setDragOffset(0);
    touchStartY.current = null;
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const isAtTop = scrollRef.current ? scrollRef.current.scrollTop <= 0 : true;
    if (isAtTop && e.deltaY < 0) {
      wheelAccumulator.current += Math.abs(e.deltaY);
      // Faster response for trackpad swipes
      const calculatedOffset = Math.min(wheelAccumulator.current * 0.4, 200);
      setDragOffset(calculatedOffset);

      if (wheelAccumulator.current > 250) {
        onClose();
        wheelAccumulator.current = 0;
      }

      if (wheelResetTimeout.current) window.clearTimeout(wheelResetTimeout.current);
      wheelResetTimeout.current = window.setTimeout(() => {
        setDragOffset(0);
        wheelAccumulator.current = 0;
      }, 100);
    } else if (dragOffset > 0) {
      setDragOffset(0);
      wheelAccumulator.current = 0;
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col bg-apple-bg shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'animate-ios-up' : 'animate-ios-down'} ${isDragging.current ? 'dragging' : ''}`}
      style={{ 
        transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Background with lighter blur for cleaner look */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img src={song.coverUrl} className="w-full h-full object-cover blur-[80px] opacity-20 scale-150 animate-[pulse_8s_infinite]" alt="" />
        <div className="absolute inset-0 bg-white/40"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 md:px-8 shrink-0">
         <button onClick={onClose} className="bg-black/5 hover:bg-black/10 p-2 rounded-full backdrop-blur-md transition-all active:scale-75 text-apple-text">
            <ChevronDown size={24} />
         </button>
         <div className="text-center opacity-60 text-apple-text">
             <span className="block text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5">Playing From</span>
             <span className="text-xs font-bold truncate max-w-[200px] inline-block leading-none">{song.album || 'Single'}</span>
         </div>
         <button onClick={handleLike} className={`p-2 transition-all active:scale-75 ${isLiked ? 'text-apple-accent' : 'text-apple-text/20'}`}>
            <Heart size={24} fill={isLiked ? "currentColor" : "none"} className={popHeart ? 'heart-animate' : ''} />
         </button>
      </div>

      {/* Lyrics Scroll Area */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-8 py-10 space-y-10 text-left scroll-smooth no-scrollbar" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)' }}>
          <div className="h-[12vh]"></div>
          {parsedLyrics.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-apple-text/10">
                <p className="text-3xl font-bold italic">Lyrics unavailable</p>
             </div>
          ) : (
            parsedLyrics.map((line, idx) => (
                <p 
                  key={idx} 
                  className={`text-3xl md:text-5xl font-bold transition-all duration-500 cursor-pointer max-w-2xl mx-auto leading-tight tracking-tight ${idx === activeIndex ? 'text-apple-text scale-100 opacity-100 blur-none' : 'text-apple-text/20 scale-95 opacity-30 blur-[0.8px] hover:opacity-50'}`} 
                  onClick={() => onSeek(line.startTime)}
                >
                    {line.text}
                </p>
            ))
          )}
          <div className="h-[45vh]"></div>
      </div>

      {/* Footer Controls - Receding into Toolbar look */}
      <div className="relative z-20 px-6 pt-4 pb-12 md:px-12 bg-white/60 backdrop-blur-2xl border-t border-black/5">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-1/3 min-w-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shadow-xl flex-shrink-0 bg-gray-200">
                          <img src={song.coverUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="min-w-0 text-apple-text">
                          <h2 className="font-bold truncate text-base leading-tight tracking-tight">{song.title}</h2>
                          <h3 className="text-xs text-apple-text/40 truncate font-semibold mt-0.5">{song.artist}</h3>
                      </div>
                  </div>
                  <div className="flex items-center gap-5 md:gap-7 text-apple-text">
                      <button onClick={onPrev} className="text-apple-text/40 hover:text-apple-text active:scale-75 transition-all">
                        <SkipBack className="w-6 h-6" fill="currentColor" />
                      </button>
                      <button onClick={onPlayPause} className="w-14 h-14 bg-apple-text text-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-xl hover:scale-105">
                          {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6 ml-1" fill="currentColor" />}
                      </button>
                      <button onClick={onNext} className="text-apple-text/40 hover:text-apple-text active:scale-75 transition-all">
                        <SkipForward className="w-6 h-6" fill="currentColor" />
                      </button>
                  </div>
                  <div className="w-1/3"></div>
              </div>
              <div className="w-full space-y-2.5 px-1">
                  <div className="relative h-1 w-full bg-black/5 rounded-full cursor-pointer group">
                      <div className="absolute h-full bg-apple-text/60 rounded-full transition-all duration-300" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
                      <input type="range" min="0" max={duration || 100} step="0.1" value={currentTime} onChange={(e) => onSeek(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-apple-text/20 tabular-nums uppercase tracking-tighter">
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