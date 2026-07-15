import React, { useState } from 'react'

const DEFAULT_RESOURCES = ['자원 1', '자원 2', '자원 3', '자원 4', '자원 5'].map((label, i) => ({
  id: i,
  label,
  count: 0,
}))

// 카탄처럼 여러 종류의 자원을 개별로 세는 카운터.
// 실제 게임별 자원 이름은 아직 정해지지 않아, 라벨을 사용자가 직접 수정할 수 있게 했다.
export default function ResourceCounter() {
  const [resources, setResources] = useState(DEFAULT_RESOURCES)

  function change(id, delta) {
    setResources(prev => prev.map(r => r.id === id ? { ...r, count: Math.max(0, r.count + delta) } : r))
  }

  function rename(id, label) {
    setResources(prev => prev.map(r => r.id === id ? { ...r, label } : r))
  }

  return (
    <div>
      {resources.map(r => (
        <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <input
            value={r.label}
            onChange={e => rename(r.id, e.target.value)}
            style={{ margin: 0, fontWeight: 600, flex: 1 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn secondary" onClick={() => change(r.id, -1)}>-</button>
            <span style={{ fontSize: 24, minWidth: 32, textAlign: 'center' }}>{r.count}</span>
            <button className="btn secondary" onClick={() => change(r.id, 1)}>+</button>
          </div>
        </div>
      ))}
    </div>
  )
}
