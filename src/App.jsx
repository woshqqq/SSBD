import React, { useEffect } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import { seedGamesIfEmpty } from './db.js'
import { AdminModeProvider, useAdminMode } from './context/AdminModeContext.jsx'
import Home from './pages/Home.jsx'
import GameDetail from './pages/GameDetail.jsx'
import GameEditor from './pages/GameEditor.jsx'
import GameResources from './pages/GameResources.jsx'
import Play from './pages/Play.jsx'
import Result from './pages/Result.jsx'
import Presets from './pages/Presets.jsx'
import SupportTool from './pages/SupportTool.jsx'

function AdminToggle() {
  const { isAdmin, requestEnable, disable } = useAdminMode()
  return (
    <button className={`admin-toggle ${isAdmin ? 'active' : ''}`} onClick={() => (isAdmin ? disable() : requestEnable())}>
      관리자{isAdmin ? ' 켜짐' : ''}
    </button>
  )
}

function AppShell() {
  useEffect(() => {
    seedGamesIfEmpty()
  }, [])

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/new" element={<GameEditor />} />
        <Route path="/game/:id" element={<GameDetail />} />
        <Route path="/game/:id/edit" element={<GameEditor />} />
        <Route path="/game/:id/resources" element={<GameResources />} />
        <Route path="/support/:id" element={<SupportTool />} />
        <Route path="/play/:sessionId" element={<Play />} />
        <Route path="/result/:sessionId" element={<Result />} />
        <Route path="/presets" element={<Presets />} />
      </Routes>

      <nav className="nav-bar">
        <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>게임</NavLink>
        <NavLink to="/presets" className={({isActive}) => isActive ? 'active' : ''}>캐릭터</NavLink>
        <AdminToggle />
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <AdminModeProvider>
      <AppShell />
    </AdminModeProvider>
  )
}
