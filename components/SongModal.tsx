import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { X, Plus, Save, Loader2, Trash2, Music, Upload, FileAudio, FileText, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { getSongMetadata } from '../services/geminiService';

interface SongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (song: Song, files?: { cover?: File; audio?: File; lyrics?: File }) => void;
  onDelete?: (song: Song) => void;
  editingSong?: Song | null;
}

const SongModal: React.FC<SongModalProps> = ({ isOpen, onClose, onSave, onDelete, editingSong }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [lyricsUrl, setLyricsUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Local file storage instead of immediate upload
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [lyricsFile, setLyricsFile] = useState<File | null>(null);

  const resetForm = () => {
    setTitle('');
    setArtist('');
    setAlbum('');
    setCoverUrl('');
    setAudioUrl('');
    setLyricsUrl('');
    setCoverFile(null);
    setAudioFile(null);
    setLyricsFile(null);
    setIsDeleting(false);
  };

  const parseFileName = (fileName: string) => {
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    const parts = nameWithoutExt.split(' - ').map(s => s.trim());
    if (parts.length >= 3) return { artist: parts[0], album: parts[1], title: parts[2] };
    else if (parts.length === 2) return { artist: parts[0], title: parts[1], album: '' };
    return { title: nameWithoutExt, artist: '', album: '' };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'audio' | 'lyrics') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'cover') { setCoverFile(file); setCoverUrl(URL.createObjectURL(file)); }
    if (type === 'audio') {
        setAudioFile(file);
        const extracted = parseFileName(file.name);
        if (!title) setTitle(extracted.title);
        if (!artist) setArtist(extracted.artist);
        if (!album && extracted.album) setAlbum(extracted.album);
    }
    if (type === 'lyrics') setLyricsFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let description = editingSong?.description;
    if (!editingSong || editingSong.title !== title || editingSong.artist !== artist) {
      const metadata = await getSongMetadata(title, artist);
      description = metadata.description;
    }
    const updatedSong: Song = {
      id: editingSong ? editingSong.id : Date.now().toString(),
      title, artist, album: album || 'Single',
      coverUrl: coverUrl || `https://picsum.photos/seed/${title}/400/400`,
      audioUrl: audioUrl || undefined, lyricsUrl: lyricsUrl || undefined,
      addedAt: editingSong ? editingSong.addedAt : Date.now(),
      description: description, isUploading: !!(coverFile || audioFile || lyricsFile)
    };
    onSave(updatedSong, { cover: coverFile || undefined, audio: audioFile || undefined, lyrics: lyricsFile || undefined });
    setLoading(false);
    onClose();
  };

  const handleDelete = () => {
    if (editingSong && onDelete) {
      setIsDeleting(true);
      onDelete(editingSong);
      // Close modal shortly after triggering delete to let animation play out in grid
      setTimeout(onClose, 200);
    }
  };

  useEffect(() => {
    if (editingSong) {
      setTitle(editingSong.title || '');
      setArtist(editingSong.artist || '');
      setAlbum(editingSong.album || '');
      setCoverUrl(editingSong.coverUrl || '');
      setAudioUrl(editingSong.audioUrl || '');
      setLyricsUrl(editingSong.lyricsUrl || '');
      setCoverFile(null); setAudioFile(null); setLyricsFile(null);
      setIsDeleting(false);
    } else { resetForm(); }
  }, [editingSong, isOpen]);

  if (!isOpen) return null;

  const FileField = ({ label, id, accept, file, icon: Icon, onChange }: { label: string, id: string, accept: string, file: File | null, icon: any, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="space-y-1.5 min-w-0">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-tighter">{label}</label>
      <div className={`relative flex items-center justify-between w-full bg-gray-100 rounded-xl px-4 py-3 border-2 border-dashed transition-all ${file ? 'border-green-500 bg-green-50' : 'border-transparent hover:border-gray-300'}`}>
        <div className="flex items-center space-x-3 overflow-hidden min-w-0 flex-1 mr-2">
          <div className="flex-shrink-0">
            {file ? <CheckCircle2 size={20} className="text-green-500" /> : <Icon size={20} className="text-gray-400" />}
          </div>
          <span className={`text-sm font-medium truncate ${file ? 'text-green-700' : 'text-gray-500'}`}>{file ? file.name : `Select ${label.toLowerCase()} file`}</span>
        </div>
        <input type="file" id={id} accept={accept} onChange={onChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        {!file && <Upload size={18} className="text-gray-400 flex-shrink-0" />}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">{editingSong ? 'Edit Music' : 'Add Music'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"><X size={20} /></button>
        </div>
        <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-[320px] flex-shrink-0 bg-gray-50/50 p-8 border-r border-gray-100 flex flex-col items-center justify-center space-y-6">
                <div className="w-full aspect-square bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 flex items-center justify-center relative group">
                    {coverUrl ? <img src={coverUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Cover'; }} /> : <div className="flex flex-col items-center text-gray-300"><Music size={64} strokeWidth={1.5} /><span className="text-xs font-medium mt-2">Preview Image</span></div>}
                </div>
                <div className="text-center w-full px-2">
                    <h4 className="text-xl font-bold text-gray-900 truncate leading-tight">{title || 'Untitled'}</h4>
                    <p className="text-base font-medium text-gray-500 truncate mt-1">{artist || 'Unknown Artist'}</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-6 min-w-0">
                <div className="grid grid-cols-2 gap-4">
                    <div className="min-w-0">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1.5">Title</label>
                        <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-100 border border-transparent rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-apple-accent focus:border-apple-accent/20 focus:outline-none transition-all" placeholder="Song Title" />
                    </div>
                    <div className="min-w-0">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1.5">Artist</label>
                        <input required value={artist} onChange={e => setArtist(e.target.value)} className="w-full bg-gray-100 border border-transparent rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-apple-accent focus:border-apple-accent/20 focus:outline-none transition-all" placeholder="Artist Name" />
                    </div>
                </div>
                <div className="min-w-0">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1.5">Album</label>
                    <input value={album} onChange={e => setAlbum(e.target.value)} className="w-full bg-gray-100 border border-transparent rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-apple-accent focus:border-apple-accent/20 focus:outline-none transition-all" placeholder="Album Name" />
                </div>
                <div className="space-y-4 min-w-0">
                  <FileField label="Cover Image" id="cover-upload" accept="image/*" file={coverFile} icon={ImageIcon} onChange={(e) => handleFileSelect(e, 'cover')} />
                  <FileField label="Audio File (MP3/WAV)" id="audio-upload" accept="audio/*" file={audioFile} icon={FileAudio} onChange={(e) => handleFileSelect(e, 'audio')} />
                  <FileField label="Lyrics File (SRT/LRC)" id="lyrics-upload" accept=".srt,.lrc,.txt" file={lyricsFile} icon={FileText} onChange={(e) => handleFileSelect(e, 'lyrics')} />
                </div>
                <div className="pt-2 flex items-center gap-3">
                    {editingSong && !loading && (
                        <button type="button" onClick={handleDelete} disabled={isDeleting} className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all border border-red-100 shrink-0 shadow-sm active:scale-90 disabled:opacity-50"><Trash2 size={20} /></button>
                    )}
                    <button type="submit" disabled={loading || isDeleting} className={`flex-1 ${editingSong ? 'bg-blue-600 hover:bg-blue-700' : 'bg-apple-accent hover:bg-red-600'} text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50`}>
                        {loading ? <><Loader2 size={18} className="animate-spin" /><span>Processing...</span></> : <>{editingSong ? <Save size={18} /> : <Plus size={18} />}<span>{editingSong ? 'Save Changes' : 'Add to My Collection'}</span></>}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default SongModal;