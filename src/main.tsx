import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/cormorant-garamond/index.css'
import '@fontsource-variable/cormorant-garamond/wght-italic.css'
import '@fontsource-variable/plus-jakarta-sans/index.css'
import '@fontsource-variable/jetbrains-mono/index.css'
import './index.css'
import { App } from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
