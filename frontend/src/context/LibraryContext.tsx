import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Track } from '../types';

export interface UserPlaylist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
}

interface LibraryContextType {
  likedSongs: Track[];
  history: Track[];
  playlists: UserPlaylist[];
  toggleLike: (track: Track) => void;
  isLiked: (videoId: string) => boolean;
  addToHistory: (track: Track) => void;
  createPlaylist: (name: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, videoId: string) => void;
  deletePlaylist: (playlistId: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [likedSongs, setLikedSongs] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('ytm_liked_songs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('ytm_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [playlists, setPlaylists] = useState<UserPlaylist[]>(() => {
    try {
      const saved = localStorage.getItem('ytm_playlists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ytm_liked_songs', JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem('ytm_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('ytm_playlists', JSON.stringify(playlists));
  }, [playlists]);

  const toggleLike = (track: Track) => {
    setLikedSongs(prev => {
      const exists = prev.some(t => t.videoId === track.videoId);
      if (exists) {
        return prev.filter(t => t.videoId !== track.videoId);
      } else {
        return [track, ...prev];
      }
    });
  };

  const isLiked = (videoId: string) => {
    return likedSongs.some(t => t.videoId === videoId);
  };

  const addToHistory = (track: Track) => {
    setHistory(prev => {
      const filtered = prev.filter(t => t.videoId !== track.videoId);
      return [track, ...filtered].slice(0, 100); // keep last 100
    });
  };

  const createPlaylist = (name: string) => {
    if (!name.trim()) return;
    const newPl: UserPlaylist = {
      id: 'pl_' + Date.now(),
      name: name.trim(),
      tracks: [],
      createdAt: Date.now()
    };
    setPlaylists(prev => [newPl, ...prev]);
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        if (pl.tracks.some(t => t.videoId === track.videoId)) return pl;
        return { ...pl, tracks: [...pl.tracks, track] };
      }
      return pl;
    }));
  };

  const removeTrackFromPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, tracks: pl.tracks.filter(t => t.videoId !== videoId) };
      }
      return pl;
    }));
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(pl => pl.id !== playlistId));
  };

  return (
    <LibraryContext.Provider value={{
      likedSongs,
      history,
      playlists,
      toggleLike,
      isLiked,
      addToHistory,
      createPlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      deletePlaylist
    }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within a LibraryProvider');
  return context;
};
