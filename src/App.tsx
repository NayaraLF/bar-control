import { Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import PageLoader from './components/PageLoader'
import {
  Login,
  Stock,
  Comandas,
  ComandaDetail,
  Checkout,
  Historico,
  Usuarios,
  prefetchPages,
} from './pages/lazy'

export default function App() {
  useEffect(() => {
    prefetchPages()
  }, [])

  return (
    <ErrorBoundary>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader fullScreen />}>
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
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
    </ErrorBoundary>
  )
}
