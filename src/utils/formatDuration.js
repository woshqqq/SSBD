// 밀리초를 mm:ss 또는 (1시간 이상이면) h:mm:ss 형태로 바꾼다.
export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  const mm = m.toString().padStart(2, '0')
  const ss = s.toString().padStart(2, '0')

  if (h > 0) return `${h}:${mm}:${ss}`
  return `${mm}:${ss}`
}
