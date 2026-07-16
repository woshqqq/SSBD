import React from 'react'
import { DEFAULT_CHARACTERS } from '../config/defaultCharacters.js'

// 기본 이미지 12종 중 하나를 골라 value(문자열 경로)로 알려주는 썸네일 그리드.
export default function CharacterImagePicker({ value, onSelect }) {
  return (
    <div className="character-picker-grid">
      {DEFAULT_CHARACTERS.map(c => (
        <button
          key={c.id}
          type="button"
          className={`character-picker-item ${value === c.image ? 'selected' : ''}`}
          onClick={() => onSelect(c.image)}
        >
          <img src={c.image} alt={c.name} />
          <span>{c.name}</span>
        </button>
      ))}
    </div>
  )
}
