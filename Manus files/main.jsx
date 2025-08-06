import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import EditableApp from './EditableApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EditableApp />
  </StrictMode>,
)
