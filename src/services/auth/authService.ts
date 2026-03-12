import { STORAGE_KEYS } from '../../constants/storageKeys'
import { storageService } from '../storage/storageService'

export interface AuthSession {
  username: string
  rememberMe: boolean
  loginAt: string
}

interface LoginParams {
  username: string
  password: string
  rememberMe: boolean
}

export const authService = {
  login({ username, password, rememberMe }: LoginParams): boolean {
    if (!username.trim() || !password.trim()) {
      return false
    }

    const session: AuthSession = {
      username: username.trim(),
      rememberMe,
      loginAt: new Date().toISOString(),
    }

    storageService.setItem(STORAGE_KEYS.AUTH_SESSION, session)

    return true
  },
  logout(): void {
    storageService.removeItem(STORAGE_KEYS.AUTH_SESSION)
  },
  getSession(): AuthSession | null {
    return storageService.getItem<AuthSession>(STORAGE_KEYS.AUTH_SESSION)
  },
  isAuthenticated(): boolean {
    return authService.getSession() !== null
  },
}
