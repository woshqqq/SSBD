import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'
import { useAdminMode } from '../context/AdminModeContext.jsx'
import Modal from '../components/Modal.jsx'

export default function Home() {
  const [query, setQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const nav = useNavigate()
  const { isAdmin } = useAdminMode()

  // useLiveQuery: DB 내용이 바뀌면 화면도 자동으로 새로고침 해주는 훅.
  // '엑셀 표를 실시간으로 지켜보고 있다가 바뀌면 즉시 화면에 반영'하는 느낌.
  const games = useLiveQuery(
    () => db.games.filter(g => g.name.includes(query)).toArray(),
    [query]
  )

  async function confirmDelete(game) {
    await db.games.delete(game.id)
    setDeleteTarget(null)
  }

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
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn secondary"
                  onClick={e => { e.stopPropagation(); nav(`/game/${g.id}/edit`) }}
                >
                  수정
                </button>
                <button
                  className="btn danger"
                  onClick={e => { e.stopPropagation(); setDeleteTarget(g) }}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
          <p style={{ color: '#888', margin: '4px 0 0' }}>{g.genre}{g.note && ` · ${g.note}`}</p>
        </div>
      ))}
      {games?.length === 0 && <p>검색 결과가 없어요.</p>}

      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <h2>게임을 삭제하시겠습니까?</h2>
          <p style={{ color: '#888' }}>{deleteTarget.name}을(를) 삭제해요. 되돌릴 수 없어요 (이 게임으로 진행했던 기록은 남아있어요).</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn danger" onClick={() => confirmDelete(deleteTarget)}>삭제</button>
            <button className="btn secondary" onClick={() => setDeleteTarget(null)}>취소</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
