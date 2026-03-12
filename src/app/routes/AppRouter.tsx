import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShellLayout } from '../layout/AppShellLayout'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { CatchAllRedirect, ProtectedRoute, PublicOnlyRoute } from './RouteGuards'
import { appRoutes, defaultAuthedRoute } from './routeConfig'

export function AppRouter() {
  const basename = import.meta.env.BASE_URL.replace(/\/+$/, '')

  return (
    <BrowserRouter basename={basename === '' ? undefined : basename}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShellLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={defaultAuthedRoute} replace />} />
          {appRoutes.map((route) => (
            <Route key={route.key} path={route.path} element={route.element} />
          ))}
        </Route>

        <Route path="*" element={<CatchAllRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
