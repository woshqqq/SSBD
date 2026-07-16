import React from 'react'
import { useObjectUrl } from '../hooks/useObjectUrl.js'

// image는 업로드한 Blob이거나 기본 이미지 경로(문자열)이거나 없을 수 있다.
// useObjectUrl에 문자열을 그대로 넘기면 크래시하므로 Blob일 때만 넘긴다.
export default function ParticipantPortrait({ image, name, className }) {
  const isBlobImage = image instanceof Blob
  const objectUrl = useObjectUrl(isBlobImage ? image : null)
  const imageSrc = isBlobImage ? objectUrl : image

  if (imageSrc) {
    return <img src={imageSrc} alt={name || ''} className={className} />
  }
  return <span className={`${className} placeholder`}>{name?.[0] ?? '?'}</span>
}
