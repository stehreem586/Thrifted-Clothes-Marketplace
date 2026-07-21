import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ListingsProvider } from './context/ListingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ListingsProvider>
          <App />
        </ListingsProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)


