import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Pretendard (한글+라틴 subset)는 index.html의 <link>로 /fonts/pretendard.css
// 를 통해 자체 호스팅됩니다. 추가 fontsource import 없음.
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
