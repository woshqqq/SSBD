import { publicPath } from '../utils/publicPath.js'

// 캐릭터 생성 시 고를 수 있는 기본 이미지 12종. public/characters/ 폴더 파일과 1:1로 대응된다.
// 파일을 다른 그림으로 바꾸고 싶으면 이 목록의 파일명과 같은 이름으로 덮어쓰면 된다.
export const DEFAULT_CHARACTERS = [
  { id: 'politician', name: '정치인', image: publicPath('characters/Politician.png') },
  { id: 'king', name: '왕', image: publicPath('characters/king.png') },
  { id: 'dictator', name: '독재자', image: publicPath('characters/Dictator.png') },
  { id: 'tyrant', name: '폭군', image: publicPath('characters/king2.png') },
  { id: 'samurai', name: '사무라이', image: publicPath('characters/samurai.png') },
  { id: 'swindler', name: '사기꾼', image: publicPath('characters/Swindler.png') },
  { id: 'musician', name: '음악가', image: publicPath('characters/musician.png') },
  { id: 'madman', name: '광인', image: publicPath('characters/madman.png') },
  { id: 'ghost', name: '유령', image: publicPath('characters/ghost.png') },
  { id: 'countess', name: '백작부인', image: publicPath('characters/countess.png') },
  { id: 'duke', name: '공작', image: publicPath('characters/Duke.png') },
  { id: 'plague-doctor', name: '역병의사', image: publicPath('characters/plague doctor.png') },
]

export function pickRandomDefaultCharacter() {
  return DEFAULT_CHARACTERS[Math.floor(Math.random() * DEFAULT_CHARACTERS.length)]
}
