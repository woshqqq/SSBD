// 참가자 칩 배경색을 사람마다 다르게, 하지만 같은 사람은 항상 같은 색으로 보여주기 위한 유틸.
// 파스텔톤이라 검정 글씨(기본 텍스트 색)로도 잘 읽힌다.
const PALETTE = [
  '#F4D9D0', '#F4E7C5', '#E3EFC8', '#CFEAE0', '#D0E4F0',
  '#DCD3EF', '#F0D3E6', '#E6DCCB', '#D6E0E8', '#EAD6D6',
]

export function colorForParticipant(seed) {
  const str = String(seed ?? '')
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}
