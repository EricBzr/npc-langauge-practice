// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'       // Or './index.css' if you named it that for Tailwind
import App from './App.jsx' // Make sure this points to your main App component file


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)