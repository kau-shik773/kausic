import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import './index.css'
import { LibraryProvider } from './context/LibraryContext.tsx'
import { PlayerProvider } from './context/PlayerContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LibraryProvider>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </LibraryProvider>
  </React.StrictMode>,
)
