import React, { useEffect, useRef } from 'react'
import { useObjectUrl } from '../hooks/useObjectUrl.js'

// 승리 문구 - 나중에 바꾸고 싶으면 이 상수만 고치면 된다.
export const WIN_MESSAGE = '승리! 명예의 전당 등록!'

const AUTO_CLOSE_MS = 2600

// 순수 CSS로 만든 승리 이펙트: 커튼이 걷히며 줌인, 액자에 초상화.
export default function WinEffect({ preset, onDone }) {
  const imageUrl = useObjectUrl(preset?.image ?? null)

  // onDone은 Play.jsx가 매초(경과시간 갱신) 리렌더될 때마다 새로 만들어지는 함수라,
  // 의존성 배열에 넣으면 타이머가 계속 리셋되어 영원히 안 닫힌다. ref로 최신 값만 참조하고
  // 타이머 자체는 마운트 시 한 번만 건다.
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), AUTO_CLOSE_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="win-effect-overlay" onClick={onDone}>
      <div className="win-curtain win-curtain-left" />
      <div className="win-curtain win-curtain-right" />
      <div className="win-frame">
        <div className="win-frame-portrait">
          {imageUrl ? <img src={imageUrl} alt={preset?.name} /> : <span>{preset?.name?.[0] ?? '?'}</span>}
        </div>
        <p className="win-message">{WIN_MESSAGE}</p>
        <h2 className="win-name">{preset?.name}</h2>
      </div>
    </div>
  )
}
