import Dexie from 'dexie'
import { publicPath } from './utils/publicPath.js'

// Dexie는 브라우저 내장 저장소인 IndexedDB를 쉽게 다루게 해주는 라이브러리.
// 여기서 정의하는 각 table은 엑셀 시트 하나라고 생각하면 된다.
// 인터넷도, 서버도, DB 비용도 필요 없다 - 전부 이 기기 안에만 저장됨.

export const db = new Dexie('boardgameCompanionDB')

db.version(1).stores({
  games: '++id, name',
  participants: '++id, sessionId, name, presetId',
  presets: '++id, name',
  sessions: '++id, gameId, createdAt'
})

db.version(2).stores({
  games: '++id, name',
  presets: '++id, name',
  participants: '++id, sessionId, presetId, name',
  sessions: '++id, gameId, createdAt'
}).upgrade(async tx => {
  // games.badges(숫자→뱃지id배열), games.bgmFile(문자열 경로→Blob) 등
  // 필드 의미가 전면 개편되므로, 로컬 개발 DB 특성상 데이터 보존 대신 초기화한다.
  // App.jsx가 마운트될 때 seedGamesIfEmpty()가 새 구조로 다시 채워준다.
  await Promise.all([
    tx.table('games').clear(),
    tx.table('presets').clear(),
    tx.table('participants').clear(),
    tx.table('sessions').clear()
  ])
})

export function defaultResources() {
  return Array.from({ length: 5 }, (_, i) => ({ id: i, label: `자원 ${i + 1}` }))
}

// public/ 폴더에 미리 넣어둔 파일을 실제 업로드한 것과 똑같은 형태(File)로 만들어서
// games 레코드에 그대로 저장한다 - 그래야 관리자 화면의 파일명 표시 등 기존 로직을 그대로 쓸 수 있다.
async function fetchAsFile(relativePath, filename) {
  const res = await fetch(publicPath(relativePath))
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type })
}

// 기본으로 준비해둔 게임 11종의 배경화면/배경음악/효과음 파일 매핑.
// 파일들은 public/backgrounds, public/bgm, public/audio 에 미리 넣어둔 것들이다.
const DEFAULT_GAME_DEFS = [
  { name: '아발론', genre: '블러핑', background: 'back_avalon.png', bgm: 'bgm_avalon.wav', effect: { name: '나레이션', file: 'audio_avalon_narration.mp3' } },
  { name: '저스트 원', genre: '파티', background: 'back_justone.png', bgm: 'bgm_party.mp3', effect: { name: '폴트', file: 'audio_justone_fault.mp3' } },
  { name: '달무티', genre: '카드', background: 'back_dalmuti.png', bgm: 'bgm_dalmuti.mp3' },
  { name: '디크립토', genre: '추리', background: 'back_decrypto.jpg', bgm: 'bgm_deduction.mp3' },
  { name: '도박 테마', genre: '파티', background: 'back_GAMBLE.png', bgm: 'bgm_gamble.mp3' },
  { name: '추론 테마', genre: '추리', background: 'back_DEDUCTION.png', bgm: 'bgm_deduction.mp3' },
  { name: '코드네임', genre: '파티', background: 'back_codename.png', bgm: 'bgm_deduction.mp3' },
  { name: '스페이스 크루', genre: '협력', background: 'back_spacecrew.png', bgm: 'bgm_spacecrew.mp3' },
  { name: '파티 테마', genre: '파티', background: 'back_Party.png', bgm: 'bgm_party.mp3' },
  { name: '인사이더 블랙', genre: '추리', background: 'back_codename.png', bgm: 'bgm_deduction.mp3' },
  { name: '인필트레이터', genre: '블러핑', background: 'back_Infiltrator.png', bgm: 'bgm_deduction.mp3' },
]

// 앱을 처음 켰을 때 기본 게임 목록을 실제 파일과 함께 미리 채워둔다.
export async function seedGamesIfEmpty() {
  const count = await db.games.count()
  if (count > 0) return

  const games = await Promise.all(DEFAULT_GAME_DEFS.map(async def => {
    const [backgroundImage, bgm] = await Promise.all([
      fetchAsFile(`backgrounds/${def.background}`, def.background),
      fetchAsFile(`bgm/${def.bgm}`, def.bgm),
    ])
    const soundEffects = []
    if (def.effect) {
      soundEffects.push({
        id: Date.now() + Math.random(),
        name: def.effect.name,
        file: await fetchAsFile(`audio/${def.effect.file}`, def.effect.file),
      })
    }
    return {
      name: def.name,
      genre: def.genre,
      note: '',
      teamMode: false,
      supportType: 'generic',
      bgm,
      backgroundImage,
      soundEffects,
      resources: defaultResources(),
    }
  }))

  await db.games.bulkAdd(games)
}
