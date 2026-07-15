import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'
import { useAdminMode } from '../context/AdminModeContext.jsx'
import Modal from '../components/Modal.jsx'
import ParticipantPicker from '../components/ParticipantPicker.jsx'
import CreatePresetPopup from '../components/CreatePresetPopup.jsx'
import CreateGuestPopup from '../components/CreateGuestPopup.jsx'

export default function GameDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [participants, setParticipants] = useState([]) // [{key, presetId, name}] - 게임 시작 전까지는 로컬에만 존재
  const [modal, setModal] = useState(null) // null | 'picker' | 'create' | 'guest'
  const { isAdmin } = useAdminMode()

  const game = useLiveQuery(() => db.games.get(Number(id)), [id])

  function addParticipant(preset) {
    setParticipants(prev => [...prev, { key: `preset-${preset.id}`, presetId: preset.id, name: preset.name }])
    setModal(null)
  }

  function addGuests(guests) {
    setParticipants(prev => [...prev, ...guests])
    setModal(null)
  }

  function removeParticipant(key) {
    setParticipants(prev => prev.filter(p => p.key !== key))
  }

  async function changeBackground(e) {
    const file = e.target.files?.[0]
    if (!file) return
    await db.games.update(game.id, { backgroundImage: file })
  }

  async function startGame() {
    if (participants.length === 0) return

    const sessionId = await db.transaction('rw', db.sessions, db.participants, db.presets, async () => {
      const newSessionId = await db.sessions.add({
        gameId: game.id,
        createdAt: Date.now(),
        startedAt: Date.now(),
        endedAt: null,
      })
      await db.participants.bulkAdd(
        participants.map(p => ({ sessionId: newSessionId, presetId: p.presetId, name: p.name, wins: 0 }))
      )
      for (const p of participants) {
        if (!p.presetId) continue // 게스트는 전적을 남기지 않는다.
        const preset = await db.presets.get(p.presetId)
        await db.presets.update(p.presetId, { playCount: (preset?.playCount || 0) + 1 })
      }
      return newSessionId
    })

    nav(`/play/${sessionId}`)
  }

  if (!game) return <p>불러오는 중...</p>

  const addedIds = participants.filter(p => p.presetId).map(p => p.presetId)

  return (
    <div>
      <button className="btn secondary" onClick={() => nav('/')}>← 목록으로</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>{game.name}</h1>
        {isAdmin && (
          <button className="btn secondary" onClick={() => nav(`/game/${game.id}/edit`)}>수정</button>
        )}
      </div>
      <p style={{ color: '#888' }}>{game.genre}{game.note && ` · ${game.note}`}</p>

      <div className="card">
        <h2>배경화면</h2>
        <p style={{ color: '#888', margin: '4px 0 8px' }}>
          {game.backgroundImage?.name ?? '설정된 배경화면이 없어요 (기본 배경이 사용돼요)'}
        </p>
        <input type="file" accept="image/*" onChange={changeBackground} />
      </div>

      <div className="card">
        <h2>배경음악</h2>
        <p style={{ color: '#888', margin: '4px 0 0' }}>
          {game.bgm?.name ?? '설정된 배경음악이 없어요'}
        </p>
      </div>

      <div className="card">
        <h2>참가자 등록</h2>
        {participants.length === 0 && <p style={{ color: '#888' }}>등록된 참가자가 없어요.</p>}
        {participants.map(p => (
          <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
            <span>{p.name}{!p.presetId && <span style={{ color: '#888' }}> (게스트)</span>}</span>
            <button className="btn danger" onClick={() => removeParticipant(p.key)}>제거</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <button className="btn secondary" onClick={() => setModal('picker')}>프리셋 불러오기</button>
          <button className="btn secondary" onClick={() => setModal('create')}>참가자 생성</button>
          <button className="btn secondary" onClick={() => setModal('guest')}>게스트 생성</button>
        </div>
      </div>

      <button className="btn" disabled={participants.length === 0} onClick={startGame} style={{ width: '100%', opacity: participants.length === 0 ? 0.5 : 1 }}>
        게임 시작
      </button>

      {modal === 'picker' && (
        <Modal onClose={() => setModal(null)}>
          <ParticipantPicker excludeIds={addedIds} onSelect={addParticipant} />
        </Modal>
      )}
      {modal === 'create' && (
        <Modal onClose={() => setModal(null)}>
          <CreatePresetPopup onCreated={addParticipant} />
        </Modal>
      )}
      {modal === 'guest' && (
        <Modal onClose={() => setModal(null)}>
          <CreateGuestPopup onConfirm={addGuests} />
        </Modal>
      )}
    </div>
  )
}
