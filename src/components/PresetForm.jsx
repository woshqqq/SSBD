import React, { useState } from 'react'
import { useObjectUrl } from '../hooks/useObjectUrl.js'

// 캐릭터 상세 수정 폼. 정보뿐 아니라 승리/참여 횟수까지 수동으로 조정할 수 있다.
export default function PresetForm({ preset, onSave, onCancel }) {
  const [name, setName] = useState(preset.name)
  const [job, setJob] = useState(preset.job || '')
  const [specialty, setSpecialty] = useState(preset.specialty || '')
  const [hobby, setHobby] = useState(preset.hobby || '')
  const [wins, setWins] = useState(preset.wins || 0)
  const [playCount, setPlayCount] = useState(preset.playCount || 0)
  const [imageFile, setImageFile] = useState(null)

  const isBlobImage = (imageFile ?? preset.image) instanceof Blob
  const objectUrl = useObjectUrl(isBlobImage ? (imageFile ?? preset.image) : null)
  const imagePreview = isBlobImage ? objectUrl : (imageFile ? null : preset.image)

  function save() {
    if (!name.trim()) return alert('이름은 필수예요.')
    const payload = {
      name: name.trim(), job, specialty, hobby,
      wins: Number(wins) || 0,
      playCount: Number(playCount) || 0,
    }
    if (imageFile) payload.image = imageFile
    onSave(payload)
  }

  return (
    <div>
      <h2>캐릭터 정보 수정</h2>

      {imagePreview && <img src={imagePreview} alt={name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }} />}
      <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />

      <input placeholder="이름" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="직업" value={job} onChange={e => setJob(e.target.value)} />
      <input placeholder="특기" value={specialty} onChange={e => setSpecialty(e.target.value)} />
      <input placeholder="취미" value={hobby} onChange={e => setHobby(e.target.value)} />

      <div style={{ display: 'flex', gap: 8 }}>
        <label style={{ flex: 1 }}>
          승리 횟수
          <input type="number" value={wins} onChange={e => setWins(e.target.value)} />
        </label>
        <label style={{ flex: 1 }}>
          참여 횟수
          <input type="number" value={playCount} onChange={e => setPlayCount(e.target.value)} />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn" onClick={save}>저장</button>
        <button className="btn secondary" onClick={onCancel}>취소</button>
      </div>
    </div>
  )
}
