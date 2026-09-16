import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PlayerBar } from './components/PlayerBar';
import { BottomNavigationDock } from './components/BottomNavigationDock';
import { TrackRow } from './components/TrackRow';
import { LyricsDrawer } from './components/LyricsDrawer';
import { QueueDrawer } from './components/QueueDrawer';
import { FullscreenPlayer } from './components/FullscreenPlayer';
import { EqualizerModal } from './components/EqualizerModal';
import { BootScreen } from './components/BootScreen';
import { OfflineDownloadsView } from './components/OfflineDownloadsView';
import { useLibrary } from './context/LibraryContext';
import { usePlayer } from './context/PlayerContext';
import type { Track } from './types';
import {
  Play,
  Shuffle,
  Search,
  X,
  Sparkles,
  Music,
  Trash2,
  Loader2
} from 'lucide-react';

import { fetchApi, detectActiveBackend, FALLBACK_TOP_HITS } from './config/api';

interface CategoryConfig {
  id: string;
  name: string;
  emoji: string;
  desc: string;
}

const REGIONAL_CATEGORIES: CategoryConfig[] = [
  { id: 'punjabi', name: 'Punjabi Top 50', emoji: '🦁', desc: 'Moose Wala, Karan Aujla, Diljit, Shubh & Fresh Beats' },
  { id: 'hindi', name: 'Hindi Top 50', emoji: '💖', desc: 'Bollywood Chartbusters, Arijit Singh, Vishal Mishra' },
  { id: 'haryanvi', name: 'Haryanvi Top 50', emoji: '⚡', desc: 'Desi Dhol Beats, Masoom Sharma, Renuka Panwar, Diler' },
  { id: 'trending', name: 'Trending Now', emoji: '🔥', desc: 'Most Streamed Viral Sensations of 2026' },
  { id: 'latest', name: 'Latest Drops', emoji: '🚀', desc: 'Brand New Releases, Fresh Acoustics & Hits' },
];

