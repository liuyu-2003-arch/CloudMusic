import React from 'react';
import { Song } from '../types';
import { Play, Trash2 } from 'lucide-react';

interface MusicGridProps {
  title: string;
  songs: Song[];
  onPlay: (song: Song) => void;
  isEditMode?: boolean;
  onDelete?: (song: Song) => void;
}

const MusicGrid: React.FC<MusicGridProps> = ({ title, songs, onPlay, isEditMode = false, onDelete }) => {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-2xl font-bold text-apple-text">{title}</h2>
        {/* Hide See All in Edit Mode for clarity */}
        {!isEditMode && <button className="text-apple-accent text-sm font-medium hover:underline">See All</button>}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
        {songs.map((song) => (
          <div key={song.id} className="group relative flex flex-col cursor-pointer" onClick={() => !isEditMode && onPlay(song)}>
            {/* Cover Image Container */}
            <div className={`relative aspect-square w-full overflow-hidden rounded-xl shadow-md bg-gray-200 mb-3 transition-transform duration-300 ${isEditMode ? 'scale-95 opacity-90' : 'group-hover:scale-[1.02]'}`}>
              <img 
                src={song.coverUrl} 
                alt={song.title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Overlay Play Button (Normal Mode) */}
              {!isEditMode && (
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-start p-3">
                   <div className="bg-white/90 backdrop-blur-md rounded-full p-2 shadow-lg text-apple-accent translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                     <Play size={20} fill="currentColor" />
                   </div>
                </div>
              )}

              {/* Delete Button (Edit Mode) */}
              {isEditMode && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center animate-in fade-in duration-200">
                      <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete && onDelete(song);
                        }}
                        className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 shadow-lg transform hover:scale-110 transition-all"
                      >
                          <Trash2 size={24} />
                      </button>
                  </div>
              )}
            </div>

            {/* Meta Data */}
            <div className="flex flex-col">
              <h3 className="text-[15px] leading-tight font-medium text-gray-900 line-clamp-1 group-hover:text-apple-accent transition-colors">
                {song.title}
              </h3>
              <p className="text-[14px] leading-tight text-gray-500 mt-1 line-clamp-1">
                {song.artist}
              </p>
              {song.description && (
                 <p className="text-[12px] text-gray-400 mt-1 line-clamp-2">{song.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicGrid;