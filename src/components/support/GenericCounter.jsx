import React, { useState } from 'react'

// supportType이 'generic'이거나 알 수 없는 값일 때 쓰는 범용 카운터 (기존 SupportTool 동작 그대로).
export default function GenericCounter() {
  const [counters, setCounters] = useState({ A: 0, B: 0, C: 0 })

  function change(key, delta) {
    setCounters(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }))
  }

  return (
    <div>
      {Object.entries(counters).map(([key, value]) => (
        <div key={key} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>재화 {key}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn secondary" onClick={() => change(key, -1)}>-</button>
            <span style={{ fontSize: 24, minWidth: 32, textAlign: 'center' }}>{value}</span>
            <button className="btn secondary" onClick={() => change(key, 1)}>+</button>
          </div>
        </div>
      ))}
    </div>
  )
}
