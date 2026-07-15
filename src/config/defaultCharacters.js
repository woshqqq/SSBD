import { publicPath } from '../utils/publicPath.js'

// 캐릭터 생성 시 이미지를 고르지 않으면 이 중 하나가 자동으로 배정된다.
// 실제 일러스트로 바꾸고 싶으면 public/characters/ 아래 같은 파일명으로 덮어쓰면 된다.
export const DEFAULT_CHARACTERS = [
  { id: 'king', name: '왕', image: publicPath('characters/king.png') },
  { id: 'knight', name: '기사', image: publicPath('characters/knight.png') },
  { id: 'innkeeper', name: '여관주인', image: publicPath('characters/innkeeper.png') },
  { id: 'humanoid', name: '휴머노이드', image: publicPath('characters/humanoid.png') },
  { id: 'wizard', name: '마법사', image: publicPath('characters/wizard.png') },
  { id: 'bard', name: '음유시인', image: publicPath('characters/bard.png') },
  { id: 'plague-doctor', name: '역병의사', image: publicPath('characters/plague-doctor.png') },
  { id: 'beggar', name: '노숙자', image: publicPath('characters/beggar.png') },
  { id: 'noble', name: '귀족', image: publicPath('characters/noble.png') },
]

export function pickRandomDefaultCharacter() {
  return DEFAULT_CHARACTERS[Math.floor(Math.random() * DEFAULT_CHARACTERS.length)]
}
