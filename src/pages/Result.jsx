import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'
import { formatDuration } from '../utils/formatDuration.js'
import DisplayName from '../components/DisplayName.jsx'
import ParticipantPortrait from '../components/ParticipantPortrait.jsx'

export default function Result() {
  const { sessionId } = useParams()
  const nav = useNavigate()
  const sid = Number(sessionId)

  const session = useLiveQuery(() => db.sessions.get(sid), [sid])
  const game = useLiveQuery(() => session ? db.games.get(session.gameId) : null, [session])
  const participants = useLiveQuery(
    () => db.participants.where('sessionId').equals(sid).toArray(),
    [sid]
  )

  if (!session || !game || !participants) return <p>불러오는 중...</p>

  const teamMode = Boolean(game.teamMode)
  const playTimeMs = (session.endedAt ?? Date.now()) - session.startedAt

  let winnerLabel = '기록된 승리 없음'
  let teamGroups = []

  if (teamMode) {
    const teamNames = [...new Set(participants.map(p => p.team).filter(Boolean))].sort()
    teamGroups = teamNames.map(team => {
      const members = participants.filter(p => p.team === team)
      const score = members.reduce((sum, p) => sum + (p.wins || 0), 0)
      return { team, members, score }
    })
    const maxScore = Math.max(0, ...teamGroups.map(g => g.score))
    const winningTeams = maxScore > 0 ? teamGroups.filter(g => g.score === maxScore).map(g => g.team) : []
    if (winningTeams.length > 0) winnerLabel = winningTeams.join(', ')
  } else {
    const maxWins = Math.max(0, ...participants.map(p => p.wins || 0))
    const winners = maxWins > 0 ? participants.filter(p => (p.wins || 0) === maxWins) : []
    if (winners.length > 0) {
      winnerLabel = winners.map(w => w.name).join(', ')
    }
  }

  return (
    <div>
      <h1>{game.name}</h1>
      <p style={{ color: '#888' }}>{game.genre}{game.note && ` · ${game.note}`}</p>

      <div className="card">
        <h2>{teamMode ? '우승팀' : '우승자'}</h2>
        <p>{winnerLabel}</p>
      </div>

      <div className="card">
        <h2>게임플레이 시간</h2>
        <p>{formatDuration(playTimeMs)}</p>
      </div>

      {teamMode ? (
        teamGroups.map(({ team, members, score }) => (
          <div key={team} className="card">
            <h2>{team} · 승리 {score}회</h2>
            {members.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ParticipantPortrait image={p.image} name={p.name} className="result-participant-portrait" />
                  <DisplayName title={p.title} name={p.name} />
                </span>
                <span>승리 {p.wins || 0}회</span>
              </div>
            ))}
          </div>
        ))
      ) : (
        <div className="card">
          <h2>참석자 목록</h2>
          {participants.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ParticipantPortrait image={p.image} name={p.name} className="result-participant-portrait" />
                <DisplayName title={p.title} name={p.name} />
              </span>
              <span>승리 {p.wins || 0}회</span>
            </div>
          ))}
        </div>
      )}

      <button className="btn" style={{ width: '100%' }} onClick={() => nav('/')}>게임 선택창으로</button>
    </div>
  )
}
