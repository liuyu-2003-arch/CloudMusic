import { Song } from './types';

export const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Nocturnal Animals',
    artist: 'Abel Korzeniowski',
    album: 'Original Soundtrack',
    coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    addedAt: Date.now(),
    description: 'A hauntingly beautiful orchestral piece with deep emotional resonance.'
  }
];

export const AMBIENT_COLLECTION: Song[] = [
  {
    id: 'zen-1',
    title: 'Pure Silence',
    artist: 'Deep Meditation',
    album: 'Zen Moments',
    coverUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a98039f5?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    addedAt: Date.now(),
    description: 'Extremely quiet low-frequency drones for deep focus and sleep.'
  },
  {
    id: 'zen-2',
    title: 'Minimalist Piano',
    artist: 'Simeon Walker',
    album: 'Soft Keys',
    coverUrl: 'https://images.unsplash.com/photo-1520529611473-d58ff3f47a3e?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    addedAt: Date.now(),
    description: 'Soft, sparse piano notes with plenty of space and breath.'
  },
  {
    id: 'zen-3',
    title: 'Forest Whispers',
    artist: 'Nature Sounds',
    album: 'Organic Earth',
    coverUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    addedAt: Date.now(),
    description: 'Gentle wind through leaves and distant birds. No music, just nature.'
  },
  {
    id: 'zen-4',
    title: 'Deep Space Ambient',
    artist: 'Ethereal',
    album: 'Void',
    coverUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    addedAt: Date.now(),
    description: 'Slow-moving cosmic pads that create a sense of weightlessness.'
  },
  {
    id: 'zen-5',
    title: 'Morning Dew',
    artist: 'Acoustic Soul',
    album: 'Quiet Mornings',
    coverUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
    addedAt: Date.now(),
    description: 'Very soft fingerstyle guitar recorded in a wooden room.'
  },
  {
    id: 'zen-6',
    title: 'Rainy Night In Tokyo',
    artist: 'Lo-Fi City',
    album: 'Urban Rain',
    coverUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    addedAt: Date.now(),
    description: 'Pure rain sounds against a window. Calm, consistent, and peaceful.'
  }
];

export const LIBRARY_ITEMS = [
  { id: 'recently_added', label: 'Recently Added', icon: 'Clock' },
  { id: 'artists', label: 'Artists', icon: 'Mic2' },
  { id: 'albums', label: 'Albums', icon: 'Disc' },
  { id: 'songs', label: 'Songs', icon: 'Music' },
  { id: 'liked', label: 'Liked Songs', icon: 'Heart' },
];