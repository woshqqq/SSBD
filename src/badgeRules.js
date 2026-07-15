import { db } from './db.js'
import { publicPath } from './utils/publicPath.js'

// 뱃지 규칙: 나중에 이 배열에 항목을 더 추가하면 새 뱃지가 생긴다.
// 뱃지 이미지 파일은 public/badges/ 아래에 직접 넣어두면 된다 (지금은 경로만 참조).
export const BADGE_RULES = [
  {
    id: 'godfather',
    name: '대부',
    icon: publicPath('badges/godfather.png'),
    description: "'마피아' 게임에서 10회 우승",
    check: async preset => (await winsForGameName(preset.id, '마피아')) >= 10,
  },
  {
    id: 'happy-gamer',
    name: '즐거운 게이머',
    icon: publicPath('badges/happy-gamer.png'),
    description: '전체 누적 10회 우승',
    check: async preset => (preset.wins || 0) >= 10,
  },
  {
    id: 'is-real-life-ok',
    name: '현생은 괜찮으신가요?',
    icon: publicPath('badges/reality-check.png'),
    description: '전체 누적 100회 참여',
    check: async preset => (preset.playCount || 0) >= 100,
  },
]

export function getBadgeRule(id) {
  return BADGE_RULES.find(r => r.id === id)
}

// participants(presetId 인덱스) -> sessions -> games로 조인해서
// 특정 게임 이름에서의 누적 승수(세션별 wins 합)를 구한다.
export async function winsForGameName(presetId, gameName) {
  const parts = await db.participants.where('presetId').equals(presetId).toArray()
  let total = 0
  for (const p of parts) {
    const session = await db.sessions.get(p.sessionId)
    const game = session && await db.games.get(session.gameId)
    if (game?.name === gameName) total += p.wins || 0
  }
  return total
}

// 규칙을 전부 재평가해서 새로 획득한 뱃지가 있으면 preset.badges에 추가한다.
// 이미 딴 뱃지는 조건을 더 이상 만족하지 않아도 박탈하지 않는다 (성취 시스템 특성).
export async function recalculateBadges(presetId) {
  const preset = await db.presets.get(presetId)
  if (!preset) return

  const earned = []
  for (const rule of BADGE_RULES) {
    if (await rule.check(preset)) earned.push(rule.id)
  }

  const merged = Array.from(new Set([...(preset.badges || []), ...earned]))
  if (merged.length !== (preset.badges || []).length) {
    await db.presets.update(presetId, { badges: merged })
  }
}
