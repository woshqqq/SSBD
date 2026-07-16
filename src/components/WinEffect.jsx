import React, { useEffect, useRef } from 'react'
import DisplayName from './DisplayName.jsx'
import ParticipantPortrait from './ParticipantPortrait.jsx'

// 승리 문구 - 나중에 바꾸고 싶으면 이 상수만 고치면 된다.
export const WIN_MESSAGE = '승리! 명예의 전당 등록!'

const AUTO_CLOSE_MS = 2600

// 순수 CSS로 만든 승리 이펙트: 커튼이 걷히며 줌인, 액자에 초상화.
// winners는 배열(복수 승자 동시 표시 가능) - 단일 객체를 넘겨도 배열로 감싸서 처리한다.
export default function WinEffect({ winners, onDone }) {
  const list = (Array.isArray(winners) ? winners : [winners]).filter(Boolean)

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
      <div className="win-frame" onClick={e => e.stopPropagation()}>
        <p className="win-message">{WIN_MESSAGE}</p>
        <div className="win-frame-portraits">
          {list.map((w, i) => (
            <div key={i} className="win-frame-portrait-item">
              <ParticipantPortrait image={w?.image} name={w?.name} className="win-frame-portrait" />
              <p className="win-name"><DisplayName title={w?.title} name={w?.name} /></p>
            </div>
          ))}
        </div>
        <button className="btn" onClick={onDone}>확인</button>
      </div>
    </div>
  )
}
