import React, { useState } from 'react';
import { Home, Compass, Heart, Clock, ListMusic, Plus, DownloadCloud } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { KaushikBadge } from './KaushikBadge';
import { KausicSoundSystemLogo } from './KausicSoundSystemLogo';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  selectedPlaylistId,
  setSelectedPlaylistId
}) => {
  const { playlists, createPlaylist, likedSongs } = useLibrary();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'offline', label: 'Vault', icon: DownloadCloud },
    { id: 'liked', label: 'Liked', icon: Heart, count: likedSongs.length },
    { id: 'history', label: 'History', icon: Clock },
  ];

  return (
    <>
      {/* ================= DESKTOP SIDEBAR (md and above) ================= */}
      <aside className="hidden md:flex w-64 h-full bg-[#07070a]/90 backdrop-blur-2xl border-r border-[#d4af37]/20 flex-col shrink-0 select-none z-20">
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-[#d4af37]/15">
          <KausicSoundSystemLogo size="md" />
          <div>
            <h1 className="font-black text-xl tracking-wider bg-gradient-to-r from-white via-[#f7e7b4] to-[#d4af37] bg-clip-text text-transparent">
              KAUSIC
            </h1>
            <p className="text-[9px] text-[#e5c07b] font-medium tracking-wide">CRYSTAL AUDIO ENGINE</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 pt-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id && !selectedPlaylistId;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id); setSelectedPlaylistId(null); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/[0.09] border border-[#d4af37]/40 text-[#f7e7b4] font-bold shadow-[0_4px_16px_rgba(212,175,55,0.2)] backdrop-blur-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.id === 'liked' && isActive ? 'text-rose-400 fill-rose-400' : ''}`} />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f7e7b4] font-mono">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Playlists Header */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#e5c07b] uppercase tracking-widest">
            Playlists
          </span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="New Playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {playlists.map(pl => (
            <button
              key={pl.id}
              onClick={() => {
                setSelectedPlaylistId(pl.id);
                setActiveView('playlist');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs transition-all text-left truncate ${
                selectedPlaylistId === pl.id
                  ? 'bg-[#d4af37]/20 text-[#f7e7b4] font-semibold border border-[#d4af37]/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5 shrink-0 text-[#d4af37]" />
              <span className="truncate">{pl.name}</span>
            </button>
          ))}
        </div>

        {/* Desktop Footer Badge */}
        <div className="p-4 border-t border-[#d4af37]/15 flex justify-center">
          <KaushikBadge variant="footer" />
        </div>
      </aside>

      {/* Slide-Over Playlists Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-panel-gold border border-[#d4af37]/40 p-6 rounded-3xl w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create New Playlist</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <input
                type="text"
                autoFocus
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/50 border border-[#d4af37]/30 rounded-2xl text-white placeholder-neutral-400 focus:outline-none focus:border-[#d4af37] text-sm font-sans"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-[#d4af37] via-[#f7e7b4] to-[#c59e2a] hover:brightness-110 text-black disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
