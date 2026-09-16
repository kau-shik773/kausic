import React, { useEffect, useState } from 'react';
import { X, Mic2, Loader2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { fetchApi } from '../config/api';

export const LyricsDrawer: React.FC = () => {
  const { currentTrack, lyricsOpen, setLyricsOpen } = usePlayer();
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentTrack || !lyricsOpen) return;

    let isMounted = true;
    setLoading(true);
    setLyrics(null);

    fetchApi<{ lyrics?: string; source?: string }>(`/lyrics?id=${currentTrack.videoId}`)
      .then(data => {
        if (!isMounted) return;
        if (data.lyrics) {
          setLyrics(data.lyrics);
          setSource(data.source || null);
        } else {
          setLyrics(null);
        }
      })
      .catch(() => {
        if (isMounted) setLyrics(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentTrack, lyricsOpen]);

  if (!lyricsOpen) return null;

  return (
    <aside className="w-80 h-full bg-[#07070a]/95 backdrop-blur-2xl border-l border-[#d4af37]/20 flex flex-col shrink-0 select-none z-30 shadow-2xl">
      {/* Header */}
      <div className="h-16 px-6 border-b border-[#d4af37]/15 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Mic2 className="w-4 h-4 text-[#d4af37]" />
          <span>Synchronized Lyrics</span>
        </div>
        <button
          onClick={() => setLyricsOpen(false)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans text-sm leading-relaxed">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-neutral-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
            <span className="text-xs">Matching lyric frequencies...</span>
          </div>
        ) : lyrics ? (
          <div className="space-y-4">
            <div className="text-neutral-300 whitespace-pre-line text-sm leading-loose">
              {lyrics}
            </div>
            {source && (
              <p className="text-[10px] text-neutral-500 pt-4 border-t border-white/[0.06] font-mono">
                Source: {source}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center text-neutral-500 space-y-2">
            <p className="font-semibold text-neutral-400">No lyrics available</p>
            <p className="text-xs text-neutral-600">
              Couldn't detect verified lyrics for this track.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
