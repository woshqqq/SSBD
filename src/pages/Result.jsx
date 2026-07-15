import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'
import { formatDuration } from '../utils/formatDuration.js'

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

  const maxWins = Math.max(0, ...participants.map(p => p.wins || 0))
  const winners = maxWins > 0 ? participants.filter(p => (p.wins || 0) === maxWins) : []
  const playTimeMs = (session.endedAt ?? Date.now()) - session.startedAt

  return (
    <div>
      <h1>{game.name}</h1>
      <p style={{ color: '#888' }}>{game.genre}{game.note && ` · ${game.note}`}</p>

      <div className="card">
        <h2>우승자</h2>
        <p>{winners.length > 0 ? winners.map(w => w.name).join(', ') : '기록된 승리 없음'}</p>
      </div>

      <div className="card">
        <h2>게임플레이 시간</h2>
        <p>{formatDuration(playTimeMs)}</p>
      </div>

      <div className="card">
        <h2>참석자 목록</h2>
        {participants.map(p => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span>{p.name}</span>
            <span>승리 {p.wins || 0}회</span>
          </div>
        ))}
      </div>

      <button className="btn" style={{ width: '100%' }} onClick={() => nav('/')}>게임 선택창으로</button>
    </div>
  )
}
