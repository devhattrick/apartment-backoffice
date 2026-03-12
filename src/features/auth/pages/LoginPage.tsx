import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useI18n } from '../../../i18n/useI18n'
import { useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../../../services/auth/authService'

interface LoginState {
  from?: {
    pathname?: string
  }
}

export function LoginPage() {
  const { locale, setLocale, t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('1234')
  const [rememberMe, setRememberMe] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const targetPath = useMemo(() => {
    const state = location.state as LoginState | null
    return state?.from?.pathname ?? '/dashboard'
  }, [location.state])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const didLogin = authService.login({ username, password, rememberMe })

    if (!didLogin) {
      setErrorMessage(t('Please provide both username and password.'))
      return
    }

    setErrorMessage(null)
    navigate(targetPath, { replace: true })
  }

  return (
    <Box
      className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#f1f5f9_100%)]"
      sx={{ display: 'flex', alignItems: 'center', py: 4 }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            border: '1px solid',
            borderColor: 'divider',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setLocale(locale === 'en' ? 'th' : 'en')}
              >
                {locale === 'en' ? 'TH' : 'EN'}
              </Button>
            </Box>
            <Box>
              <Typography variant="h5">{t('Apartment Backoffice')}</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {t('Sign in to continue')}
              </Typography>
            </Box>

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            <TextField
              label={t('Username')}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              fullWidth
              required
            />
            <TextField
              type="password"
              label={t('Password')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              fullWidth
              required
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
              }
              label={t('Remember me')}
            />

            <Button type="submit" variant="contained" size="large">
              {t('Login')}
            </Button>

            <Typography variant="caption" color="text.secondary">
              {t('Mock auth for Step 1: any non-empty username and password can sign in.')}
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
