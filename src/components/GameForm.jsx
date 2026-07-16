import React, { useState } from 'react'
import { GENRES } from '../config/genres.js'

// 게임 생성/수정 공용 폼.
// 배경화면/배경음악/효과음은 GameDetail 화면에서 바로 다루므로 여기서는 다루지 않는다.
// 서포트 도구 타입(자원/토큰 카운터)은 당분간 안 쓰기로 해서 UI에서 숨겨뒀다 -
// 기존 값은 그대로 두고(수정 시 건드리지 않음), 새로 만드는 게임은 GameEditor에서 'generic'으로 고정된다.
export default function GameForm({ mode, initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [genre, setGenre] = useState(initial?.genre ?? GENRES[0])
  const [note, setNote] = useState(initial?.note ?? '')
  const [teamMode, setTeamMode] = useState(initial?.teamMode ?? false)

  function submit() {
    if (!name.trim()) return alert('게임 이름은 필수예요.')

    const payload = {
      name: name.trim(),
      genre,
      note,
      teamMode,
    }
    onSubmit(payload)
  }

  return (
    <div>
      <div className="card">
        <h2>게임 이름</h2>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="게임 이름" />

        <h2>장르</h2>
        <select value={genre} onChange={e => setGenre(e.target.value)}>
          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <h2>비고 (인원 등)</h2>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="예: 3~4인용" />

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <input type="checkbox" checked={teamMode} onChange={e => setTeamMode(e.target.checked)} />
          팀전으로 진행
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn" onClick={submit}>{mode === 'edit' ? '저장' : '만들기'}</button>
        {onCancel && <button className="btn secondary" onClick={onCancel}>취소</button>}
      </div>
    </div>
  )
}
