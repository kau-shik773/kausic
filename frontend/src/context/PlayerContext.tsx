import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import type { Track, AdBlockStats } from '../types';
import { useLibrary } from './LibraryContext';
import { audioEngine } from '../services/audioEngine';
import { offlineStorage } from '../services/offlineStorage';
import { fetchApi, getApiBase } from '../config/api';
import { KausicMedia } from '../services/nativeMedia';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: 'off' | 'one' | 'all';
  queue: Track[];
  queueIndex: number;
  isLoadingStream: boolean;
  lyricsOpen: boolean;
  queueOpen: boolean;
  fullscreenOpen: boolean;
  equalizerOpen: boolean;
  adblockStats: AdBlockStats;
  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setLyricsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setQueueOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setFullscreenOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setEqualizerOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  startRadio: (track: Track) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToHistory } = useLibrary();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState<'off' | 'one' | 'all'>('off');
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isLoadingStream, setIsLoadingStream] = useState(false);

  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [equalizerOpen, setEqualizerOpen] = useState(false);

  const [adblockStats, setAdblockStats] = useState<AdBlockStats>({
    blocked_ad_requests: 0,
    sanitized_cue_points: 0,
    bypassed_interstitials: 0,
    saved_bandwidth_mb: 0
  });

  const fetchAdblockStats = useCallback(async () => {
    try {
      const stats = await fetchApi<AdBlockStats>('/adblock/stats');
      if (stats) {
        setAdblockStats(stats);
      }
    } catch {
      // ignore
    }
  }, []);

  // Initialize Audio & WebAudio Engine
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.volume = volume;
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    audio.style.position = 'fixed';
    audio.style.bottom = '-9999px';
    document.body.appendChild(audio);
    audioRef.current = audio;

    audioEngine.init(audio);

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      console.error('[KAUSIC Audio Error]', audio.error?.code, audio.error?.message);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      if (audio.parentNode) {
        audio.parentNode.removeChild(audio);
      }
    };
  }, []);

  // Update MediaSession for Android Lock Screen & Notification Controls
  useEffect(() => {
    if (!currentTrack) {
      KausicMedia.clear().catch(() => {});
      return;
    }

    const artistName = currentTrack.artists?.map(a => a.name).join(', ') || 'KAUSIC Artist';
    const artworkUrl = currentTrack.thumbnails?.[currentTrack.thumbnails.length - 1]?.url ||
      currentTrack.thumbnails?.[0]?.url ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=512';

    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: artistName,
          album: currentTrack.album?.name || 'KAUSIC Sound System',
          artwork: [
            { src: artworkUrl, sizes: '96x96', type: 'image/png' },
            { src: artworkUrl, sizes: '128x128', type: 'image/png' },
            { src: artworkUrl, sizes: '192x192', type: 'image/png' },
            { src: artworkUrl, sizes: '256x256', type: 'image/png' },
            { src: artworkUrl, sizes: '384x384', type: 'image/png' },
            { src: artworkUrl, sizes: '512x512', type: 'image/png' },
          ]
        });
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      } catch (e) {
        console.warn('Error updating MediaSession metadata:', e);
      }
    }

    // Call Native Android Media Service Plugin for true lock screen & notification controls
    KausicMedia.update({
      title: currentTrack.title,
      artist: artistName,
      album: currentTrack.album?.name || 'KAUSIC Sound System',
      artworkUrl,
      isPlaying,
      duration: duration || 0,
      position: currentTime || 0
    }).catch(() => {});
  }, [currentTrack?.videoId, isPlaying, duration]);

  const playTrackInternal = useCallback(async (track: Track) => {
    if (!audioRef.current) return;
    setIsLoadingStream(true);
    setCurrentTrack(track);
    addToHistory(track);
    await audioEngine.resume();

    try {
      // 1. Check offline IndexedDB storage first for instant zero-buffering playback
      const offlineUrl = await offlineStorage.getAudioBlobUrl(track.videoId);
      if (offlineUrl && audioRef.current) {
        audioRef.current.src = offlineUrl;
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoadingStream(false);
        return;
      }

      // 2. Fetch live clean audio stream from backend
      let streamUrl: string | undefined;
      let proxyUrl: string | undefined;

      try {
        const data = await fetchApi<{ stream_url?: string; proxy_url?: string }>(`/stream?id=${track.videoId}`);
        if (data?.stream_url) {
          streamUrl = data.stream_url;
          proxyUrl = data.proxy_url ? `${getApiBase().replace('/api', '')}${data.proxy_url}` : undefined;
        }
      } catch (e) {
        console.warn('[KAUSIC Audio Engine] Cloud backend stream fetch delayed or failed:', e);
      }

      // 3. Fallback: direct mobile-to-InnerTube resolution if cloud endpoint is slow/unavailable
      if (!streamUrl) {
        console.log('[KAUSIC Audio Engine] Engaging native client InnerTube resolver for:', track.videoId);
        try {
          const { CapacitorHttp } = await import('@capacitor/core');
          const response = await CapacitorHttp.post({
            url: 'https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqaeukImAQ26irlAyFullm2-qc',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip'
            },
            data: {
              context: {
                client: {
                  clientName: 'ANDROID',
                  clientVersion: '20.10.38',
                  androidSdkVersion: 30,
                  hl: 'en',
                  gl: 'IN'
                }
              },
              videoId: track.videoId
            }
          });
          const formats = response.data?.streamingData?.adaptiveFormats || response.data?.streamingData?.formats || [];
          const audio = formats.filter((f: any) => f.mimeType?.includes('audio') && f.url);
          if (audio.length > 0) {
            audio.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
            streamUrl = audio[0].url;
            console.log('[KAUSIC Audio Engine] Native mobile InnerTube stream resolved successfully!');
          }
        } catch (clientErr) {
          console.warn('[KAUSIC Audio Engine] Native InnerTube resolver error:', clientErr);
        }
      }

      if (audioRef.current && (streamUrl || proxyUrl)) {
        const tryPlayUrl = async (url: string): Promise<boolean> => {
          try {
            console.log('[KAUSIC Audio Engine] Loading audio stream:', url.slice(0, 60) + '...');
            if (!audioRef.current) return false;
            audioRef.current.src = url;
            audioRef.current.currentTime = 0;
            await audioEngine.resume();
            await audioRef.current.play();
            setIsPlaying(true);
            return true;
          } catch (e) {
            console.warn('[KAUSIC Audio Engine] Stream URL failed, trying fallback:', e);
            return false;
          }
        };

        let played = false;
        if (streamUrl) {
          played = await tryPlayUrl(streamUrl);
        }
        if (!played && proxyUrl) {
          console.log('[KAUSIC Audio Engine] Falling back to backend audio proxy stream...');
          played = await tryPlayUrl(proxyUrl);
        }
        if (!played) {
          throw new Error('All audio stream playback attempts failed');
        }
        fetchAdblockStats();
      }
    } catch (err) {
      console.error('Playback error:', err);
      setIsPlaying(false);
    } finally {
      setIsLoadingStream(false);
    }
  }, [addToHistory, fetchAdblockStats]);

  const playTrack = async (track: Track, newQueue?: Track[]) => {
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      const idx = newQueue.findIndex(t => t.videoId === track.videoId);
      setQueueIndex(idx >= 0 ? idx : 0);
    } else {
      setQueue(prev => {
        const exists = prev.findIndex(t => t.videoId === track.videoId);
        if (exists >= 0) {
          setQueueIndex(exists);
          return prev;
        } else {
          const updated = [...prev, track];
          setQueueIndex(updated.length - 1);
          return updated;
        }
      });
    }

    await playTrackInternal(track);

    // Proactively pre-warm next song in queue for instant 0ms switching
    const effectiveQueue = (newQueue && newQueue.length > 0) ? newQueue : queue;
    const currentPos = effectiveQueue.findIndex(t => t.videoId === track.videoId);
    if (currentPos >= 0 && currentPos + 1 < effectiveQueue.length) {
      const nextSong = effectiveQueue[currentPos + 1];
      if (nextSong?.videoId) {
        fetchApi(`/prefetch?id=${nextSong.videoId}`).catch(() => {});
      }
    }
  };

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;

    if (isRepeat === 'one' && currentTrack) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (isRepeat === 'all') {
        nextIdx = 0;
      } else {
        return;
      }
    }

    setQueueIndex(nextIdx);
    playTrackInternal(queue[nextIdx]);

    // Proactively prefetch track after next
    if (nextIdx + 1 < queue.length) {
      const nextAfter = queue[nextIdx + 1];
      if (nextAfter?.videoId) {
        fetchApi(`/prefetch?id=${nextAfter.videoId}`).catch(() => {});
      }
    }
  }, [queue, queueIndex, isRepeat, isShuffle, currentTrack, playTrackInternal]);

  const prevTrack = () => {
    if (!audioRef.current) return;
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (queue.length === 0) return;
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    setQueueIndex(prevIdx);
    playTrackInternal(queue[prevIdx]);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      nextTrack();
    };

    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [nextTrack]);

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    audioEngine.resume();
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const seek = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  };

  const setVolume = (vol: number) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(1, vol));
    audioRef.current.volume = clamped;
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleShuffle = () => setIsShuffle(prev => !prev);

  const toggleRepeat = () => {
    setIsRepeat(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  // Sync MediaSession playbackState with actual state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {
      // ignore
    }
  }, [isPlaying]);

  // Sync MediaSession seekbar position state
  useEffect(() => {
    if (!('mediaSession' in navigator) || !audioRef.current) return;
    try {
      if (duration && !isNaN(duration) && duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: Math.max(0, duration),
          playbackRate: 1,
          position: Math.min(Math.max(0, currentTime), duration)
        });
      }
    } catch {
      // ignore
    }
  }, [currentTime, duration]);

  // Wire MediaSession Action Handlers for Lock Screen & Notification controls
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current && currentTrack) {
          audioEngine.resume();
          audioRef.current.play();
          setIsPlaying(true);
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        prevTrack();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextTrack();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && details.seekTime !== null && audioRef.current) {
          seek(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10;
        if (audioRef.current) {
          seek(Math.max(0, audioRef.current.currentTime - offset));
        }
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10;
        if (audioRef.current) {
          seek(Math.min(duration || 9999, audioRef.current.currentTime + offset));
        }
      });
    } catch (e) {
      console.warn('Error setting MediaSession handlers:', e);
    }
  }, [currentTrack, duration, nextTrack, prevTrack, seek]);

  const actionsRef = useRef({
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    isPlaying
  });
  actionsRef.current = {
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    isPlaying
  };

  // Wire Native Android Media Actions from Notification & Lockscreen
  useEffect(() => {
    let removeListener: (() => void) | undefined;

    KausicMedia.addListener('mediaAction', (data) => {
      const actions = actionsRef.current;
      if (data.action === 'play') {
        if (audioRef.current && !actions.isPlaying) {
          audioEngine.resume();
          audioRef.current.play();
          setIsPlaying(true);
        }
      } else if (data.action === 'pause') {
        if (audioRef.current && actions.isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      } else if (data.action === 'toggle') {
        actions.togglePlay();
      } else if (data.action === 'next') {
        actions.nextTrack();
      } else if (data.action === 'prev') {
        actions.prevTrack();
      } else if (data.action === 'seek' && data.position !== undefined) {
        actions.seek(data.position);
      }
    }).then(handle => {
      removeListener = () => handle.remove();
    }).catch(() => {});

    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  const startRadio = async (track: Track) => {
    try {
      const data = await fetchApi<{ tracks?: any[] }>(`/radio?id=${track.videoId}`);
      if (data && data.tracks) {
        const rawTracks = data.tracks || [];
        const radioQueue: Track[] = rawTracks.map((t: any) => ({
          videoId: t.videoId,
          title: t.title,
          artists: t.artists || [{ name: t.byline || 'Unknown' }],
          album: t.album ? { name: t.album.name || t.album } : undefined,
          duration: t.length,
          thumbnails: t.thumbnail || t.thumbnails || []
        }));

        const combined = [track, ...radioQueue.filter(t => t.videoId !== track.videoId)];
        setQueue(combined);
        setQueueIndex(0);
        await playTrackInternal(track);
      } else {
        await playTrack(track);
      }
    } catch {
      await playTrack(track);
    }
  };

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      isShuffle,
      isRepeat,
      queue,
      queueIndex,
      isLoadingStream,
      lyricsOpen,
      queueOpen,
      fullscreenOpen,
      equalizerOpen,
      adblockStats,
      playTrack,
      togglePlay,
      seek,
      setVolume,
      toggleMute,
      nextTrack,
      prevTrack,
      toggleShuffle,
      toggleRepeat,
      setLyricsOpen,
      setQueueOpen,
      setFullscreenOpen,
      setEqualizerOpen,
      startRadio
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};
