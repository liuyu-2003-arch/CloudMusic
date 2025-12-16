import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MusicGrid from './components/MusicGrid';
import Player from './components/Player';
import AddMusicModal from './components/AddMusicModal';
import LoginModal from './components/LoginModal';
import { MOCK_SONGS } from './constants';
import { Song, View } from './types';
import { Bell, LogIn, LogOut, ChevronDown, Plus, Edit3, Settings, ArrowLeft, Check, Heart } from 'lucide-react';
import { supabase, isUserAdmin } from './services/supabaseClient';

export default function App() {
  const [activeView, setActiveView] = useState<View>(View.SONGS);
  const [myLibrary, setMyLibrary] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  
  // State for functionality
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  
  // Navigation State for Artists/Albums drill-down
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Header Dropdown State
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load Liked Songs from LocalStorage on mount
  useEffect(() => {
      const storedLikes = localStorage.getItem('cloudmusic_liked_ids');
      if (storedLikes) {
          try {
              const ids = JSON.parse(storedLikes);
              if (Array.isArray(ids)) {
                  setLikedSongIds(new Set(ids));
              }
          } catch (e) {
              console.error("Failed to parse liked songs", e);
          }
      }
  }, []);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auth Listener
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Songs from Supabase
  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('songs')
          .select('*')
          .order('added_at', { ascending: false });

        if (error) {
           console.warn('Supabase fetch error (using mock data):', error.message);
           setMyLibrary(MOCK_SONGS);
        } else if (data && data.length > 0) {
           const mappedSongs: Song[] = data.map((item: any) => ({
             id: item.id,
             title: item.title,
             artist: item.artist,
             album: item.album,
             coverUrl: item.cover_url || item.coverUrl, 
             audioUrl: item.audio_url || item.audioUrl,
             lyricsUrl: item.lyrics_url || item.lyricsUrl,
             addedAt: item.added_at || item.addedAt,
             description: item.description
           }));
           setMyLibrary(mappedSongs);
        } else {
           // Fallback if data is empty (e.g. table just created)
           setMyLibrary(MOCK_SONGS);
        }
      } catch (err) {
        console.error("Unexpected error fetching songs:", err);
        setMyLibrary(MOCK_SONGS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const handleAddSong = async (song: Song) => {
    try {
        const dbSong = {
            id: song.id,
            title: song.title,
            artist: song.artist,
            album: song.album,
            cover_url: song.coverUrl,
            audio_url: song.audioUrl,
            lyrics_url: song.lyricsUrl,
            added_at: song.addedAt,
            description: song.description,
            created_by: user?.id
        };

        const { error } = await supabase.from('songs').insert([dbSong]);

        if (error) {
            console.error("Error adding song to Supabase:", error.message);
            // Fallback: Update local state anyway
            setMyLibrary(prev => [song, ...prev]);
            alert(`Song added to local session only.\n\nCloud Save Failed: ${error.message}`);
        } else {
            setMyLibrary(prev => [song, ...prev]);
        }
    } catch (e) {
        console.error("Exception adding song:", e);
        setMyLibrary(prev => [song, ...prev]);
    }
  };

  const handleDeleteSong = async (song: Song) => {
      if (!window.confirm(`Are you sure you want to delete "${song.title}"?`)) {
          return;
      }

      // Optimistic update
      const prevLibrary = [...myLibrary];
      setMyLibrary(prev => prev.filter(s => s.id !== song.id));

      try {
          const { error } = await supabase.from('songs').delete().eq('id', song.id);
          if (error) {
              console.error("Error deleting song:", error.message);
              // Revert
              setMyLibrary(prevLibrary);
              alert("Failed to delete song from cloud: " + error.message);
          }
      } catch (e) {
          console.error("Exception deleting song:", e);
          setMyLibrary(prevLibrary);
      }
  };

  const handleToggleLike = (songId?: string) => {
      if (!songId) return;
      const newSet = new Set(likedSongIds);
      if (newSet.has(songId)) {
          newSet.delete(songId);
      } else {
          newSet.add(songId);
      }
      setLikedSongIds(newSet);
      localStorage.setItem('cloudmusic_liked_ids', JSON.stringify(Array.from(newSet)));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsUserMenuOpen(false);
    setIsEditMode(false);
  };

  const handlePlay = (song: Song) => {
    setCurrentSong(song);
  };

  const handleNext = () => {
    if (!currentSong) return;
    const currentIndex = myLibrary.findIndex(s => s.id === currentSong.id);
    if (currentIndex < myLibrary.length - 1) {
        setCurrentSong(myLibrary[currentIndex + 1]);
    } else {
        setCurrentSong(myLibrary[0]);
    }
  };

  const handlePrev = () => {
    if (!currentSong) return;
    const currentIndex = myLibrary.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
        setCurrentSong(myLibrary[currentIndex - 1]);
    } else {
        setCurrentSong(myLibrary[myLibrary.length - 1]);
    }
  };

  const handleViewChange = (view: View) => {
      setActiveView(view);
      setSelectedArtist(null);
      setSelectedAlbum(null);
      // Turn off edit mode when switching views mostly
      setIsEditMode(false);
  };

  // --- View Logic ---

  const getDisplayedContent = () => {
      // Common Props for Grid
      const gridProps = {
          onPlay: handlePlay,
          isEditMode: isEditMode && isAdmin,
          onDelete: handleDeleteSong
      };

      if (activeView === View.LIKED) {
          const likedSongs = myLibrary.filter(s => likedSongIds.has(s.id));
          if (likedSongs.length === 0) {
               return (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="bg-gray-100 p-6 rounded-full mb-4">
                          <Heart size={48} className="text-gray-300" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-700 mb-2">No Liked Songs</h2>
                      <p className="text-gray-500">Tap the heart icon on any song to add it here.</p>
                  </div>
               );
          }
          return <MusicGrid title="Liked Songs" songs={likedSongs} {...gridProps} />;
      }

      if (activeView === View.SONGS) {
          return <MusicGrid title="Songs" songs={myLibrary} {...gridProps} />;
      }
      
      if (activeView === View.RECENTLY_ADDED) {
          const sorted = [...myLibrary].sort((a, b) => b.addedAt - a.addedAt);
          return <MusicGrid title="Recently Added" songs={sorted} {...gridProps} />;
      }

      if (activeView === View.ARTISTS) {
          if (selectedArtist) {
              const artistSongs = myLibrary.filter(s => s.artist === selectedArtist);
              return (
                  <div>
                      <div className="flex items-center mb-6">
                        <button onClick={() => setSelectedArtist(null)} className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <ArrowLeft size={24} className="text-apple-accent" />
                        </button>
                        <h2 className="text-3xl font-bold text-gray-900">{selectedArtist}</h2>
                      </div>
                      <MusicGrid title="Songs" songs={artistSongs} {...gridProps} />
                  </div>
              );
          } else {
              // Group by Artist
              const artistsMap = new Map<string, Song>();
              myLibrary.forEach(song => {
                  if (!artistsMap.has(song.artist)) {
                      artistsMap.set(song.artist, song);
                  }
              });
              
              const artistItems = Array.from(artistsMap.values()).map(song => ({
                  ...song,
                  id: song.artist, 
                  title: song.artist,
                  artist: 'Artist',
                  description: 'Artist'
              }));

              return (
                <MusicGrid 
                    title="Artists" 
                    songs={artistItems} 
                    onPlay={(item) => setSelectedArtist(item.title)}
                    // No edit mode in category view
                />
              );
          }
      }

      if (activeView === View.ALBUMS) {
        if (selectedAlbum) {
            const albumSongs = myLibrary.filter(s => s.album === selectedAlbum);
            return (
                <div>
                    <div className="flex items-center mb-6">
                      <button onClick={() => setSelectedAlbum(null)} className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors">
                          <ArrowLeft size={24} className="text-apple-accent" />
                      </button>
                      <h2 className="text-3xl font-bold text-gray-900">{selectedAlbum}</h2>
                    </div>
                    <MusicGrid title="Songs" songs={albumSongs} {...gridProps} />
                </div>
            );
        } else {
            // Group by Album
            const albumsMap = new Map<string, Song>();
            myLibrary.forEach(song => {
                if (!albumsMap.has(song.album)) {
                    albumsMap.set(song.album, song);
                }
            });
            
            const albumItems = Array.from(albumsMap.values()).map(song => ({
                ...song,
                id: song.album, 
                title: song.album,
                artist: song.artist,
                description: 'Album'
            }));

            return (
              <MusicGrid 
                  title="Albums" 
                  songs={albumItems} 
                  onPlay={(item) => setSelectedAlbum(item.title)} 
                  // No edit mode in category view
              />
            );
        }
    }

      return null;
  };

  const isAdmin = isUserAdmin(user?.email);

  return (
    <div className="flex h-screen bg-apple-bg text-apple-text overflow-hidden font-sans select-none">
      
      {/* Sidebar */}
      <aside className="hidden md:block w-[260px] flex-shrink-0 z-20">
        <Sidebar activeView={activeView} onChangeView={handleViewChange} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Header / Top Bar */}
        <header className="h-16 flex items-center justify-between px-8 bg-apple-bg/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200/50">
           <div className="md:hidden font-bold text-xl text-gray-900">CloudMusic</div>
           <div className="hidden md:block"></div> {/* Spacer */}
           
           <div className="flex items-center space-x-5">
              
              {isEditMode && (
                  <div className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full uppercase tracking-wide">
                      Editing
                  </div>
              )}

              <button className="text-gray-500 hover:text-gray-700">
                <Bell size={20} />
              </button>

              {user ? (
                  <div className="relative" ref={userMenuRef}>
                      <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center space-x-2 focus:outline-none"
                      >
                          <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden border border-gray-200">
                             <img 
                                src={user.user_metadata?.avatar_url || "https://picsum.photos/id/64/100/100"} 
                                alt="Avatar" 
                                className="h-full w-full object-cover" 
                             />
                          </div>
                          <ChevronDown size={14} className={`text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Avatar Dropdown Menu */}
                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                           <div className="px-4 py-3 border-b border-gray-50">
                             <p className="text-sm font-semibold text-gray-900 truncate">My Account</p>
                             <p className="text-xs text-gray-500 truncate">{user.email}</p>
                           </div>
                           
                           <div className="py-1">
                             {isAdmin && (
                               <>
                                 <button 
                                   onClick={() => { setIsAddModalOpen(true); setIsUserMenuOpen(false); }}
                                   className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-apple-accent flex items-center space-x-2"
                                 >
                                    <Plus size={16} />
                                    <span>Add Music</span>
                                 </button>
                                 <button 
                                   onClick={() => { setIsEditMode(!isEditMode); setIsUserMenuOpen(false); }}
                                   className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-apple-accent flex items-center space-x-2"
                                 >
                                    {isEditMode ? <Check size={16} className="text-green-500" /> : <Edit3 size={16} />}
                                    <span>{isEditMode ? 'Done Editing' : 'Edit Library'}</span>
                                 </button>
                               </>
                             )}
                             <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                                <Settings size={16} />
                                <span>Settings</span>
                             </button>
                           </div>

                           <div className="border-t border-gray-50 py-1">
                             <button 
                               onClick={handleSignOut}
                               className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center space-x-2"
                             >
                                <LogOut size={16} />
                                <span>Sign Out</span>
                             </button>
                           </div>
                        </div>
                      )}
                  </div>
              ) : (
                  <button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                     <LogIn size={16} />
                     <span>Sign In</span>
                  </button>
              )}
           </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 pb-32">
          
          {isLoading ? (
             <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-accent"></div>
             </div>
          ) : (
            <div className="max-w-[1600px] mx-auto min-h-full">
                {myLibrary.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">Your library is empty.</p>
                        {isAdmin && (
                            <button onClick={() => setIsAddModalOpen(true)} className="text-apple-accent hover:underline mt-2">Add some music</button>
                        )}
                    </div>
                ) : (
                    getDisplayedContent()
                )}
            </div>
          )}

        </div>
      </main>

      {/* Sticky Player */}
      <Player 
        currentSong={currentSong} 
        onNext={handleNext} 
        onPrev={handlePrev}
        isLiked={currentSong ? likedSongIds.has(currentSong.id) : false}
        onLikeToggle={() => currentSong && handleToggleLike(currentSong.id)}
      />

      {/* Add Music Modal */}
      <AddMusicModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddSong} 
      />

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}