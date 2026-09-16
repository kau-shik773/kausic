import React from 'react';
import {
  Home,
  Search,
  Flame,
  DownloadCloud,
  Sliders
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface BottomNavigationDockProps {
  activeView: string;
  setActiveView: (view: string) => void;
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string | null) => void;
  likedCount?: number;
}

export const BottomNavigationDock: React.FC<BottomNavigationDockProps> = ({
  activeView,
  setActiveView,
  selectedPlaylistId,
  setSelectedPlaylistId
}) => {
  const { setEqualizerOpen } = usePlayer();

  const navTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'offline', label: 'Vault', icon: DownloadCloud },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-[#0a0a0d]/95 to-transparent pt-3 pb-[max(env(safe-area-inset-bottom,10px),10px)] px-3 sm:px-6 pointer-events-auto">
      <div className="max-w-lg mx-auto rounded-2xl glass-panel-gold px-2 py-1.5 border border-[#d4af37]/30 flex items-center justify-around gap-1 shadow-[0_12px_36px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
        {navTabs.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id && !selectedPlaylistId;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setSelectedPlaylistId(null);
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                isActive
                  ? 'text-[#d4af37] bg-white/[0.08] border border-[#d4af37]/40 shadow-[0_0_15px_rgba(212,175,55,0.25)] font-bold'
                  : 'text-neutral-400 hover:text-white active:scale-95'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#d4af37] stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}

        {/* Equalizer DSP Trigger Tab */}
        <button
          onClick={() => setEqualizerOpen(true)}
          className="flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center text-neutral-400 hover:text-[#d4af37] transition-all active:scale-95 group"
          title="Hardware 5-Band Equalizer"
        >
          <Sliders className="w-4 h-4 text-[#e5c07b] group-hover:rotate-12 transition-transform stroke-[1.8]" />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">EQ DSP</span>
        </button>
      </div>
    </div>
  );
};
