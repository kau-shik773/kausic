import type { Track, PlaylistSummary } from '../types';

// Production Cloud Endpoint (live on Render cloud)
export const DEFAULT_CLOUD_API = 'https://kausic.onrender.com/api';
const storedCloudApi = typeof window !== 'undefined' ? localStorage.getItem('kausic_api_base') : null;

// Candidate endpoints: Cloud primary -> Local LAN IP -> Localhost fallback
const CANDIDATE_HOSTS = [
  storedCloudApi || DEFAULT_CLOUD_API,
  'http://192.168.53.36:5050/api',
  'http://127.0.0.1:5050/api',
  'http://localhost:5050/api'
];

let activeApiBase = CANDIDATE_HOSTS[0];

export const getApiBase = () => activeApiBase;

export const setApiBase = (url: string) => {
  activeApiBase = url.replace(/\/+$/, '');
  try {
    localStorage.setItem('kausic_api_base', activeApiBase);
  } catch {}
};

// Auto-detect fastest responsive backend
export async function detectActiveBackend(): Promise<string> {
  for (const host of CANDIDATE_HOSTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${host}/adblock/stats`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        console.log(`[KAUSIC Audio Engine] Connected to backend at: ${host}`);
        activeApiBase = host;
        return host;
      }
    } catch {
      // try next
    }
  }
  return activeApiBase;
}

// Resilient fetch with fallback
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  try {
    const res = await fetch(`${activeApiBase}${cleanEndpoint}`, options);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`[KAUSIC API] Request to ${activeApiBase}${cleanEndpoint} failed, attempting failover...`);
  }

  for (const host of CANDIDATE_HOSTS) {
    if (host === activeApiBase) continue;
    try {
      const res = await fetch(`${host}${cleanEndpoint}`, options);
      if (res.ok) {
        activeApiBase = host;
        return await res.json();
      }
    } catch {
      // continue
    }
  }

  throw new Error(`Failed to fetch ${cleanEndpoint} from all endpoints`);
}

// Built-in 2050 Cybernetic Curated Chart Database (Used as instant initial state & offline backup)
export const FALLBACK_TOP_HITS: Track[] = [
  {
    videoId: 'fJ9rUzIMcZQ',
    title: 'Bohemian Rhapsody',
    artists: [{ name: 'Queen', id: 'queen' }],
    album: { name: 'A Night at the Opera', id: 'opera' },
    duration: '5:55',
    duration_seconds: 355,
    thumbnails: [
      { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80', width: 500, height: 500 }
    ]
  },
  {
    videoId: '4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artists: [{ name: 'The Weeknd', id: 'theweeknd' }],
    album: { name: 'After Hours', id: 'afterhours' },
    duration: '3:20',
    duration_seconds: 200,
    thumbnails: [
      { url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80', width: 500, height: 500 }
    ]
  },
  {
    videoId: 'JGwWNGJdvx8',
    title: 'Shape of You',
    artists: [{ name: 'Ed Sheeran', id: 'edsheeran' }],
    album: { name: 'Divide', id: 'divide' },
    duration: '3:53',
    duration_seconds: 233,
    thumbnails: [
      { url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80', width: 500, height: 500 }
    ]
  },
  {
    videoId: 'kTJczUoc26U',
    title: 'Stay',
    artists: [{ name: 'The Kid LAROI & Justin Bieber', id: 'stay' }],
    album: { name: 'F*CK LOVE 3', id: 'fl3' },
    duration: '2:21',
    duration_seconds: 141,
    thumbnails: [
      { url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80', width: 500, height: 500 }
    ]
  },
  {
    videoId: 'hT_nvWreIhg',
    title: 'Counting Stars',
    artists: [{ name: 'OneRepublic', id: 'onerepublic' }],
    album: { name: 'Native', id: 'native' },
    duration: '4:17',
    duration_seconds: 257,
    thumbnails: [
      { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80', width: 500, height: 500 }
    ]
  },
  {
    videoId: 'L3wKzyIN1yk',
    title: 'Believer',
    artists: [{ name: 'Imagine Dragons', id: 'imaginedragons' }],
    album: { name: 'Evolve', id: 'evolve' },
    duration: '3:24',
    duration_seconds: 204,
    thumbnails: [
      { url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80', width: 500, height: 500 }
    ]
  }
];

export const FALLBACK_TRENDING: Track[] = [
  {
    videoId: '09R8_2nJtjg',
    title: 'Sugar',
    artists: [{ name: 'Maroon 5', id: 'maroon5' }],
    album: { name: 'V', id: 'v' },
    duration: '3:55',
    duration_seconds: 235,
    thumbnails: [
      { url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=80', width: 500, height: 500 }
    ]
  },
  {
    videoId: 'RgKAFK5djSk',
    title: 'See You Again',
    artists: [{ name: 'Wiz Khalifa ft. Charlie Puth', id: 'wiz' }],
    album: { name: 'Furious 7', id: 'f7' },
    duration: '3:49',
    duration_seconds: 229,
    thumbnails: [
      { url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80', width: 500, height: 500 }
    ]
  }
];

export const FALLBACK_PLAYLISTS: PlaylistSummary[] = [
  {
    browseId: 'RDCLAK5uy_kmPRjHDECIaTwnCRzZwV7R12EwOhJ',
    title: 'Today\'s Cyber Top 50',
    thumbnails: [
      { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80' }
    ],
    trackCount: 50
  },
  {
    browseId: 'RDCLAK5uy_n9FBDwBgqG1qI',
    title: 'Cyberpunk Synthwave 2050',
    thumbnails: [
      { url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80' }
    ],
    trackCount: 35
  }
];
