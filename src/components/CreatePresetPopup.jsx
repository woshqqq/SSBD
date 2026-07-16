import React, { useState } from 'react'
import { db } from '../db.js'
import { pickRandomDefaultCharacter } from '../config/defaultCharacters.js'

// 이름만 받아 그 자리에서 즉석으로 캐릭터(preset)를 만든다.
// 이미지는 기본 이미지 중 하나가 자동 배정되고, 나머지 상세 정보는 캐릭터 화면에서 나중에 채우면 된다.
export default function CreatePresetPopup({ onCreated }) {
  const [name, setName] = useState('')

  async function create() {
    if (!name.trim()) return alert('이름은 필수예요.')

    const image = pickRandomDefaultCharacter().image
    const id = await db.presets.add({
      name: name.trim(),
      job: '', specialty: '', hobby: '',
      image,
      wins: 0,
      playCount: 0,
      badges: [],
    })
    onCreated({ id, name: name.trim(), image })
  }

  return (
    <div>
      <h2>참가자 생성</h2>
      <input placeholder="이름" value={name} onChange={e => setName(e.target.value)} />
      <button className="btn" onClick={create}>생성하고 추가</button>
    </div>
  )
}
