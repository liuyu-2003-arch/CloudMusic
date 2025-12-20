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
  },
  {
    id: '2',
    title: 'Jem 的电台',
    artist: '广播电台',
    album: 'Jem FM',
    coverUrl: 'https://images.unsplash.com/photo-1514525253344-013190805c89?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    addedAt: Date.now() - 10000,
    description: 'Upbeat electronic mixes perfect for late night drives.'
  }
];

export const AMBIENT_COLLECTION: Song[] = [
  {
    id: 'ambient-1',
    title: 'Zen Garden',
    artist: 'Kyoto Echoes',
    album: 'Eastern Calm',
    coverUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a98039f5?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    addedAt: Date.now(),
    description: 'Minimalist koto and bamboo flute melodies for deep focus.'
  },
  {
    id: 'ambient-2',
    title: 'Midnight Rain',
    artist: 'Atmosphere',
    album: 'Nature Elements',
    coverUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    addedAt: Date.now(),
    description: 'Soothing rain sounds mixed with soft cinematic pads.'
  },
  {
    id: 'ambient-3',
    title: 'Lo-Fi Morning',
    artist: 'Chill Station',
    album: 'Study Beats',
    coverUrl: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    addedAt: Date.now(),
    description: 'Dusty vinyl crackle and jazzy chords to start your day.'
  },
  {
    id: 'ambient-4',
    title: 'Mountain Stream',
    artist: 'Wilderness',
    album: 'Pure Nature',
    coverUrl: 'https://images.unsplash.com/photo-1433086177607-6c3031070595?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    addedAt: Date.now(),
    description: 'Crystal clear water flowing over pebbles. Pure organic sound.'
  },
  {
    id: 'ambient-5',
    title: 'Starlight Piano',
    artist: 'Elara Moon',
    album: 'Solitude',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    addedAt: Date.now(),
    description: 'Ethereal piano solo recorded in a large cathedral.'
  }
];

export const LIBRARY_ITEMS = [
  { id: 'recently_added', label: 'Recently Added', icon: 'Clock' },
  { id: 'artists', label: 'Artists', icon: 'Mic2' },
  { id: 'albums', label: 'Albums', icon: 'Disc' },
  { id: 'songs', label: 'Songs', icon: 'Music' },
  { id: 'liked', label: 'Liked Songs', icon: 'Heart' },
];