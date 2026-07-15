import Dexie from 'dexie'

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

// 앱을 처음 켰을 때 예시 게임 몇 개를 미리 넣어둔다.
// 실제 서비스할 게임 목록으로 나중에 바꾸면 된다.
export async function seedGamesIfEmpty() {
  const count = await db.games.count()
  if (count > 0) return
  await db.games.bulkAdd([
    {
      name: '카탄', genre: '전략', note: '3~4인용', supportType: 'resource-counter',
      bgm: null, backgroundImage: null, resources: defaultResources()
    },
    {
      name: '스플렌더', genre: '전략', note: '2~4인용', supportType: 'token-counter',
      bgm: null, backgroundImage: null, resources: defaultResources()
    },
    {
      name: '아그리콜라', genre: '전략', note: '1~5인용', supportType: 'generic',
      bgm: null, backgroundImage: null, resources: defaultResources()
    }
  ])
}
