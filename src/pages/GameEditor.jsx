import React from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, defaultResources } from '../db.js'
import { useAdminMode } from '../context/AdminModeContext.jsx'
import GameForm from '../components/GameForm.jsx'

export default function GameEditor() {
  const { id } = useParams()
  const nav = useNavigate()
  const { isAdmin } = useAdminMode()
  const isEdit = Boolean(id)

  const game = useLiveQuery(() => isEdit ? db.games.get(Number(id)) : null, [id])

  // 수정 화면은 관리자 모드에서만 접근 가능. 새 게임 만들기는 누구나 가능.
  if (isEdit && !isAdmin) return <Navigate to={`/game/${id}`} replace />
  if (isEdit && !game) return <p>불러오는 중...</p>

  async function handleSubmit(payload) {
    if (isEdit) {
      await db.games.update(Number(id), payload)
      nav(`/game/${id}`)
    } else {
      const newId = await db.games.add({
        ...payload,
        supportType: 'generic', // 서포트 도구는 당분간 숨김 처리 - 항상 범용으로 생성
        bgm: null,
        backgroundImage: null,
        resources: defaultResources(),
      })
      nav(`/game/${newId}`)
    }
  }

  return (
    <div>
      <button className="btn secondary" onClick={() => nav(-1)}>← 뒤로</button>
      <h1>{isEdit ? '게임 정보 수정' : '새 게임 만들기'}</h1>
      <GameForm mode={isEdit ? 'edit' : 'create'} initial={game} onSubmit={handleSubmit} />
    </div>
  )
}
