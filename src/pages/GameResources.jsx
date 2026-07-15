import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'

const MIN_SLOTS = 0
const MAX_SLOTS = 10

// 리소스 슬롯 개수(0~10)와 각 라벨을 설정하는 화면. game.resources에 저장된다.
// 실제 게임 중 카운트 값 자체는 저장하지 않고 라벨/개수만 저장한다 (플레이 화면에서 매번 0부터 시작).
export default function GameResources() {
  const { id } = useParams()
  const nav = useNavigate()
  const game = useLiveQuery(() => db.games.get(Number(id)), [id])
  const [resources, setResources] = useState(null)

  useEffect(() => {
    if (game && resources === null) setResources(game.resources ?? [])
  }, [game, resources])

  if (!game || resources === null) return <p>불러오는 중...</p>

  function changeCount(n) {
    setResources(prev => {
      const next = [...prev]
      while (next.length < n) next.push({ id: Date.now() + next.length, label: `자원 ${next.length + 1}` })
      return next.slice(0, n)
    })
  }

  function rename(idx, label) {
    setResources(prev => prev.map((r, i) => i === idx ? { ...r, label } : r))
  }

  async function save() {
    await db.games.update(Number(id), { resources })
    nav(`/game/${id}`)
  }

  return (
    <div>
      <button className="btn secondary" onClick={() => nav(`/game/${id}`)}>← {game.name}으로</button>
      <h1>리소스 관리</h1>

      <div className="card">
        <h2>개수 ({resources.length}개)</h2>
        <div className="btn-grid">
          {Array.from({ length: MAX_SLOTS - MIN_SLOTS + 1 }, (_, i) => MIN_SLOTS + i).map(n => (
            <button
              key={n}
              className={`btn ${resources.length === n ? '' : 'secondary'}`}
              onClick={() => changeCount(n)}
            >
              {n}개
            </button>
          ))}
        </div>
      </div>

      {resources.length > 0 && (
        <div className="card">
          <h2>라벨</h2>
          {resources.map((r, i) => (
            <input key={r.id} value={r.label} onChange={e => rename(i, e.target.value)} />
          ))}
        </div>
      )}

      <button className="btn" onClick={save}>저장</button>
    </div>
  )
}
