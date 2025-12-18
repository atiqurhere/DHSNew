import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './utils/errorLogger' // Global error logger for debugging

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
