import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MusicGrid from './components/MusicGrid';
import Player from './components/Player';
import SongModal from './components/SongModal';
import LoginModal from './components/LoginModal';
import { MOCK_SONGS, AMBIENT_COLLECTION } from './constants';
import { Song, View } from './types';
import { LogIn, LogOut, ChevronDown, Plus, Edit3, Check, ArrowLeft } from 'lucide-react';
import { supabase, isUserAdmin } from './services/supabaseClient';
import { uploadFile, deleteFile } from './services/uploadService';

// Extend Song for internal UI state
interface UISong extends Song {
  isRemoving?: boolean;
}

export default function App() {
  const [activeView, setActiveView] = useState<View>(View.SONGS);
  const [myLibrary, setMyLibrary] = useState<UISong[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  
  const [filterType, setFilterType] = useState<'artist' | 'album' | null>(null);
  const [filterValue, setFilterValue] = useState<string | null>(null);

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

  const displayData = useMemo(() => {
    let base = [...myLibrary];
    if (filterType && filterValue) {
      const filtered = base.filter(s => filterType === 'artist' ? s.artist === filterValue : s.album === filterValue);
      return { 
        title: filterValue, 
        songs: filtered.sort((a, b) => a.title.localeCompare(b.title)),
        isCategory: false 
      };
    }

    switch (activeView) {
      case View.RECENTLY_ADDED:
        return { title: "Recently Added", songs: base.sort((a, b) => b.addedAt - a.addedAt), isCategory: false };
      case View.SONGS:
        return { title: "Songs", songs: base.sort((a, b) => a.title.localeCompare(b.title)), isCategory: false };
      case View.LIKED:
        return { title: "Liked Songs", songs: base.filter(s => likedSongIds.has(s.id)).sort((a, b) => a.title.localeCompare(b.title)), isCategory: false };
      case View.ARTISTS:
        const artistMap = new Map<string, Song>();
        base.forEach(s => {
          if (!artistMap.has(s.artist)) {
            artistMap.set(s.artist, { ...s, title: s.artist, description: `${base.filter(x => x.artist === s.artist).length} Songs` });
          }
        });
        return { title: "Artists", songs: Array.from(artistMap.values()).sort((a, b) => a.title.localeCompare(b.title)), isCategory: true, type: 'artist' };
      case View.ALBUMS:
        const albumMap = new Map<string, Song>();
        base.forEach(s => {
          const key = `${s.album}-${s.artist}`;
          if (!albumMap.has(key)) {
            albumMap.set(key, { ...s, title: s.album, description: s.artist });
          }
        });
        return { title: "Albums", songs: Array.from(albumMap.values()).sort((a, b) => a.title.localeCompare(b.title)), isCategory: true, type: 'album' };
      default:
        return { title: "Library", songs: base, isCategory: false };
    }
  }, [myLibrary, activeView, likedSongIds, filterType, filterValue]);

  const handleDeleteSong = async (song: Song) => {
      // 1. Mark as removing in UI (triggers animation)
      setMyLibrary(prev => prev.map(s => s.id === song.id ? { ...s, isRemoving: true } : s));
      
      // 2. Wait for animation to finish
      setTimeout(async () => {
        // Remove from UI list
        setMyLibrary(prev => prev.filter(s => s.id !== song.id));
        
        // Background: Delete associated files from MinIO
        if (song.coverUrl) deleteFile(song.coverUrl);
        if (song.audioUrl) deleteFile(song.audioUrl);
        if (song.lyricsUrl) deleteFile(song.lyricsUrl);

        // Background: Delete from Database
        await supabase.from('songs').delete().eq('id', song.id);
        
        if (currentSong?.id === song.id) setCurrentSong(null);
      }, 400); // matches Tailwind transition duration
  };

  const handleSaveSong = async (song: Song, files?: { cover?: File; audio?: File; lyrics?: File }) => {
    const isNew = !myLibrary.some(s => s.id === song.id);
    
    // Optimistically add/update in the UI library
    if (isNew) {
      setMyLibrary(prev => [song, ...prev]);
    } else {
      setMyLibrary(prev => prev.map(s => s.id === song.id ? song : s));
    }

    // Process file uploads in the background if they exist
    if (files && (files.cover || files.audio || files.lyrics)) {
      (async () => {
        try {
          const updatedUrls: Partial<Song> = {};
          
          if (files.cover) {
            updatedUrls.coverUrl = await uploadFile(files.cover, 'covers');
          }
          if (files.audio) {
            updatedUrls.audioUrl = await uploadFile(files.audio, 'tracks');
          }
          if (files.lyrics) {
            updatedUrls.lyricsUrl = await uploadFile(files.lyrics, 'lyrics');
          }

          // Update song in UI with real URLs and set isUploading to false
          const finalSong = { ...song, ...updatedUrls, isUploading: false };
          setMyLibrary(prev => prev.map(s => s.id === song.id ? finalSong : s));
          if (currentSong?.id === song.id) setCurrentSong(finalSong);

          // Now persist to Supabase with final URLs
          if (isNew) {
            await supabase.from('songs').insert({
              id: finalSong.id, title: finalSong.title, artist: finalSong.artist, album: finalSong.album, 
              cover_url: finalSong.coverUrl, audio_url: finalSong.audioUrl, lyrics_url: finalSong.lyricsUrl, 
              added_at: finalSong.addedAt, description: finalSong.description
            });
          } else {
            await supabase.from('songs').update({
              title: finalSong.title, artist: finalSong.artist, album: finalSong.album, 
              cover_url: finalSong.coverUrl, audio_url: finalSong.audioUrl, lyrics_url: finalSong.lyricsUrl, 
              description: finalSong.description
            }).eq('id', finalSong.id);
          }
        } catch (error) {
          console.error("Background upload failed:", error);
          setMyLibrary(prev => prev.map(s => s.id === song.id ? { ...s, isUploading: false } : s));
        }
      })();
    } else {
      // No files to upload, just persist immediately
      if (isNew) {
        await supabase.from('songs').insert({
          id: song.id, title: song.title, artist: song.artist, album: song.album, cover_url: song.coverUrl,
          audio_url: song.audioUrl, lyrics_url: song.lyricsUrl, added_at: song.addedAt, description: song.description
        });
      } else {
        await supabase.from('songs').update({
          title: song.title, artist: song.artist, album: song.album, cover_url: song.coverUrl,
          audio_url: song.audioUrl, lyrics_url: song.lyricsUrl, description: song.description
        }).eq('id', song.id);
        if (currentSong?.id === song.id) setCurrentSong(song);
      }
    }
  };

  const handleDiscoverLightMusic = async () => {
    const newSongs = AMBIENT_COLLECTION.filter(s => !myLibrary.some(existing => existing.title === s.title));
    if (newSongs.length === 0) {
      alert("Zen Pack already in your library!");
      return;
    }
    setMyLibrary(prev => [...newSongs, ...prev]);
    const isAdmin = isUserAdmin(user?.email);
    if (isAdmin) {
      for (const song of newSongs) {
        await supabase.from('songs').insert({
          id: song.id, title: song.title, artist: song.artist, album: song.album, cover_url: song.coverUrl,
          audio_url: song.audioUrl, lyrics_url: song.lyricsUrl, added_at: song.addedAt, description: song.description
        });
      }
    }
    setActiveView(View.RECENTLY_ADDED);
    resetFilters();
  };

  const handleToggleLike = (songId?: string) => {
      if (!songId) return;
      const newSet = new Set(likedSongIds);
      if (newSet.has(songId)) newSet.delete(songId);
      else newSet.add(songId);
      setLikedSongIds(newSet);
      localStorage.setItem('cloudmusic_liked_ids', JSON.stringify(Array.from(newSet)));
  };

  const handleItemClick = (item: UISong) => {
    if (item.isUploading || item.isRemoving) return;
    if (displayData.isCategory) {
      setFilterType(displayData.type as any);
      setFilterValue(item.title);
    } else {
      setCurrentSong(item);
    }
  };

  const resetFilters = () => {
    setFilterType(null);
    setFilterValue(null);
  };

  const isAdmin = isUserAdmin(user?.email);

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden font-sans">
      <div className={`flex h-full w-full bg-apple-bg transition-all duration-500 origin-top ${isLyricsOpen ? 'app-shrink' : 'app-expand'}`}>
        <aside className="hidden md:block w-[260px] flex-shrink-0 z-20">
          <Sidebar 
            activeView={activeView} 
            onChangeView={(v) => { setActiveView(v); setIsEditMode(false); resetFilters(); }} 
            onDiscoverLightMusic={handleDiscoverLightMusic}
          />
        </aside>

        <main className="flex-1 flex flex-col relative h-full overflow-hidden">
          <header className="h-16 flex items-center justify-between px-8 bg-apple-bg/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200/50">
             <div className="flex items-center space-x-4">
               {filterValue && (
                 <button onClick={resetFilters} className="text-apple-accent hover:bg-apple-accent/10 p-2 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                 </button>
               )}
               <div className="md:hidden font-bold text-xl text-gray-900">CloudMusic</div>
             </div>
             
             <div className="flex items-center space-x-4">
                {isEditMode && isAdmin && (
                  <button 
                    onClick={() => setIsEditMode(false)}
                    className="flex items-center space-x-2 px-4 py-1.5 bg-apple-accent text-white text-xs font-bold rounded-full uppercase tracking-wide shadow-lg hover:bg-red-600 transition-all active:scale-95 animate-in fade-in slide-in-from-right-2"
                  >
                    <Check size={14} />
                    <span>Done Editing</span>
                  </button>
                )}
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
                                   {!isEditMode && (
                                     <button onClick={() => { setIsEditMode(true); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-apple-accent flex items-center space-x-2"><Edit3 size={16} /><span>Edit Library</span></button>
                                   )}
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
                  title={displayData.title} 
                  songs={displayData.songs} 
                  onPlay={handleItemClick} 
                  isEditMode={isEditMode && isAdmin && !displayData.isCategory}
                  onEdit={(s) => { setEditingSong(s); setIsModalOpen(true); }}
                  onSeeAll={() => { setActiveView(View.SONGS); resetFilters(); }}
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
        onDelete={handleDeleteSong}
        editingSong={editingSong}
      />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}