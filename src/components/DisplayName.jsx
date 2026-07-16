import React from 'react'

// 칭호가 있으면 "칭호 이름"(칭호는 볼드) 형식으로, 없으면 이름만 보여준다.
export default function DisplayName({ title, name }) {
  if (!title) return <>{name}</>
  return <><strong>{title}</strong> {name}</>
}
