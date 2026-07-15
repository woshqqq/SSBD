import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'
import ResourceCounter from '../components/support/ResourceCounter.jsx'
import TokenCounter from '../components/support/TokenCounter.jsx'
import GenericCounter from '../components/support/GenericCounter.jsx'

// game.supportType 값에 따라 다른 서포트 도구 컴포넌트를 렌더링한다.
function SupportWidget({ supportType }) {
  switch (supportType) {
    case 'resource-counter':
      return <ResourceCounter />
    case 'token-counter':
      return <TokenCounter />
    default:
      return <GenericCounter />
  }
}

export default function SupportTool() {
  const { id } = useParams()
  const nav = useNavigate()
  const game = useLiveQuery(() => db.games.get(Number(id)), [id])

  if (!game) return <p>불러오는 중...</p>

  return (
    <div>
      <button className="btn secondary" onClick={() => nav(`/game/${game.id}`)}>← {game.name}으로</button>
      <h1>서포트 도구</h1>
      <p style={{ color: '#888' }}>타입: {game.supportType}</p>

      <SupportWidget supportType={game.supportType} />
    </div>
  )
}
