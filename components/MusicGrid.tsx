import React, { useState } from 'react';
import { Song } from '../types';
import { Play, Edit2, Loader2, RefreshCw } from 'lucide-react';

interface UISong extends Song {
  isRemoving?: boolean;
}

interface MusicGridProps {
  title: string;
  songs: UISong[];
  onPlay: (song: UISong) => void;
  isEditMode?: boolean;
  onEdit?: (song: UISong) => void;
  onSeeAll?: () => void;
}

const MusicGrid: React.FC<MusicGridProps> = ({ title, songs, onPlay, isEditMode = false, onEdit, onSeeAll }) => {
  const formattedTitle = title.replace(/_/g, ' ');
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleCardClick = (song: UISong) => {
    if (isEditMode || song.isUploading || song.isRemoving) return;
    setActiveId(song.id);
    setTimeout(() => {
      setActiveId(null);
      onPlay(song);
    }, 120);
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-2xl font-bold text-apple-text capitalize">{formattedTitle.toLowerCase()}</h2>
        {!isEditMode && onSeeAll && (
          <button onClick={onSeeAll} className="text-apple-accent text-sm font-medium hover:underline">See All</button>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
        {songs.map((song) => (
          <div 
            key={song.id} 
            className={`group relative flex flex-col cursor-pointer transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform 
              ${activeId === song.id ? 'scale-95 brightness-90' : 'active:scale-95'} 
              ${(song.isUploading || song.isRemoving) ? 'cursor-wait' : ''}
              ${song.isRemoving ? 'scale-90 opacity-40 translate-y-4' : 'scale-100 opacity-100'}
            `} 
            onClick={() => handleCardClick(song)}
          >
            <div className={`relative aspect-square w-full overflow-hidden rounded-xl shadow-md bg-gray-200 mb-3 transition-all duration-300 transform-gpu ${isEditMode ? 'scale-95 ring-4 ring-apple-accent/20' : 'group-hover:scale-[1.02]'}`}>
              <img 
                src={song.coverUrl} 
                alt={song.title} 
                className={`w-full h-full object-cover transform-gpu ${(song.isUploading || song.isRemoving) ? 'opacity-30 blur-[4px]' : ''}`}
                loading="lazy"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              />
              
              {/* Syncing/Uploading Overlay */}
              {song.isUploading && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center space-y-2 animate-in fade-in duration-300">
                   <div className="relative">
                      <Loader2 size={32} className="text-white animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                      </div>
                   </div>
                   <span className="text-[10px] text-white font-black uppercase tracking-[0.2em]">Uploading</span>
                </div>
              )}

              {/* Removing/Deleting Overlay */}
              {song.isRemoving && (
                <div className="absolute inset-0 bg-apple-accent/20 flex flex-col items-center justify-center space-y-2 animate-in fade-in duration-300">
                   <RefreshCw size={32} className="text-apple-accent animate-spin" />
                   <span className="text-[10px] text-apple-accent font-black uppercase tracking-[0.2em]">Deleting</span>
                </div>
              )}

              {!isEditMode && !song.isUploading && !song.isRemoving && (
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                   <div className="bg-white/90 backdrop-blur-md rounded-full p-4 shadow-xl text-apple-accent scale-75 group-hover:scale-100 transition-transform duration-300">
                     <Play size={24} fill="currentColor" className="ml-0.5" />
                   </div>
                </div>
              )}

              {isEditMode && !song.isRemoving && !song.isUploading && (
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit && onEdit(song);
                        }}
                        className="absolute top-2 right-2 bg-white/90 backdrop-blur-md text-apple-accent p-2 rounded-full shadow-lg transform hover:scale-110 active:scale-90 transition-all"
                        aria-label="Edit song"
                      >
                          <Edit2 size={14} />
                      </button>
                  </div>
              )}
            </div>

            <div className="flex flex-col px-0.5">
              <h3 className={`text-[15px] leading-tight font-semibold line-clamp-1 transition-colors ${(song.isUploading || song.isRemoving) ? 'text-gray-400' : 'text-gray-900 group-hover:text-apple-accent'}`}>
                {song.title}
              </h3>
              <p className="text-[14px] leading-tight text-gray-500 mt-1 line-clamp-1">
                {song.artist}
              </p>
              {song.description && !song.isRemoving && (
                 <p className="text-[12px] text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{song.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicGrid;