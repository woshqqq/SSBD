import React, { useState } from 'react'

const DEFAULT_TOKENS = ['토큰 1', '토큰 2', '토큰 3', '토큰 4', '토큰 5'].map((label, i) => ({
  id: i,
  label,
  count: 0,
}))

// 스플렌더처럼 보석 토큰 5종 + 포인트를 함께 세는 카운터.
// 토큰 이름은 아직 정해지지 않아, 라벨을 사용자가 직접 수정할 수 있게 했다.
// 포인트는 토큰 개수와 무관하게 사용자가 직접 +1/-1로 누적한다 (카드마다 명성점수가 달라 자동 합산이 불가능).
export default function TokenCounter() {
  const [tokens, setTokens] = useState(DEFAULT_TOKENS)
  const [points, setPoints] = useState(0)

  function change(id, delta) {
    setTokens(prev => prev.map(t => t.id === id ? { ...t, count: Math.max(0, t.count + delta) } : t))
  }

  function rename(id, label) {
    setTokens(prev => prev.map(t => t.id === id ? { ...t, label } : t))
  }

  return (
    <div>
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>포인트</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn secondary" onClick={() => setPoints(p => Math.max(0, p - 1))}>-</button>
          <span style={{ fontSize: 24, minWidth: 32, textAlign: 'center' }}>{points}</span>
          <button className="btn secondary" onClick={() => setPoints(p => p + 1)}>+</button>
        </div>
      </div>

      {tokens.map(t => (
        <div key={t.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <input
            value={t.label}
            onChange={e => rename(t.id, e.target.value)}
            style={{ margin: 0, fontWeight: 600, flex: 1 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn secondary" onClick={() => change(t.id, -1)}>-</button>
            <span style={{ fontSize: 24, minWidth: 32, textAlign: 'center' }}>{t.count}</span>
            <button className="btn secondary" onClick={() => change(t.id, 1)}>+</button>
          </div>
        </div>
      ))}
    </div>
  )
}
