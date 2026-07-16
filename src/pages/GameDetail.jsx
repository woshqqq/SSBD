import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'
import { useAdminMode } from '../context/AdminModeContext.jsx'
import Modal from '../components/Modal.jsx'
import ParticipantPicker from '../components/ParticipantPicker.jsx'
import CreatePresetPopup from '../components/CreatePresetPopup.jsx'
import CreateGuestPopup from '../components/CreateGuestPopup.jsx'
import DisplayName from '../components/DisplayName.jsx'

const AUDIO_ACCEPT = 'audio/*,.mp3,.wav,.m4a,.aac,.ogg,.mp4'

export default function GameDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [participants, setParticipants] = useState([]) // [{key, presetId, name, title, image, team}] - 게임 시작 전까지는 로컬에만 존재
  const [teams, setTeams] = useState(['A팀', 'B팀'])
  const [modal, setModal] = useState(null) // null | 'picker' | 'create' | 'guest' | 'deleteGame'
  const [fxName, setFxName] = useState('')
  const [fxFile, setFxFile] = useState(null)
  const { isAdmin } = useAdminMode()

  const game = useLiveQuery(() => db.games.get(Number(id)), [id])

  // 프리셋 불러오기(다중선택)/참가자 생성/게스트 생성 결과를 한꺼번에 받아 참가자 목록에 추가한다.
  function addParticipants(items) {
    const withTeam = items.map(p => ({ ...p, team: game.teamMode ? teams[0] : undefined }))
    setParticipants(prev => [...prev, ...withTeam])
    setModal(null)
  }

  function addPresetSingle(preset) {
    addParticipants([{ key: `preset-${preset.id}`, presetId: preset.id, name: preset.name, title: preset.title, image: preset.image }])
  }

  function addPresetsMulti(presets) {
    addParticipants(presets.map(p => ({ key: `preset-${p.id}`, presetId: p.id, name: p.name, title: p.title, image: p.image })))
  }

  function removeParticipant(key) {
    setParticipants(prev => prev.filter(p => p.key !== key))
  }

  function setParticipantTeam(key, team) {
    setParticipants(prev => prev.map(p => p.key === key ? { ...p, team } : p))
  }

  function addTeam() {
    const nextLetter = String.fromCharCode(65 + teams.length) // A,B,C,D...
    setTeams(prev => [...prev, `${nextLetter}팀`])
  }

  async function changeBackground(e) {
    const file = e.target.files?.[0]
    if (!file) return
    await db.games.update(game.id, { backgroundImage: file })
  }

  async function changeBgm(e) {
    const file = e.target.files?.[0]
    if (!file) return
    await db.games.update(game.id, { bgm: file })
  }

  async function addSoundEffect() {
    if (!fxName.trim() || !fxFile) return alert('효과음 이름과 파일을 모두 입력해주세요.')
    const next = [...(game.soundEffects || []), { id: Date.now(), name: fxName.trim(), file: fxFile }]
    await db.games.update(game.id, { soundEffects: next })
    setFxName('')
    setFxFile(null)
  }

  async function renameSoundEffect(fxId, name) {
    const next = (game.soundEffects || []).map(fx => fx.id === fxId ? { ...fx, name } : fx)
    await db.games.update(game.id, { soundEffects: next })
  }

  async function removeSoundEffect(fxId) {
    const next = (game.soundEffects || []).filter(fx => fx.id !== fxId)
    await db.games.update(game.id, { soundEffects: next })
  }

  async function confirmDeleteGame() {
    await db.games.delete(game.id)
    nav('/')
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
        participants.map(p => ({
          sessionId: newSessionId,
          presetId: p.presetId,
          name: p.name,
          title: p.title || '',
          image: p.image ?? null,
          team: p.team ?? null,
          wins: 0,
        }))
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn secondary" onClick={() => nav(`/game/${game.id}/edit`)}>수정</button>
            <button className="btn danger" onClick={() => setModal('deleteGame')}>삭제</button>
          </div>
        )}
      </div>
      <p style={{ color: '#888' }}>{game.genre}{game.note && ` · ${game.note}`}</p>

      <div className="card">
        <h2>참가자 등록</h2>

        {game.teamMode && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {teams.map(t => (
              <span key={t} className="btn secondary" style={{ padding: '6px 12px' }}>{t}</span>
            ))}
            <button className="btn secondary" onClick={addTeam}>+ 팀 추가</button>
          </div>
        )}

        {participants.length === 0 && <p style={{ color: '#888' }}>등록된 참가자가 없어요.</p>}
        {participants.map(p => (
          <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '6px 0' }}>
            <span>
              <DisplayName title={p.title} name={p.name} />
              {!p.presetId && <span style={{ color: '#888' }}> (게스트)</span>}
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {game.teamMode && (
                <select value={p.team} onChange={e => setParticipantTeam(p.key, e.target.value)} style={{ width: 'auto', margin: 0 }}>
                  {teams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
              <button className="btn danger" onClick={() => removeParticipant(p.key)}>제거</button>
            </div>
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

      <div className="card" style={{ marginTop: 16 }}>
        <h2>배경화면</h2>
        <p style={{ color: '#888', margin: '4px 0 8px' }}>
          {game.backgroundImage?.name ?? '설정된 배경화면이 없어요 (기본 배경이 사용돼요)'}
        </p>
        <input type="file" accept="image/*,.png,.jpg,.jpeg,.webp,.heic" onChange={changeBackground} />
      </div>

      {isAdmin && (
        <div className="card">
          <h2>효과음 버튼</h2>
          <p style={{ color: '#888', margin: '4px 0 8px' }}>게임 진행 화면에 표시할 효과음 버튼을 만들어요. 관리자만 추가/삭제/이름 수정할 수 있어요.</p>
          {(game.soundEffects || []).map(fx => (
            <div key={fx.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0' }}>
              <input value={fx.name} onChange={e => renameSoundEffect(fx.id, e.target.value)} style={{ margin: 0 }} />
              <button className="btn danger" onClick={() => removeSoundEffect(fx.id)}>삭제</button>
            </div>
          ))}
          <input placeholder="효과음 이름 (예: 승리 팡파레)" value={fxName} onChange={e => setFxName(e.target.value)} />
          <input type="file" accept={AUDIO_ACCEPT} onChange={e => setFxFile(e.target.files?.[0] ?? null)} />
          <button className="btn secondary" style={{ marginTop: 8 }} onClick={addSoundEffect}>효과음 버튼 추가</button>
        </div>
      )}

      <div className="card">
        <h2>배경음악</h2>
        <p style={{ color: '#888', margin: '4px 0 8px' }}>
          {game.bgm?.name ?? '설정된 배경음악이 없어요'}
        </p>
        <input type="file" accept={AUDIO_ACCEPT} onChange={changeBgm} />
      </div>

      {modal === 'picker' && (
        <Modal onClose={() => setModal(null)}>
          <ParticipantPicker excludeIds={addedIds} multiSelect onConfirm={addPresetsMulti} />
        </Modal>
      )}
      {modal === 'create' && (
        <Modal onClose={() => setModal(null)}>
          <CreatePresetPopup onCreated={addPresetSingle} />
        </Modal>
      )}
      {modal === 'guest' && (
        <Modal onClose={() => setModal(null)}>
          <CreateGuestPopup onConfirm={addParticipants} />
        </Modal>
      )}
      {modal === 'deleteGame' && (
        <Modal onClose={() => setModal(null)}>
          <h2>게임을 삭제하시겠습니까?</h2>
          <p style={{ color: '#888' }}>{game.name}을(를) 삭제해요. 되돌릴 수 없어요 (이 게임으로 진행했던 기록은 남아있어요).</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn danger" onClick={confirmDeleteGame}>삭제</button>
            <button className="btn secondary" onClick={() => setModal(null)}>취소</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
