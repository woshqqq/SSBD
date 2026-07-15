import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// 서비스 워커 등록: '이 앱은 오프라인 저장 기능을 쓸게요'라고
// 브라우저에게 알려주는 절차. 최초 1회, 인터넷이 연결된 상태에서
// 접속해야 창고(캐시) 채우기가 시작된다.
// GitHub Pages처럼 서브경로(/저장소이름/)에 배포될 수도 있어서,
// sw.js는 반드시 그 서브경로 기준으로 등록해야 한다(안 그러면 등록 자체가 실패함).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((err) => {
      console.warn('서비스 워커 등록 실패:', err)
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
