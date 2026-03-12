import { useEffect } from 'react'
import { AppShellProviders } from './app/providers/AppShellProviders'
import { AppRouter } from './app/routes/AppRouter'
import { I18nProvider } from './i18n/I18nProvider'
import { databaseRepository } from './services/repositories'

function App() {
  useEffect(() => {
    databaseRepository.ensureSeeded()
  }, [])

  return (
    <AppShellProviders>
      <I18nProvider>
        <AppRouter />
      </I18nProvider>
    </AppShellProviders>
  )
}

export default App
