import React, { useEffect, useRef } from 'react';
import { Song } from '../types';
import { ChevronDown, MessageSquareQuote, MoreHorizontal, ListMusic } from 'lucide-react';

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
  const lyrics = getLyrics(song);
  const scrollRef = useRef<HTMLDivElement>(null);
  
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
    <div className="fixed inset-0 z-[60] flex flex-col bg-gray-900 text-white overflow-hidden animate-in slide-in-from-bottom duration-300">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={song.coverUrl} 
          alt="Background" 
          className="w-full h-full object-cover blur-3xl opacity-50 scale-150 transform" 
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
         <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-colors">
            <ChevronDown size={24} />
         </button>
         <div className="flex flex-col items-center">
             <span className="text-xs font-semibold uppercase tracking-widest text-white/60">Playing from Library</span>
             <span className="text-sm font-bold">{song.album}</span>
         </div>
         <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-colors">
            <MoreHorizontal size={24} />
         </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 px-8 pb-10 overflow-hidden">
        
        {/* Left: Album Art */}
        <div className="w-full max-w-sm md:max-w-md aspect-square flex-shrink-0 shadow-2xl rounded-2xl overflow-hidden transform transition-transform duration-500 hover:scale-[1.02]">
            <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
        </div>

        {/* Right: Lyrics & Controls (Split on Desktop) */}
        <div className="flex-1 w-full max-w-2xl flex flex-col h-full min-h-0">
            
            {/* Lyrics Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar mask-image-gradient py-10" ref={scrollRef}>
                <div className="space-y-6 text-center md:text-left">
                    {lyrics.map((line, idx) => (
                        <p 
                          key={idx} 
                          className={`text-2xl md:text-4xl font-bold transition-all duration-500 cursor-pointer ${
                              idx === activeLineIndex 
                                ? 'text-white scale-100 blur-none' 
                                : 'text-white/30 scale-95 blur-[1px] hover:text-white/60'
                          }`}
                          onClick={() => {
                              // Seek to approximate time of this line
                              const newTime = (idx / lyrics.length) * duration;
                              onSeek(newTime);
                          }}
                        >
                            {line}
                        </p>
                    ))}
                    {/* Spacer for bottom scrolling */}
                    <div className="h-40"></div> 
                </div>
            </div>

            {/* Desktop-only Controls inside the layout, usually Apple Music keeps controls at bottom or separate. 
                We will put a mini control set here for the full screen feel if needed, 
                but strictly speaking, the bottom player usually transforms. 
                For this layout, let's keep it simple: Just lyrics here.
            */}
        </div>
      </div>

      {/* Bottom Controls (Overlay Style) */}
      <div className="relative z-20 px-8 pb-12 pt-4 w-full max-w-5xl mx-auto">
          {/* Progress */}
          <div className="mb-6 group">
              <input 
                type="range" 
                min={0} 
                max={duration || 100} 
                value={currentTime} 
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
              />
              <div className="flex justify-between text-xs font-medium text-white/50 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
              </div>
          </div>

          {/* Title & Artist (Mobile mainly, but good for context) */}
          <div className="flex items-end justify-between mb-8">
              <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{song.title}</h2>
                  <h3 className="text-lg md:text-xl text-white/60">{song.artist}</h3>
              </div>
              <div className="flex space-x-4">
                  <button className="p-2 text-white/60 hover:text-white bg-white/10 rounded-full"><MessageSquareQuote /></button>
                  <button className="p-2 text-white/60 hover:text-white bg-white/10 rounded-full"><ListMusic /></button>
              </div>
          </div>

          {/* Main Buttons */}
          <div className="flex items-center justify-center space-x-10">
              <button onClick={onPrev} className="text-white/70 hover:text-white transition-transform hover:scale-110">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
              
              <button 
                onClick={onPlayPause}
                className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
              >
                  {isPlaying ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M8 5v14l11-7z"/></svg>
                  )}
              </button>

              <button onClick={onNext} className="text-white/70 hover:text-white transition-transform hover:scale-110">
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
          </div>
          
          {/* Volume Slider (Bottom Center) */}
          <div className="max-w-xs mx-auto mt-8 flex items-center space-x-3 opacity-0 hover:opacity-100 transition-opacity">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="white" className="opacity-50"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
               <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={volume} onChange={e => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
               />
               <svg width="16" height="16" viewBox="0 0 24 24" fill="white" className="opacity-50"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
          </div>
      </div>
    </div>
  );
};

export default LyricsView;