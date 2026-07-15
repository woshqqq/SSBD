import { useEffect, useState } from 'react'
import { publicPath } from '../utils/publicPath.js'

const TIMER_SOUND_PATH = publicPath('audio/timer-end.wav')

// 진동/알림음이 안 되는 환경에서도 조용히 무시되도록 각각 try/catch로 감싼다.
function playAlert() {
  try {
    navigator.vibrate?.([200, 100, 200, 100, 200])
  } catch {
    // 진동 미지원 환경 - 무시
  }
  try {
    new Audio(TIMER_SOUND_PATH).play().catch(() => {})
  } catch {
    // 오디오 미지원 환경 - 무시
  }
}

// Play 화면 안에서 쓰는 타이머/스톱워치 상태 머신.
// Play.jsx에서 호출해서 반환값을 팝업이 닫혀도 유지되게 그대로 들고 있으면 된다.
export function usePlayTimer() {
  const [kind, setKind] = useState(null) // null | 'stopwatch' | 'timer'
  const [phase, setPhase] = useState('idle') // 'idle' | 'setup' | 'running' | 'ended'
  const [active, setActive] = useState(false)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      setSeconds(s => {
        if (kind === 'timer') {
          if (s <= 1) {
            setActive(false)
            setPhase('ended')
            playAlert()
            return 0
          }
          return s - 1
        }
        return s + 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [active, kind])

  function startStopwatch() {
    setKind('stopwatch')
    setSeconds(0)
    setPhase('running')
    setActive(true)
  }

  function openTimerSetup() {
    setKind('timer')
    setPhase('setup')
    setActive(false)
  }

  function startTimer(minutes) {
    const secs = Math.max(1, Math.round(minutes * 60))
    setSeconds(secs)
    setPhase('running')
    setActive(true)
  }

  function toggleActive() {
    setActive(a => !a)
  }

  function reset() {
    setActive(false)
    setKind(null)
    setPhase('idle')
    setSeconds(0)
  }

  return { kind, phase, active, seconds, startStopwatch, openTimerSetup, startTimer, toggleActive, reset }
}
