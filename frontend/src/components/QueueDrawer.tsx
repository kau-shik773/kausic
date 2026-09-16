import React from 'react';
import { X, ListOrdered } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const QueueDrawer: React.FC = () => {
  const { queue, queueIndex, queueOpen, setQueueOpen, playTrack } = usePlayer();

  if (!queueOpen) return null;

  return (
    <aside className="w-80 h-full bg-[#07070a]/95 backdrop-blur-2xl border-l border-[#d4af37]/20 flex flex-col shrink-0 select-none z-30 shadow-2xl">
      {/* Header */}
      <div className="h-16 px-6 border-b border-[#d4af37]/15 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <ListOrdered className="w-4 h-4 text-[#d4af37]" />
          <span>Playing Queue</span>
          <span className="text-xs font-mono text-[#f7e7b4]">({queue.length})</span>
        </div>
        <button
          onClick={() => setQueueOpen(false)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {queue.map((track, idx) => {
          const isCurrent = idx === queueIndex;
          const thumbnail = track.thumbnails?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=60&auto=format&fit=crop&q=80';
          const artistName = track.artists?.map(a => a.name).join(', ') || 'Unknown Artist';

          return (
            <div
              key={`${track.videoId}-${idx}`}
              onClick={() => playTrack(track, queue)}
              className={`group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                isCurrent
                  ? 'bg-white/[0.08] border border-[#d4af37]/35 text-[#f7e7b4] font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-800 border border-[#d4af37]/15">
                <img src={thumbnail} alt={track.title} className="w-full h-full object-cover" />
                {isCurrent && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-ping" />
                  </div>
                )}
              </div>

              {/* Title & Artist */}
              <div className="flex-1 min-w-0">
                <h5 className={`text-xs truncate ${isCurrent ? 'text-[#f7e7b4] font-bold' : 'text-neutral-200'}`}>
                  {track.title}
                </h5>
                <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                  {artistName}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
