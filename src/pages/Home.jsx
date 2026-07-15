import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'
import { useAdminMode } from '../context/AdminModeContext.jsx'

export default function Home() {
  const [query, setQuery] = useState('')
  const nav = useNavigate()
  const { isAdmin } = useAdminMode()

  // useLiveQuery: DB 내용이 바뀌면 화면도 자동으로 새로고침 해주는 훅.
  // '엑셀 표를 실시간으로 지켜보고 있다가 바뀌면 즉시 화면에 반영'하는 느낌.
  const games = useLiveQuery(
    () => db.games.filter(g => g.name.includes(query)).toArray(),
    [query]
  )

  return (
    <div>
      <h1>게임 선택</h1>
      <input
        placeholder="게임 이름 검색..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      <button className="btn" style={{ marginBottom: 12 }} onClick={() => nav('/game/new')}>
        + 새 게임 만들기
      </button>

      {games?.map(g => (
        <div key={g.id} className="card" onClick={() => nav(`/game/${g.id}`)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2 style={{ margin: 0 }}>{g.name}</h2>
            {isAdmin && (
              <button
                className="btn secondary"
                onClick={e => { e.stopPropagation(); nav(`/game/${g.id}/edit`) }}
              >
                수정
              </button>
            )}
          </div>
          <p style={{ color: '#888', margin: '4px 0 0' }}>{g.genre}{g.note && ` · ${g.note}`}</p>
        </div>
      ))}
      {games?.length === 0 && <p>검색 결과가 없어요.</p>}
    </div>
  )
}
