import React, { useState } from 'react'
import { formatDuration } from '../utils/formatDuration.js'

const PRESET_MINUTES = [3, 5, 10, 15]

// usePlayTimer()의 반환값을 그대로 받아 단계별(선택 -> 설정 -> 실행중) UI를 그린다.
export default function PlayTimerPopup({ timer, onClose }) {
  const [customMinutes, setCustomMinutes] = useState('')

  if (timer.phase === 'idle') {
    return (
      <div>
        <h2>타이머 / 스톱워치</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={timer.startStopwatch}>스톱워치</button>
          <button className="btn" onClick={timer.openTimerSetup}>타이머</button>
        </div>
      </div>
    )
  }

  if (timer.phase === 'setup') {
    return (
      <div>
        <h2>타이머 설정</h2>
        <div className="btn-grid">
          {PRESET_MINUTES.map(m => (
            <button key={m} className="btn secondary" onClick={() => timer.startTimer(m)}>{m}분</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            type="number"
            min="1"
            placeholder="직접 입력 (분)"
            value={customMinutes}
            onChange={e => setCustomMinutes(e.target.value)}
          />
          <button className="btn" onClick={() => customMinutes && timer.startTimer(Number(customMinutes))}>
            시작
          </button>
        </div>
        <button className="btn secondary" style={{ marginTop: 8 }} onClick={timer.reset}>취소</button>
      </div>
    )
  }

  // running | ended
  return (
    <div>
      <h2>{timer.kind === 'timer' ? '타이머' : '스톱워치'}</h2>
      <div className="timer-display">{formatDuration(timer.seconds * 1000)}</div>
      {timer.phase === 'ended' && <p style={{ color: '#888', textAlign: 'center' }}>시간이 종료됐어요.</p>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {timer.phase !== 'ended' && (
          <button className="btn secondary" onClick={timer.toggleActive}>
            {timer.active ? '일시정지' : '재개'}
          </button>
        )}
        <button className="btn danger" onClick={() => { timer.reset(); onClose() }}>종료</button>
      </div>
    </div>
  )
}
