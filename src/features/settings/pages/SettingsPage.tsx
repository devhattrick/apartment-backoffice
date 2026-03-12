import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useI18n } from '../../../i18n/useI18n'
import { databaseRepository, settingsRepository } from '../../../services/repositories'
import type { AppSettings } from '../../../types'

export function SettingsPage() {
  const { t } = useI18n()
  const [settings, setSettings] = useState<AppSettings>(() => settingsRepository.get())
  const [savedMessage, setSavedMessage] = useState<string>('')

  const loadSettings = () => {
    setSettings(settingsRepository.get())
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography component="h1" variant="h5">
          {t('Settings')}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t('Configure apartment profile and defaults used by billing workflow.')}
        </Typography>
      </Paper>

      {savedMessage && <Alert severity="success">{savedMessage}</Alert>}

      <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <TextField
            size="small"
            label={t('Apartment Name')}
            value={settings.apartmentName}
            onChange={(event) => setSettings((prev) => ({ ...prev, apartmentName: event.target.value }))}
          />

          <TextField
            size="small"
            label={t('Apartment Phone')}
            value={settings.apartmentPhone}
            onChange={(event) => setSettings((prev) => ({ ...prev, apartmentPhone: event.target.value }))}
          />

          <TextField
            size="small"
            label={t('Default Monthly Rent')}
            type="number"
            value={settings.defaultMonthlyRent}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, defaultMonthlyRent: Number(event.target.value) }))
            }
          />

          <TextField
            size="small"
            label={t('Deposit Months')}
            type="number"
            value={settings.defaultDepositMonths}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, defaultDepositMonths: Number(event.target.value) }))
            }
          />

          <TextField
            size="small"
            label={t('Water Rate')}
            type="number"
            value={settings.waterRate}
            onChange={(event) => setSettings((prev) => ({ ...prev, waterRate: Number(event.target.value) }))}
          />

          <TextField
            size="small"
            label={t('Electric Rate')}
            type="number"
            value={settings.electricRate}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, electricRate: Number(event.target.value) }))
            }
          />

          <TextField
            size="small"
            label={t('Billing Due Day')}
            type="number"
            value={settings.billingDueDay}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, billingDueDay: Number(event.target.value) }))
            }
          />

          <TextField
            size="small"
            label={t('Receipt Prefix')}
            value={settings.receiptPrefix}
            onChange={(event) => setSettings((prev) => ({ ...prev, receiptPrefix: event.target.value }))}
          />
        </div>

        <TextField
          size="small"
          label={t('Apartment Address')}
          value={settings.apartmentAddress}
          onChange={(event) => setSettings((prev) => ({ ...prev, apartmentAddress: event.target.value }))}
          fullWidth
          sx={{ mt: 1.5 }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              settingsRepository.update({
                apartmentName: settings.apartmentName,
                apartmentAddress: settings.apartmentAddress,
                apartmentPhone: settings.apartmentPhone,
                defaultMonthlyRent: settings.defaultMonthlyRent,
                defaultDepositMonths: settings.defaultDepositMonths,
                waterRate: settings.waterRate,
                electricRate: settings.electricRate,
                billingDueDay: settings.billingDueDay,
                receiptPrefix: settings.receiptPrefix,
              })
              setSavedMessage(t('Settings saved.'))
              loadSettings()
            }}
          >
            {t('Save Settings')}
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              const confirmed = window.confirm(t('Reset all local mock data?'))
              if (!confirmed) {
                return
              }

              databaseRepository.reset()
              loadSettings()
              setSavedMessage(t('Mock data reset complete.'))
            }}
          >
            {t('Reset Mock Data')}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  )
}
