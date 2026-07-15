import React from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'

// 프리셋 목록에서 하나를 고르는 리스트. 이미 참가 중인 presetId는 목록에서 제외한다.
// Modal 안에 넣어서 쓰는 것을 전제로, 여기서는 리스트 UI만 그린다.
export default function ParticipantPicker({ excludeIds = [], onSelect }) {
  const presets = useLiveQuery(() => db.presets.toArray(), [])
  const available = presets?.filter(p => !excludeIds.includes(p.id))

  return (
    <div>
      <h2>프리셋 선택</h2>
      {available?.length === 0 && <p style={{ color: '#888' }}>고를 수 있는 캐릭터가 없어요.</p>}
      {available?.map(p => (
        <div
          key={p.id}
          className="card"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelect(p)}
        >
          <h2 style={{ margin: 0 }}>{p.name}</h2>
          <p style={{ color: '#888', margin: '4px 0 0' }}>
            승리 {p.wins}회 · 참여 {p.playCount}회
          </p>
        </div>
      ))}
    </div>
  )
}
