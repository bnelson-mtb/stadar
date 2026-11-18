import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AccountLinkProvider } from './context/AccountLinkContext.jsx'
import CollectionSync from './components/CollectionSync.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AccountLinkProvider>
          <CollectionSync />
          <App />
        </AccountLinkProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
