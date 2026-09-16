# YouTube Music Pro (Ad-Free Rust Engine & Custom UI)

A modern, high-performance desktop music streaming application powered by an ad-free stream extraction engine, YouTube Music's InnerTube data protocol, and a custom dark-mode UI.

---

## 🌟 Key Features

1. **Ad-Free Streaming Engine**:
   * Intercepts InnerTube video payloads and drops ad cue-points before playback begins.
   * Extracts pure, unencrypted high-fidelity Opus (~160kbps, `itag 251`) and AAC (~128kbps, `itag 140`) audio streams directly.
   * Zero video ads, zero mid-roll interruptions, and zero sponsored banners.
   * Real-time **Shield Badge** tracking bypassed interstitials, sanitized cues, and saved data.

2. **Complete YouTube Music Library & Data**:
   * **Home & Trending**: Top charts, global hits, trending songs, and curated playlists.
   * **Full-Spectrum Search**: Instant debounced search for Songs, Artists, Albums, and Playlists.
   * **Explore & Moods**: Quick navigation across moods (Relax, Workout, Focus, Party, Romance, Energy).
   * **Continuous Radio Queue**: 50+ song auto-queue generated from any track via InnerTube watch playlists.
   * **Live Synchronized Lyrics**: Dedicated slide-out drawer fetching lyrics directly from the YouTube Music database.

3. **Persistent Local User Library**:
   * **Liked Songs**: Save favorite tracks with instant offline caching of metadata.
   * **Custom Playlists**: Create, rename, delete, and add tracks to custom playlists.
   * **Listening History**: Automatically tracks your recently played songs.

4. **Custom Audio Player UI**:
   * Sleek bottom dock with persistent playback controls (Shuffle, Previous, Play/Pause, Next, Repeat).
   * Precise scrubber timeline with current time and duration.
   * Volume slider with one-click mute toggle.
   * Fullscreen immersive player with rotating vinyl artwork animation and ambient dynamic backdrops.

---

## 🚀 Quick Start & Running the App

### Option A: One-Click Launcher (Windows)
Double-click `run_app.bat` inside the project folder:
```cmd
run_app.bat
```
This automatically boots the backend stream engine (Port 5050) and launches the frontend (Port 5173) in your default browser.

### Option B: Manual Terminal Execution

#### 1. Start the Backend Engine:
```bash
cd backend
python server.py
```
*(Runs on `http://127.0.0.1:5050`)*

#### 2. Start the Modern UI:
```bash
cd frontend
npm run dev
```
*(Available at `http://localhost:5173`)*

---

## 📁 Architecture Overview

```
ytmusic-rust-app/
├── backend/
│   ├── server.py             # Flask + InnerTube API & Ad-Free Stream Engine
│   └── requirements.txt
├── src-rust/
│   ├── Cargo.toml            # Rust engine manifest
│   └── src/
│       └── main.rs           # Native Rust InnerTube extractor & stream filter
├── frontend/                 # Vite + React + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/       # PlayerBar, Sidebar, Header, Lyrics, Queue, Fullscreen
│   │   ├── context/          # PlayerContext (Audio engine), LibraryContext (Storage)
│   │   ├── types.ts          # Strongly typed models
│   │   ├── App.tsx           # Main application shell
│   │   └── main.tsx
│   ├── index.html
│   └── tailwind.config.js
└── run_app.bat               # Single-click launcher
```
