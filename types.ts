export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl?: string;
  lyricsUrl?: string;
  addedAt: number;
  description?: string;
  isUploading?: boolean; // New property to track background upload status
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
}

export enum View {
  RECENTLY_ADDED = 'RECENTLY_ADDED',
  ARTISTS = 'ARTISTS',
  ALBUMS = 'ALBUMS',
  SONGS = 'SONGS',
  LIKED = 'LIKED'
}