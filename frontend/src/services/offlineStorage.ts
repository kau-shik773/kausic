import type { Track } from '../types';

const DB_NAME = 'KausicOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'songs';

interface StoredSongRecord {
  videoId: string;
  track: Track;
  audioBlob: Blob;
  sizeBytes: number;
  downloadedAt: number;
}

class OfflineStorage {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'videoId' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  public async saveSong(track: Track, audioBlob: Blob): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record: StoredSongRecord = {
        videoId: track.videoId,
        track,
        audioBlob,
        sizeBytes: audioBlob.size,
        downloadedAt: Date.now()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async isDownloaded(videoId: string): Promise<boolean> {
    const db = await this.dbPromise;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(videoId);
      req.onsuccess = () => resolve(Boolean(req.result));
      req.onerror = () => resolve(false);
    });
  }

  public async getDownloadedTracks(): Promise<Track[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const records: StoredSongRecord[] = req.result || [];
        resolve(records.map(r => r.track));
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async getAudioBlobUrl(videoId: string): Promise<string | null> {
    const db = await this.dbPromise;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(videoId);
      req.onsuccess = () => {
        const record: StoredSongRecord = req.result;
        if (record && record.audioBlob) {
          resolve(URL.createObjectURL(record.audioBlob));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  }

  public async deleteSong(videoId: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(videoId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getTotalStorageMB(): Promise<number> {
    const db = await this.dbPromise;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const records: StoredSongRecord[] = req.result || [];
        const bytes = records.reduce((acc, r) => acc + (r.sizeBytes || 0), 0);
        resolve(Number((bytes / (1024 * 1024)).toFixed(1)));
      };
      req.onerror = () => resolve(0);
    });
  }
}

export const offlineStorage = new OfflineStorage();
