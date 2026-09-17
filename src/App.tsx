import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Login from './pages/Login'
import Stock from './pages/Stock'
import Comandas from './pages/Comandas'
import ComandaDetail from './pages/ComandaDetail'
import Checkout from './pages/Checkout'
import Historico from './pages/Historico'
import Usuarios from './pages/Usuarios'

export default function App() {
  return (
    <ErrorBoundary>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Comandas />} />
              <Route path="/comandas/:id" element={<ComandaDetail />} />
              <Route path="/comandas/:id/fechar" element={<Checkout />} />
              <Route path="/estoque" element={<Stock />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/usuarios" element={<Usuarios />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
    </ErrorBoundary>
  )
}
