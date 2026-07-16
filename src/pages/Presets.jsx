import React, { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'
import { useObjectUrl } from '../hooks/useObjectUrl.js'
import { blobFieldsToDataUrls, dataUrlFieldsToBlobs } from '../utils/blobBase64.js'
import { pickRandomDefaultCharacter } from '../config/defaultCharacters.js'
import Modal from '../components/Modal.jsx'
import PresetForm from '../components/PresetForm.jsx'
import DisplayName from '../components/DisplayName.jsx'
import CharacterImagePicker from '../components/CharacterImagePicker.jsx'

const empty = { name: '', title: '', job: '', specialty: '', hobby: '' }
const IMAGE_FIELDS = ['image']

function PresetCard({ preset, onEdit, onDelete }) {
  // preset.image는 업로드한 Blob이거나, 자동 배정된 기본 이미지 경로(문자열)일 수 있다.
  const isBlobImage = preset.image instanceof Blob
  const objectUrl = useObjectUrl(isBlobImage ? preset.image : null)
  const imageSrc = isBlobImage ? objectUrl : preset.image

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {imageSrc ? (
          <img src={imageSrc} alt={preset.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-secondary-bg)' }} />
        )}
        <div>
          <h2 style={{ margin: 0 }}><DisplayName title={preset.title} name={preset.name} /></h2>
          <p style={{ color: '#888', margin: '4px 0 0' }}>
            {preset.job} · {preset.specialty} · {preset.hobby}
          </p>
        </div>
      </div>

      <p>승리 {preset.wins}회 · 참여 {preset.playCount}회</p>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn secondary" onClick={() => onEdit(preset)}>수정</button>
        <button className="btn danger" onClick={() => onDelete(preset)}>삭제</button>
      </div>
    </div>
  )
}

export default function Presets() {
  const [form, setForm] = useState(empty)
  const [image, setImage] = useState(null) // File(업로드) 또는 문자열 경로(기본 이미지 선택) 또는 null(자동 배정)
  const presets = useLiveQuery(() => db.presets.toArray(), [])
  const fileInputRef = useRef(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editing, setEditing] = useState(null)

  async function exportData() {
    const [rawPresets, participants, sessions] = await Promise.all([
      db.presets.toArray(),
      db.participants.toArray(),
      db.sessions.toArray(),
    ])
    const presetsForExport = await Promise.all(
      rawPresets.map(p => blobFieldsToDataUrls(p, IMAGE_FIELDS))
    )
    const payload = {
      exportedAt: new Date().toISOString(),
      presets: presetsForExport,
      participants,
      sessions,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `boardgame-backup-${payload.exportedAt.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function triggerImport() {
    fileInputRef.current?.click()
  }

  async function importData(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    let data
    try {
      data = JSON.parse(await file.text())
    } catch {
      alert('올바른 JSON 파일이 아니에요.')
      return
    }

    if (!Array.isArray(data.presets) || !Array.isArray(data.participants) || !Array.isArray(data.sessions)) {
      alert('백업 파일 형식이 올바르지 않아요 (presets/participants/sessions 필요).')
      return
    }

    const overwrite = window.confirm(
      '가져오기를 하면 기존 캐릭터/참가자/세션 데이터가 모두 삭제되고 백업 파일 내용으로 교체돼요. 계속할까요?'
    )
    if (!overwrite) return

    const presetsToImport = await Promise.all(
      data.presets.map(p => dataUrlFieldsToBlobs(p, IMAGE_FIELDS))
    )

    await db.transaction('rw', db.presets, db.participants, db.sessions, async () => {
      await Promise.all([db.presets.clear(), db.participants.clear(), db.sessions.clear()])
      await Promise.all([
        db.presets.bulkAdd(presetsToImport),
        db.participants.bulkAdd(data.participants),
        db.sessions.bulkAdd(data.sessions),
      ])
    })

    alert('가져오기가 완료됐어요.')
  }

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function add() {
    if (!form.name) return alert('이름은 필수예요.')
    const finalImage = image ?? pickRandomDefaultCharacter().image
    await db.presets.add({ ...form, image: finalImage, wins: 0, playCount: 0, badges: [] })
    setForm(empty)
    setImage(null)
  }

  function requestDelete(preset) {
    setDeleteTarget(preset)
  }

  async function confirmDelete(preset) {
    if (window.confirm('삭제하시겠습니까?')) {
      await db.presets.delete(preset.id)
    }
    setDeleteTarget(null)
  }

  async function saveEdit(payload) {
    await db.presets.update(editing.id, payload)
    setEditing(null)
  }

  return (
    <div>
      <h1>캐릭터 프리셋</h1>

      <div className="card">
        <h2>데이터 백업</h2>
        <p style={{ color: '#888', margin: '4px 0 12px' }}>캐릭터 · 참가자 · 세션 데이터를 파일로 저장하거나 복원해요.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn secondary" onClick={exportData}>내보내기</button>
          <button className="btn secondary" onClick={triggerImport}>가져오기</button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={importData}
        />
      </div>

      <div className="card">
        <h2>새 캐릭터 등록</h2>
        <input placeholder="이름" value={form.name} onChange={e => update('name', e.target.value)} />
        <input placeholder="칭호 (예: 독재자)" value={form.title} onChange={e => update('title', e.target.value)} />
        <input placeholder="직업" value={form.job} onChange={e => update('job', e.target.value)} />
        <input placeholder="특기" value={form.specialty} onChange={e => update('specialty', e.target.value)} />
        <input placeholder="취미" value={form.hobby} onChange={e => update('hobby', e.target.value)} />

        <p style={{ color: '#888', margin: '4px 0' }}>기본 이미지 중 하나를 골라주세요 (안 고르면 자동으로 배정돼요).</p>
        <CharacterImagePicker value={typeof image === 'string' ? image : null} onSelect={setImage} />

        <p style={{ color: '#888', margin: '12px 0 4px' }}>또는 직접 이미지를 올릴 수도 있어요.</p>
        <input type="file" accept="image/*,.png,.jpg,.jpeg,.webp,.heic" onChange={e => setImage(e.target.files?.[0] ?? null)} />

        <button className="btn" style={{ marginTop: 8 }} onClick={add}>등록</button>
      </div>

      {presets?.map(p => (
        <PresetCard key={p.id} preset={p} onEdit={setEditing} onDelete={requestDelete} />
      ))}

      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <h2>삭제하시겠습니까?</h2>
          <p style={{ color: '#888' }}>{deleteTarget.name} 캐릭터를 삭제해요. 되돌릴 수 없어요.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn danger" onClick={() => confirmDelete(deleteTarget)}>삭제</button>
            <button className="btn secondary" onClick={() => setDeleteTarget(null)}>취소</button>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <PresetForm preset={editing} onSave={saveEdit} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  )
}
