import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { authService } from '../../services/auth/authService'
import { defaultAuthedRoute } from './routeConfig'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation()

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

export function PublicOnlyRoute({ children }: PropsWithChildren) {
  if (authService.isAuthenticated()) {
    return <Navigate to={defaultAuthedRoute} replace />
  }

  return <>{children}</>
}

export function CatchAllRedirect() {
  if (authService.isAuthenticated()) {
    return <Navigate to={defaultAuthedRoute} replace />
  }

  return <Navigate to="/login" replace />
}
