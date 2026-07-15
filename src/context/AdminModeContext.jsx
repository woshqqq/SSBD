import React, { createContext, useContext, useEffect, useState } from 'react'

const AdminModeContext = createContext(null)
const STORAGE_KEY = 'boardgame-admin-mode'
const PASSWORD_KEY = 'boardgame-admin-password'

export function AdminModeProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isAdmin))
  }, [isAdmin])

  // 처음 켤 때는 비밀번호를 새로 정해서 저장하고, 그다음부터는 그 비밀번호를 맞춰야 켜진다.
  function requestEnable() {
    const stored = localStorage.getItem(PASSWORD_KEY)
    if (!stored) {
      const pw = window.prompt('관리자 모드 비밀번호를 설정하세요.')
      if (!pw) return
      localStorage.setItem(PASSWORD_KEY, pw)
      setIsAdmin(true)
      return
    }
    const pw = window.prompt('관리자 비밀번호를 입력하세요.')
    if (pw === null) return
    if (pw === stored) {
      setIsAdmin(true)
    } else {
      alert('비밀번호가 일치하지 않아요.')
    }
  }

  function disable() {
    setIsAdmin(false)
  }

  return (
    <AdminModeContext.Provider value={{ isAdmin, requestEnable, disable }}>
      {children}
    </AdminModeContext.Provider>
  )
}

export function useAdminMode() {
  return useContext(AdminModeContext)
}