export const App: React.FC = () => {
  const { playlists, deletePlaylist, removeTrackFromPlaylist } = useLibrary();
  const { playTrack, equalizerOpen, setEqualizerOpen } = usePlayer();

  const [booting, setBooting] = useState(true);
  const [activeView, setActiveView] = useState('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Regional Categories
  const [activeCategory, setActiveCategory] = useState<string>('punjabi');
  const [categoryFeeds, setCategoryFeeds] = useState<Record<string, Track[]>>({});
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('songs');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Pre-load default feed
  const loadCategoryFeed = useCallback(async (catId: string) => {
    if (categoryFeeds[catId] && categoryFeeds[catId].length > 0) {
      return;
    }

    setIsLoadingFeed(true);
    try {
      const data = await fetchApi<{ results?: any[] }>(`/feed/${catId}`);
      if (data && data.results && data.results.length > 0) {
        const parsed: Track[] = data.results.map(item => ({
          videoId: item.videoId || item.browseId,
          title: item.title,
          artists: item.artists || [{ name: item.author || 'KAUSIC Artist' }],
          album: item.album ? { name: item.album.name || item.album } : undefined,
          duration: item.duration,
          thumbnails: item.thumbnails || []
        }));
        setCategoryFeeds(prev => ({ ...prev, [catId]: parsed }));
      }
    } catch (err) {
      console.warn(`[KAUSIC Feed] Error loading ${catId}:`, err);
    } finally {
      setIsLoadingFeed(false);
    }
  }, [categoryFeeds]);

  // Initial backend discovery & category pre-fetch
  useEffect(() => {
    detectActiveBackend()
      .then(() => loadCategoryFeed('punjabi'))
      .catch(() => {
        setCategoryFeeds({ punjabi: FALLBACK_TOP_HITS });
      });
  }, []);

  // When active category changes, fetch if needed
  useEffect(() => {
    if (activeView === 'home' || activeView === 'trending') {
      loadCategoryFeed(activeCategory);
    }
  }, [activeCategory, activeView, loadCategoryFeed]);

  // Execute Search
  const executeSearch = useCallback((queryToRun?: string) => {
    const q = queryToRun !== undefined ? queryToRun : searchQuery;
    if (!q.trim()) return;
    setIsSearching(true);
    setActiveView('search');

    fetchApi<{ results?: any[] }>(`/search?q=${encodeURIComponent(q.trim())}&filter=${searchFilter}`)
      .then(data => {
        setSearchResults(data?.results || []);
      })
      .catch(err => console.error('Search error:', err))
      .finally(() => setIsSearching(false));
  }, [searchQuery, searchFilter]);

  // Re-run search when filter changes in search view
  useEffect(() => {
    if (activeView === 'search' && searchQuery.trim()) {
      executeSearch();
    }
  }, [searchFilter]);

  const activeCategoryInfo = REGIONAL_CATEGORIES.find(c => c.id === activeCategory) || REGIONAL_CATEGORIES[0];
  const currentFeedTracks = categoryFeeds[activeCategory] || [];
  const activeCustomPlaylist = playlists.find(p => p.id === selectedPlaylistId);

  return (
    <div className="flex h-screen w-screen bg-[#050505] text-white overflow-hidden select-none font-sans relative safe-viewport">
      {/* Booting Sequence */}
      {booting && <BootScreen onComplete={() => setBooting(false)} />}

      {/* Sidebar (Desktop) */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        selectedPlaylistId={selectedPlaylistId}
        setSelectedPlaylistId={setSelectedPlaylistId}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Header */}
        <Header />

        {/* Scrollable Center Body with safe-area bottom padding */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 space-y-5 pb-44">
          {/* VIEW: HOME & REGIONAL CHARTS */}
          {(activeView === 'home' || activeView === 'trending') && !selectedPlaylistId && (
            <div className="space-y-4">
              {/* Regional Category Filter Chips Carousel */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {REGIONAL_CATEGORIES.map(cat => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 shrink-0 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#d4af37] via-[#f7e7b4] to-[#c59e2a] text-black shadow-[0_0_16px_rgba(212,175,55,0.4)] font-bold'
                          : 'bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08]'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feed Header Banner */}
              <div className="rounded-2xl glass-panel-gold p-4 sm:p-5 border border-[#d4af37]/25 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#d4af37] uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-[#f7e7b4]" />
                    <span>Live 2050 Charts</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>{activeCategoryInfo.emoji}</span>
                    <span>{activeCategoryInfo.name}</span>
                  </h2>
                  <p className="text-[11px] text-neutral-400 font-medium">
                    {activeCategoryInfo.desc} • {currentFeedTracks.length || 50} tracks
                  </p>
                </div>

                {/* Play All & Shuffle Buttons */}
                {currentFeedTracks.length > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => playTrack(currentFeedTracks[0], currentFeedTracks)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-tr from-[#d4af37] via-[#f7e7b4] to-[#c59e2a] hover:brightness-110 active:scale-95 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all"
                      title="Play All"
                    >
                      <Play className="w-3.5 h-3.5 fill-black text-black" />
                      <span>Play</span>
                    </button>
                    <button
                      onClick={() => {
                        const shuffled = [...currentFeedTracks].sort(() => Math.random() - 0.5);
                        playTrack(shuffled[0], shuffled);
                      }}
                      className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[#f7e7b4] border border-[#d4af37]/30 active:scale-95 transition-all"
                      title="Shuffle Play"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Feed Song List with Rank Numbers */}
              {isLoadingFeed && currentFeedTracks.length === 0 ? (
                <div className="flex items-center justify-center py-20 text-neutral-500 gap-3 text-xs font-mono">
                  <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
                  <span>Loading {activeCategoryInfo.name}...</span>
                </div>
              ) : currentFeedTracks.length > 0 ? (
                <div className="space-y-1.5 divide-y divide-white/[0.04]">
                  {currentFeedTracks.map((track, i) => (
                    <div key={`${track.videoId}-${i}`} className="flex items-center gap-2 pt-1.5">
                      {/* Gold Rank Number */}
                      <span className={`w-6 text-center text-xs font-mono font-bold shrink-0 ${
                        i === 0 ? 'text-[#f7e7b4] drop-shadow-[0_0_8px_rgba(212,175,55,0.7)] text-sm' :
                        i === 1 ? 'text-[#d4af37]' :
                        i === 2 ? 'text-amber-500' : 'text-neutral-500'
                      }`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <TrackRow track={track} index={i} showIndex={false} queueContext={currentFeedTracks} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-neutral-500 text-xs font-mono">
                  No tracks loaded yet. Please verify internet connectivity.
                </div>
              )}
            </div>
          )}

          {/* VIEW: DEDICATED SEARCH */}
          {activeView === 'search' && (
            <div className="space-y-5">
              {/* Search Header Bar */}
              <div className="rounded-2xl glass-panel-gold p-3 border border-[#d4af37]/30 shadow-[0_8px_30px_rgba(0,0,0,0.8)] space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 flex items-center">
                    <Search className="w-4 h-4 text-[#d4af37] absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search songs, artists, albums, or lyrics..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          executeSearch();
                        }
                      }}
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-black/50 border border-[#d4af37]/25 text-white placeholder-neutral-400 text-xs sm:text-sm focus:outline-none focus:border-[#d4af37] focus:bg-black/70 transition-all font-sans"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="absolute right-3 text-neutral-400 hover:text-white p-1"
                        title="Clear Search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => executeSearch()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-tr from-[#d4af37] via-[#f7e7b4] to-[#c59e2a] hover:brightness-110 active:scale-95 text-black font-bold text-xs tracking-wide shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all shrink-0"
                  >
                    Search
                  </button>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  <span className="text-[10px] text-[#e5c07b] font-mono px-1 flex items-center gap-1 shrink-0">
                    <Sparkles className="w-2.5 h-2.5 text-[#d4af37]" /> Filter:
                  </span>
                  {[
                    { id: 'songs', label: 'Songs' },
                    { id: 'artists', label: 'Artists' },
                    { id: 'playlists', label: 'Playlists' },
                    { id: 'all', label: 'All' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSearchFilter(f.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 ${
                        searchFilter === f.id
                          ? 'bg-[#d4af37] text-black font-semibold shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                          : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.08]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Quick Trending Searches */}
                <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                  <span className="text-[10px] text-neutral-400 font-mono block">
                    Trending Searches:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Sidhu Moose Wala',
                      'Arijit Singh',
                      'Karan Aujla',
                      'Diljit Dosanjh',
                      'Masoom Sharma',
                      'Top Hits 2026'
                    ].map(suggest => (
                      <button
                        key={suggest}
                        onClick={() => {
                          setSearchQuery(suggest);
                          executeSearch(suggest);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-[#d4af37]/20 hover:text-[#f7e7b4] text-[11px] text-neutral-300 border border-white/[0.06] transition-all"
                      >
                        {suggest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search Results Display */}
              {isSearching ? (
                <div className="flex items-center justify-center py-20 text-neutral-500 gap-3 font-mono text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
                  <span>Scanning Song Library & Lyric Hooks...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-neutral-300 font-mono">
                    Results for "{searchQuery}" ({searchResults.length})
                  </h3>
                  <div className="space-y-1.5 divide-y divide-white/[0.04]">
                    {(() => {
                      const searchTracks: Track[] = searchResults.map(item => ({
                        videoId: item.videoId || item.browseId,
                        title: item.title,
                        artists: item.artists || [{ name: item.author || 'KAUSIC Artist' }],
                        album: item.album ? { name: item.album.name || item.album } : undefined,
                        duration: item.duration,
                        thumbnails: item.thumbnails || []
                      }));
                      return searchTracks.map((track, idx) => (
                        <TrackRow
                          key={`${track.videoId}-${idx}`}
                          track={track}
                          index={idx}
                          showIndex={false}
                          queueContext={searchTracks}
                        />
                      ));
                    })()}
                  </div>
                </div>
              ) : searchQuery ? (
                <div className="py-20 text-center text-neutral-500 text-xs font-mono">
                  No matches found for "{searchQuery}". Try another artist, title, or lyric line.
                </div>
              ) : null}
            </div>
          )}

          {/* VIEW: OFFLINE DOWNLOADS VAULT */}
          {activeView === 'offline' && !selectedPlaylistId && (
            <OfflineDownloadsView />
          )}

          {/* VIEW: CUSTOM PLAYLIST */}
          {selectedPlaylistId && activeCustomPlaylist && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f7e7b4] text-black flex items-center justify-center font-bold shadow-xl">
                    <Music className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">{activeCustomPlaylist.name}</h2>
                    <p className="text-xs text-neutral-400 font-mono">{activeCustomPlaylist.tracks.length} tracks</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    deletePlaylist(activeCustomPlaylist.id);
                    setSelectedPlaylistId(null);
                    setActiveView('home');
                  }}
                  className="p-2.5 rounded-xl text-neutral-500 hover:text-rose-500 hover:bg-neutral-800 transition-colors"
                  title="Delete Playlist"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {activeCustomPlaylist.tracks.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {activeCustomPlaylist.tracks.map((track, i) => (
                    <div key={`${track.videoId}-${i}`} className="flex items-center">
                      <div className="flex-1">
                        <TrackRow track={track} index={i} queueContext={activeCustomPlaylist.tracks} />
                      </div>
                      <button
                        onClick={() => removeTrackFromPlaylist(activeCustomPlaylist.id, track.videoId)}
                        className="p-2 text-neutral-600 hover:text-rose-400 transition-colors"
                        title="Remove from playlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-neutral-500 text-xs font-mono">
                  Playlist is empty. Add songs using the '+' icon!
                </div>
              )}
            </div>
          )}
        </main>

        {/* Floating Mini Player Bar - Positioned above footer dock */}
        <div className="fixed bottom-[68px] sm:bottom-[74px] left-3 right-3 sm:left-6 sm:right-6 z-30 max-w-lg mx-auto pointer-events-auto">
          <PlayerBar />
        </div>

        {/* Bottom Navigation Dock */}
        <BottomNavigationDock
          activeView={activeView}
          setActiveView={setActiveView}
          selectedPlaylistId={selectedPlaylistId}
          setSelectedPlaylistId={setSelectedPlaylistId}
        />
      </div>

      {/* Slide-out Drawers */}
      <LyricsDrawer />
      <QueueDrawer />

      {/* Hardware 5-Band EQ Modal */}
      <EqualizerModal isOpen={equalizerOpen} onClose={() => setEqualizerOpen(false)} />

      {/* Fullscreen Player Modal */}
      <FullscreenPlayer />
    </div>
  );
};
