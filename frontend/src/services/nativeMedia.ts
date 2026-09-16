import { registerPlugin } from '@capacitor/core';

export interface KausicMediaPlugin {
  update(options: {
    title: string;
    artist: string;
    album?: string;
    artworkUrl?: string;
    isPlaying: boolean;
    duration?: number;
    position?: number;
  }): Promise<void>;
  clear(): Promise<void>;
  addListener(
    eventName: 'mediaAction',
    listenerFunc: (data: { action: 'play' | 'pause' | 'toggle' | 'next' | 'prev' | 'seek'; position?: number }) => void
  ): Promise<any>;
}

export const KausicMedia = registerPlugin<KausicMediaPlugin>('KausicMedia');
