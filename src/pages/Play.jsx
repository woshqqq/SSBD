import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'
import { useObjectUrl } from '../hooks/useObjectUrl.js'
import { usePlayTimer } from '../hooks/usePlayTimer.js'
import { formatDuration } from '../utils/formatDuration.js'
import { colorForParticipant } from '../utils/participantColor.js'
import Modal from '../components/Modal.jsx'
import ParticipantPicker from '../components/ParticipantPicker.jsx'
import ParticipantPortrait from '../components/ParticipantPortrait.jsx'
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
  const [bgmPlaying, setBgmPlaying] = useState(true)
  const [actionFor, setActionFor] = useState(null) // participant being acted on
  const [swapMode, setSwapMode] = useState(false)
  const [winnersShown, setWinnersShown] = useState(null) // 승리 이펙트에 보여줄 승자 배열
  const [celebrateThenEnd, setCelebrateThenEnd] = useState(false)
  const [endGameOpen, setEndGameOpen] = useState(false)
  const [selectedWinners, setSelectedWinners] = useState([])
  const [timerOpen, setTimerOpen] = useState(false)
  const [activeEffectId, setActiveEffectId] = useState(null)
  const timer = usePlayTimer()
  const bgmRef = useRef(null)
  const effectRef = useRef(null)

  const backgroundUrl = useObjectUrl(game?.backgroundImage ?? null)
  const bgmUrl = useObjectUrl(game?.bgm ?? null)
  const soundEffects = game?.soundEffects || []
  const activeEffect = soundEffects.find(fx => fx.id === activeEffectId)
  const effectUrl = useObjectUrl(activeEffect?.file ?? null)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // 효과음이 바뀔 때마다(다른 버튼을 누르거나 처음 재생될 때) 처음부터 재생한다.
  useEffect(() => {
    if (effectUrl && effectRef.current) {
      effectRef.current.currentTime = 0
      effectRef.current.play().catch(() => {})
    }
  }, [effectUrl])

  if (!session || !game || !participants) return <p>불러오는 중...</p>

  const elapsedMs = now - session.startedAt
  const sorted = [...participants].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  const currentPresetIds = participants.filter(p => p.presetId).map(p => p.presetId)
  const teamMode = Boolean(game.teamMode)
  const teamNames = teamMode ? [...new Set(participants.map(p => p.team).filter(Boolean))].sort() : []

  // 배경음악 재생/정지: 안정성을 위해 자동재생에만 의존하지 않고 수동 버튼도 둔다.
  function toggleBgm() {
    if (!bgmRef.current) return
    if (bgmPlaying) {
      bgmRef.current.pause()
      setBgmPlaying(false)
    } else {
      bgmRef.current.play().catch(() => {})
      setBgmPlaying(true)
    }
  }

  // 효과음 버튼: 누르면 배경음악을 멈추고 효과음을 한 번만 재생, 다 끝나면 자동으로 배경음악 재개.
  // 재생 중인 효과음을 다시 누르면 처음부터 다시 재생한다(무한반복 아님, 매번 1회 재생).
  function playEffect(fx) {
    bgmRef.current?.pause()
    if (activeEffectId === fx.id && effectRef.current) {
      effectRef.current.currentTime = 0
      effectRef.current.play().catch(() => {})
    } else {
      setActiveEffectId(fx.id)
    }
  }

  function handleEffectEnded() {
    setActiveEffectId(null)
    if (bgmPlaying) bgmRef.current?.play().catch(() => {})
  }

  // 실제 승리 반영: 세션 참가자(wins)와 연결된 프리셋(전체 누적 wins)을 함께 갱신하고,
  // 승리 이펙트에 표시할 정보(이름/칭호/이미지)를 반환한다.
  async function applyWin(participant) {
    await db.participants.update(participant.id, { wins: (participant.wins || 0) + 1 })
    let effectData = { name: participant.name, title: participant.title, image: participant.image ?? null }
    if (participant.presetId) {
      const preset = await db.presets.get(participant.presetId)
      if (preset) {
        await db.presets.update(preset.id, { wins: (preset.wins || 0) + 1 })
        effectData = { name: preset.name, title: preset.title, image: preset.image }
      }
    }
    return effectData
  }

  async function handleWin(participant) {
    const effectData = await applyWin(participant)
    setActionFor(null)
    setCelebrateThenEnd(false)
    setWinnersShown([effectData])
  }

  async function handleSwap(newPreset) {
    await db.participants.update(actionFor.id, {
      presetId: newPreset.id,
      name: newPreset.name,
      title: newPreset.title || '',
      image: newPreset.image ?? null,
    })
    setSwapMode(false)
    setActionFor(null)
  }

  async function finalizeSession() {
    await db.sessions.update(sid, { endedAt: Date.now() })
    nav(`/result/${sid}`)
  }

  function dismissWinners() {
    setWinnersShown(null)
    if (celebrateThenEnd) {
      setCelebrateThenEnd(false)
      finalizeSession()
    }
  }

  function toggleWinner(key) {
    setSelectedWinners(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key])
  }

  async function confirmEndGame() {
    let winnerParticipants = []
    if (teamMode) {
      for (const team of selectedWinners) {
        winnerParticipants.push(...participants.filter(p => p.team === team))
      }
    } else {
      winnerParticipants = participants.filter(p => selectedWinners.includes(p.id))
    }

    setEndGameOpen(false)

    if (winnerParticipants.length === 0) {
      await finalizeSession()
      return
    }

    const effects = []
    for (const p of winnerParticipants) {
      effects.push(await applyWin(p))
    }
    setCelebrateThenEnd(true)
    setWinnersShown(effects)
  }

  function endGame() {
    setSelectedWinners([])
    setEndGameOpen(true)
  }

  function ParticipantChip({ p }) {
    return (
      <button
        className="play-participant-chip"
        style={{ backgroundColor: colorForParticipant(p.presetId ?? p.name) }}
        onClick={() => setActionFor(p)}
      >
        <ParticipantPortrait image={p.image} name={p.name} className="play-participant-portrait" />
        <DisplayName title={p.title} name={p.name} />
      </button>
    )
  }

  return (
    <div
      className="play-screen"
      style={{ backgroundImage: `url(${backgroundUrl || DEFAULT_BACKGROUND})` }}
    >
      {bgmUrl && <audio ref={bgmRef} src={bgmUrl} autoPlay loop muted={muted} onPlay={() => setBgmPlaying(true)} onPause={() => setBgmPlaying(false)} />}
      {effectUrl && <audio ref={effectRef} src={effectUrl} muted={muted} onEnded={handleEffectEnded} />}

      <div className="play-topbar">
        <span className="play-timer">{formatDuration(elapsedMs)}</span>
      </div>

      <div className="play-topcontrols">
        {soundEffects.map(fx => (
          <button
            key={fx.id}
            className={`play-soundfx-btn ${activeEffectId === fx.id ? 'active' : ''}`}
            onClick={() => playEffect(fx)}
          >
            {fx.name}
          </button>
        ))}
        <button className="play-timer-btn" onClick={() => setTimerOpen(true)}>
          {timer.phase === 'idle' ? '🕐' : formatDuration(timer.seconds * 1000)}
        </button>
        <button className="play-end-btn btn danger" onClick={endGame}>게임 종료</button>
      </div>

      <button className="play-mute-btn" onClick={() => setMuted(m => !m)}>
        {muted ? '🔇' : '🔊'}
      </button>
      {bgmUrl && (
        <button className="play-bgm-btn" onClick={toggleBgm}>
          {bgmPlaying ? '정지' : '재생'}
        </button>
      )}

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

      {winnersShown && <WinEffect winners={winnersShown} onDone={dismissWinners} />}

      {endGameOpen && (
        <Modal onClose={() => setEndGameOpen(false)}>
          <h2>게임 종료</h2>
          {teamMode ? (
            <>
              <p style={{ color: '#888' }}>우승한 팀이 있으면 체크하세요 (선택 사항).</p>
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
              <p style={{ color: '#888' }}>우승자가 있으면 체크하세요 (선택 사항).</p>
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
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn danger" onClick={confirmEndGame}>종료</button>
            <button className="btn secondary" onClick={() => setEndGameOpen(false)}>취소</button>
          </div>
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
