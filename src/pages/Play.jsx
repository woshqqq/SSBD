import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'
import { useObjectUrl } from '../hooks/useObjectUrl.js'
import { usePlayTimer } from '../hooks/usePlayTimer.js'
import { formatDuration } from '../utils/formatDuration.js'
import { colorForParticipant } from '../utils/participantColor.js'
import Modal from '../components/Modal.jsx'
import ParticipantPicker from '../components/ParticipantPicker.jsx'
import WinEffect from '../components/WinEffect.jsx'
import PlayTimerPopup from '../components/PlayTimerPopup.jsx'
import DisplayName from '../components/DisplayName.jsx'
import { publicPath } from '../utils/publicPath.js'

const DEFAULT_BACKGROUND = publicPath('backgrounds/background_default.png')

export default function Play() {
  const { sessionId } = useParams()
  const nav = useNavigate()
  const sid = Number(sessionId)

  const session = useLiveQuery(() => db.sessions.get(sid), [sid])
  const game = useLiveQuery(() => session ? db.games.get(session.gameId) : null, [session])
  const participants = useLiveQuery(
    () => db.participants.where('sessionId').equals(sid).toArray(),
    [sid]
  )

  const [now, setNow] = useState(Date.now())
  const [muted, setMuted] = useState(false)
  const [actionFor, setActionFor] = useState(null) // participant being acted on
  const [swapMode, setSwapMode] = useState(false)
  const [winPreset, setWinPreset] = useState(null)
  const [finalCheck, setFinalCheck] = useState(false)
  const [selectedWinners, setSelectedWinners] = useState([])
  const [timerOpen, setTimerOpen] = useState(false)
  const timer = usePlayTimer()

  const backgroundUrl = useObjectUrl(game?.backgroundImage ?? null)
  const bgmUrl = useObjectUrl(game?.bgm ?? null)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!session || !game || !participants) return <p>불러오는 중...</p>

  const elapsedMs = now - session.startedAt
  const sorted = [...participants].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  const currentPresetIds = participants.filter(p => p.presetId).map(p => p.presetId)
  const teamMode = Boolean(game.teamMode)
  const teamNames = teamMode ? [...new Set(participants.map(p => p.team).filter(Boolean))].sort() : []

  // 실제 승리 반영: 세션 참가자(wins)와 연결된 프리셋(전체 누적 wins)을 함께 갱신한다.
  // 게스트(presetId 없음)는 프리셋이 없으니 세션 기록만 남긴다.
  async function applyWin(participant, showEffect) {
    await db.participants.update(participant.id, { wins: (participant.wins || 0) + 1 })
    let presetForEffect = { name: participant.name, title: participant.title, image: null }
    if (participant.presetId) {
      const preset = await db.presets.get(participant.presetId)
      if (preset) {
        await db.presets.update(preset.id, { wins: (preset.wins || 0) + 1 })
        presetForEffect = preset
      }
    }
    if (showEffect) setWinPreset(presetForEffect)
  }

  async function handleWin(participant) {
    await applyWin(participant, true)
    setActionFor(null)
  }

  async function handleSwap(newPreset) {
    await db.participants.update(actionFor.id, { presetId: newPreset.id, name: newPreset.name, title: newPreset.title || '' })
    setSwapMode(false)
    setActionFor(null)
  }

  async function finalizeSession() {
    await db.sessions.update(sid, { endedAt: Date.now() })
    nav(`/result/${sid}`)
  }

  function toggleWinner(key) {
    setSelectedWinners(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key])
  }

  async function confirmWinners() {
    if (teamMode) {
      for (const team of selectedWinners) {
        const members = participants.filter(p => p.team === team)
        for (const p of members) await applyWin(p, false)
      }
    } else {
      for (const id of selectedWinners) {
        const p = participants.find(x => x.id === id)
        if (p) await applyWin(p, false)
      }
    }
    await finalizeSession()
  }

  function endGame() {
    const wantCheck = window.confirm('승리자 체크를 하시겠습니까?')
    if (wantCheck) {
      setSelectedWinners([])
      setFinalCheck(true)
    } else {
      finalizeSession()
    }
  }

  function ParticipantChip({ p }) {
    return (
      <button
        className="play-participant-chip"
        style={{ backgroundColor: colorForParticipant(p.presetId ?? p.name) }}
        onClick={() => setActionFor(p)}
      >
        <DisplayName title={p.title} name={p.name} />
      </button>
    )
  }

  return (
    <div
      className="play-screen"
      style={{ backgroundImage: `url(${backgroundUrl || DEFAULT_BACKGROUND})` }}
    >
      {bgmUrl && <audio src={bgmUrl} autoPlay loop muted={muted} />}

      <div className="play-topbar">
        <span className="play-timer">{formatDuration(elapsedMs)}</span>
        <button className="play-mute-btn" onClick={() => setMuted(m => !m)}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      <div className="play-bottom">
        <div className="play-participants-list">
          {teamMode ? (
            teamNames.map(team => (
              <div key={team} className="play-team-group">
                <span className="play-team-label">{team}</span>
                <div className="play-team-members">
                  {sorted.filter(p => p.team === team).map(p => <ParticipantChip key={p.id} p={p} />)}
                </div>
              </div>
            ))
          ) : (
            sorted.map(p => <ParticipantChip key={p.id} p={p} />)
          )}
        </div>

        <div className="play-bottom-controls">
          <button className="play-timer-btn" onClick={() => setTimerOpen(true)}>
            {timer.phase === 'idle' ? '🕐' : formatDuration(timer.seconds * 1000)}
          </button>
          <button className="play-end-btn btn danger" onClick={endGame}>게임 종료</button>
        </div>
      </div>

      {actionFor && !swapMode && (
        <Modal onClose={() => setActionFor(null)}>
          <h2><DisplayName title={actionFor.title} name={actionFor.name} /></h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn secondary" onClick={() => setSwapMode(true)}>수정</button>
            <button className="btn" onClick={() => handleWin(actionFor)}>승리</button>
          </div>
        </Modal>
      )}

      {actionFor && swapMode && (
        <Modal onClose={() => { setSwapMode(false); setActionFor(null) }}>
          <ParticipantPicker
            excludeIds={currentPresetIds.filter(id => id !== actionFor.presetId)}
            onSelect={handleSwap}
          />
        </Modal>
      )}

      {winPreset && <WinEffect preset={winPreset} onDone={() => setWinPreset(null)} />}

      {finalCheck && (
        <Modal onClose={() => setFinalCheck(false)}>
          <h2>승리자 체크</h2>
          {teamMode ? (
            <>
              <p style={{ color: '#888' }}>승리한 팀을 모두 선택하세요 (복수 선택 가능).</p>
              {teamNames.map(team => (
                <label key={team} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                  <input
                    type="checkbox"
                    checked={selectedWinners.includes(team)}
                    onChange={() => toggleWinner(team)}
                  />
                  {team} ({participants.filter(p => p.team === team).length}명)
                </label>
              ))}
            </>
          ) : (
            <>
              <p style={{ color: '#888' }}>승리한 참가자를 모두 선택하세요 (복수 선택 가능).</p>
              {sorted.map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                  <input
                    type="checkbox"
                    checked={selectedWinners.includes(p.id)}
                    onChange={() => toggleWinner(p.id)}
                  />
                  <DisplayName title={p.title} name={p.name} /> · 승리 {p.wins}회
                </label>
              ))}
            </>
          )}
          <button className="btn" style={{ width: '100%', marginTop: 8 }} onClick={confirmWinners}>완료</button>
        </Modal>
      )}

      {timerOpen && (
        <Modal onClose={() => setTimerOpen(false)}>
          <PlayTimerPopup timer={timer} onClose={() => setTimerOpen(false)} />
        </Modal>
      )}
    </div>
  )
}
