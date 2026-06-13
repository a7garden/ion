import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/pretendard/400.css'
import '@fontsource/pretendard/500.css'
import '@fontsource/pretendard/600.css'
import '@fontsource/pretendard/700.css'
import './index.css'
import './design-system/themes/light.css'
import './design-system/themes/dark.css'
import { I18nProvider } from './i18n'
import { ThemeProvider } from './design-system'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </I18nProvider>
  </StrictMode>,
)
