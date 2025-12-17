import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MusicGrid from './components/MusicGrid';
import Player from './components/Player';
import SongModal from './components/SongModal';
import LoginModal from './components/LoginModal';
import { MOCK_SONGS } from './constants';
import { Song, View } from './types';
import { LogIn, LogOut, ChevronDown, Plus, Edit3, Check } from 'lucide-react';
import { supabase, isUserAdmin } from './services/supabaseClient';

export default function App() {
  const [activeView, setActiveView] = useState<View>(View.SONGS);
  const [myLibrary, setMyLibrary] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const storedLikes = localStorage.getItem('cloudmusic_liked_ids');
      if (storedLikes) {
          try {
              const ids = JSON.parse(storedLikes);
              if (Array.isArray(ids)) setLikedSongIds(new Set(ids));
          } catch (e) {}
      }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('songs').select('*').order('added_at', { ascending: false });
        if (data && data.length > 0) {
           setMyLibrary(data.map((item: any) => ({
             id: item.id, title: item.title, artist: item.artist, album: item.album,
             coverUrl: item.cover_url || item.coverUrl, audioUrl: item.audio_url || item.audioUrl,
             lyricsUrl: item.lyrics_url || item.lyricsUrl, addedAt: item.added_at || item.addedAt,
             description: item.description
           })));
        } else {
           setMyLibrary(MOCK_SONGS);
        }
      } catch (err) {
        setMyLibrary(MOCK_SONGS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSongs();
  }, []);

  const handleDeleteSong = async (song: Song) => {
      if (!window.confirm(`Are you sure you want to delete "${song.title}"?`)) return;
      setMyLibrary(prev => prev.filter(s => s.id !== song.id));
      await supabase.from('songs').delete().eq('id', song.id);
  };

  const handleSaveSong = async (song: Song) => {
    // Check if it's an update or a new song
    const isNew = !myLibrary.some(s => s.id === song.id);
    
    if (isNew) {
      setMyLibrary(prev => [song, ...prev]);
      await supabase.from('songs').insert({
        id: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        cover_url: song.coverUrl,
        audio_url: song.audioUrl,
        lyrics_url: song.lyricsUrl,
        added_at: song.addedAt,
        description: song.description
      });
    } else {
      setMyLibrary(prev => prev.map(s => s.id === song.id ? song : s));
      await supabase.from('songs').update({
        title: song.title,
        artist: song.artist,
        album: song.album,
        cover_url: song.coverUrl,
        audio_url: song.audioUrl,
        lyrics_url: song.lyricsUrl,
        description: song.description
      }).eq('id', song.id);

      // If the edited song is currently playing, update the player state
      if (currentSong?.id === song.id) {
        setCurrentSong(song);
      }
    }
  };

  const handleToggleLike = (songId?: string) => {
      if (!songId) return;
      const newSet = new Set(likedSongIds);
      if (newSet.has(songId)) newSet.delete(songId);
      else newSet.add(songId);
      setLikedSongIds(newSet);
      localStorage.setItem('cloudmusic_liked_ids', JSON.stringify(Array.from(newSet)));
  };

  const isAdmin = isUserAdmin(user?.email);

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden font-sans">
      
      <div className={`flex h-full w-full bg-apple-bg transition-all duration-500 origin-top ${isLyricsOpen ? 'app-shrink' : 'app-expand'}`}>
        {/* Sidebar */}
        <aside className="hidden md:block w-[260px] flex-shrink-0 z-20">
          <Sidebar activeView={activeView} onChangeView={(v) => { setActiveView(v); setIsEditMode(false); }} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative h-full overflow-hidden">
          <header className="h-16 flex items-center justify-between px-8 bg-apple-bg/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200/50">
             <div className="md:hidden font-bold text-xl text-gray-900">CloudMusic</div>
             <div className="hidden md:block"></div>
             
             <div className="flex items-center space-x-5">
                {isEditMode && isAdmin && <div className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full uppercase tracking-wide">Editing</div>}
                {user ? (
                    <div className="relative" ref={userMenuRef}>
                        <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2 focus:outline-none">
                            <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden border border-gray-200">
                               <img src={user.user_metadata?.avatar_url || "https://picsum.photos/id/64/100/100"} alt="Avatar" className="h-full w-full object-cover" />
                            </div>
                            <ChevronDown size={14} className={`text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isUserMenuOpen && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                             <div className="py-1">
                               {isAdmin && (
                                 <>
                                   <button onClick={() => { setEditingSong(null); setIsModalOpen(true); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-apple-accent flex items-center space-x-2"><Plus size={16} /><span>Add Music</span></button>
                                   <button onClick={() => { setIsEditMode(!isEditMode); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-apple-accent flex items-center space-x-2">{isEditMode ? <Check size={16} className="text-green-500" /> : <Edit3 size={16} />}<span>{isEditMode ? 'Done Editing' : 'Edit Library'}</span></button>
                                 </>
                               )}
                               <button onClick={async () => { await supabase.auth.signOut(); setIsUserMenuOpen(false); setIsEditMode(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center space-x-2"><LogOut size={16} /><span>Sign Out</span></button>
                             </div>
                          </div>
                        )}
                    </div>
                ) : (
                    <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"><LogIn size={16} /><span>Sign In</span></button>
                )}
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 pb-32">
            <div className="max-w-[1600px] mx-auto">
              {isLoading ? <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-accent"></div></div> : (
                <MusicGrid 
                  title={activeView} 
                  songs={activeView === View.LIKED ? myLibrary.filter(s => likedSongIds.has(s.id)) : myLibrary} 
                  onPlay={setCurrentSong} 
                  isEditMode={isEditMode && isAdmin}
                  onDelete={handleDeleteSong}
                  onEdit={(s) => { setEditingSong(s); setIsModalOpen(true); }}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      <Player 
        currentSong={currentSong} 
        onNext={() => {}} 
        onPrev={() => {}}
        isLiked={currentSong ? likedSongIds.has(currentSong.id) : false}
        onLikeToggle={() => currentSong && handleToggleLike(currentSong.id)}
        isLyricsOpen={isLyricsOpen}
        onSetLyricsOpen={setIsLyricsOpen}
      />

      <SongModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingSong(null); }} 
        onSave={handleSaveSong} 
        editingSong={editingSong}
      />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}