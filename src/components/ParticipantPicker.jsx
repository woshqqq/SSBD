import React, { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'

// 프리셋 목록에서 고르는 리스트. 이미 참가 중인 presetId는 목록에서 제외한다.
// multiSelect=false(기본): 클릭하면 즉시 onSelect(preset) 호출 (Play 화면의 "수정" 교체용)
// multiSelect=true: 체크박스로 여러 명 고른 뒤 "추가" 버튼을 눌러야 onConfirm(presets[]) 호출
export default function ParticipantPicker({ excludeIds = [], onSelect, multiSelect = false, onConfirm }) {
  const presets = useLiveQuery(() => db.presets.toArray(), [])
  const available = presets?.filter(p => !excludeIds.includes(p.id))
  const [checked, setChecked] = useState([])

  function toggle(id) {
    setChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function confirm() {
    const chosen = available.filter(p => checked.includes(p.id))
    if (chosen.length === 0) return alert('한 명 이상 선택해주세요.')
    onConfirm(chosen)
  }

  return (
    <div>
      <h2>프리셋 선택</h2>
      {available?.length === 0 && <p style={{ color: '#888' }}>고를 수 있는 캐릭터가 없어요.</p>}
      {available?.map(p => (
        <div
          key={p.id}
          className="card"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
          onClick={() => multiSelect ? toggle(p.id) : onSelect(p)}
        >
          {multiSelect && (
            <input type="checkbox" checked={checked.includes(p.id)} readOnly />
          )}
          <div>
            <h2 style={{ margin: 0 }}>{p.name}</h2>
            <p style={{ color: '#888', margin: '4px 0 0' }}>
              승리 {p.wins}회 · 참여 {p.playCount}회
            </p>
          </div>
        </div>
      ))}
      {multiSelect && (
        <button className="btn" style={{ width: '100%', marginTop: 8 }} onClick={confirm}>추가</button>
      )}
    </div>
  )
}
