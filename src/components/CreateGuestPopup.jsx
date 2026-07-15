import React, { useState } from 'react'

// 게스트는 DB에 저장되지 않는 1회용 참가자.
// "인원 추가"로 이름 입력칸을 계속 늘리고, "확인"을 눌러야 한 번에 참가자 목록에 반영된다.
export default function CreateGuestPopup({ onConfirm }) {
  const [names, setNames] = useState([''])

  function updateName(i, value) {
    setNames(prev => prev.map((n, idx) => idx === i ? value : n))
  }

  function addRow() {
    setNames(prev => [...prev, ''])
  }

  function removeRow(i) {
    setNames(prev => prev.filter((_, idx) => idx !== i))
  }

  function confirm() {
    const guests = names
      .map(n => n.trim())
      .filter(Boolean)
      .map(name => ({
        key: `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        presetId: null,
        name,
      }))
    if (guests.length === 0) return alert('이름을 하나 이상 입력해주세요.')
    onConfirm(guests)
  }

  return (
    <div>
      <h2>게스트 생성</h2>
      <p style={{ color: '#888', margin: '4px 0 12px' }}>
        이번 게임에서만 쓰이는 1회용 참가자예요. "인원 추가"로 여러 명을 한 번에 입력한 뒤 "확인"을 누르면 반영돼요.
      </p>

      {names.map((name, i) => (
        <div key={i} style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder={`게스트 ${i + 1} 이름`}
            value={name}
            onChange={e => updateName(i, e.target.value)}
          />
          {names.length > 1 && (
            <button className="btn danger" onClick={() => removeRow(i)}>×</button>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button className="btn secondary" onClick={addRow}>인원 추가</button>
        <button className="btn" onClick={confirm}>확인</button>
      </div>
    </div>
  )
}
