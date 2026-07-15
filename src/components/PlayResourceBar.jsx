import React, { useState } from 'react'

// 게임 진행 화면 하단에 뜨는 리소스 카운터. game.resources(라벨)를 기반으로
// 이번 판에서만 쓰는 로컬 카운트를 0부터 센다 (세션에 저장하지 않음).
export default function PlayResourceBar({ resources }) {
  const [counts, setCounts] = useState(() => Object.fromEntries(resources.map(r => [r.id, 0])))

  function change(id, delta) {
    setCounts(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }))
  }

  if (resources.length === 0) return null

  return (
    <div className="resource-bar">
      {resources.map(r => (
        <div key={r.id} className="resource-bar-item">
          <span className="resource-bar-label">{r.label}</span>
          <div className="resource-bar-controls">
            <button className="btn secondary" onClick={() => change(r.id, -1)}>-</button>
            <span>{counts[r.id] || 0}</span>
            <button className="btn secondary" onClick={() => change(r.id, 1)}>+</button>
          </div>
        </div>
      ))}
    </div>
  )
}
