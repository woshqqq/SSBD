import React from 'react'

// 오버레이+카드 형태의 공용 모달. 배경(오버레이) 클릭 시 onClose 호출.
export default function Modal({ onClose, children }) {
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div className="modal-card card" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
