import { lazy } from 'react'

// Cada página vira um arquivo separado, baixado só quando é aberta.
const loaders = {
  Login: () => import('./Login'),
  Comandas: () => import('./Comandas'),
  ComandaDetail: () => import('./ComandaDetail'),
  Checkout: () => import('./Checkout'),
  Stock: () => import('./Stock'),
  Historico: () => import('./Historico'),
  Usuarios: () => import('./Usuarios'),
}

export const Login = lazy(loaders.Login)
export const Comandas = lazy(loaders.Comandas)
export const ComandaDetail = lazy(loaders.ComandaDetail)
export const Checkout = lazy(loaders.Checkout)
export const Stock = lazy(loaders.Stock)
export const Historico = lazy(loaders.Historico)
export const Usuarios = lazy(loaders.Usuarios)

/**
 * Baixa as demais páginas em segundo plano depois que o app abriu,
 * para que continuem abrindo se a internet cair durante o movimento.
 */
export function prefetchPages() {
  const run = () => Object.values(loaders).forEach((load) => load().catch(() => {}))
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 3000 })
  } else {
    setTimeout(run, 2000)
  }
}
