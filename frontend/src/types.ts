export interface ArtistInfo {
  name: string;
  id?: string;
}

export interface Thumbnail {
  url: string;
  width?: number;
  height?: number;
}

export interface Track {
  videoId: string;
  title: string;
  artists?: ArtistInfo[];
  album?: {
    name: string;
    id?: string;
  };
  duration?: string;
  duration_seconds?: number;
  thumbnails?: Thumbnail[];
}

export interface PlaylistSummary {
  browseId: string;
  title: string;
  thumbnails?: Thumbnail[];
  author?: string;
  trackCount?: number;
}

export interface AdBlockStats {
  blocked_ad_requests: number;
  sanitized_cue_points: number;
  bypassed_interstitials: number;
  saved_bandwidth_mb: number;
}
