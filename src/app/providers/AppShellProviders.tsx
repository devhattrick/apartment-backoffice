import { CssBaseline, GlobalStyles, ThemeProvider, createTheme } from '@mui/material'
import type { PropsWithChildren } from 'react'

const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f766e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0284c7',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: ['"Noto Sans Thai"', '"Inter"', '"Segoe UI"', 'sans-serif'].join(','),
    h5: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
})

export function AppShellProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            margin: 0,
            minWidth: 320,
          },
          '#root': {
            minHeight: '100vh',
          },
        }}
      />
      {children}
    </ThemeProvider>
  )
}
