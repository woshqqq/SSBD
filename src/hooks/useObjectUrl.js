import { useEffect, useState } from 'react'

// Blob을 <img>/<audio> 등에서 쓸 수 있는 object URL로 변환하고,
// 컴포넌트가 사라지거나 blob이 바뀌면 이전 URL을 해제해 메모리 누수를 막는다.
export function useObjectUrl(blob) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!blob) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  return url
}
