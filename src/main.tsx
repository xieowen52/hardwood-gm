import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Bundled variable fonts (no runtime network): Bricolage Grotesque for
// display/headings, Inter for body.
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/inter'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
