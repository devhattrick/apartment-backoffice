import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { StatusChip } from '../../../components/status/StatusChip'
import { useI18n } from '../../../i18n/useI18n'
import { databaseRepository } from '../../../services/repositories'
import type { Billing, Contract, Payment, Tenant } from '../../../types'
import { formatDate } from '../../../utils/date'
import { formatCurrency } from '../../../utils/formatters'

interface TenantDetailView {
  tenant: Tenant
  contracts: Contract[]
  billings: Billing[]
  payments: Payment[]
}

export function TenantDetailPage() {
  const { t } = useI18n()
  const { tenantId } = useParams<{ tenantId: string }>()
  const navigate = useNavigate()

  const detail = useMemo<TenantDetailView | null>(() => {
    if (!tenantId) {
      return null
    }

    const snapshot = databaseRepository.getSnapshot()
    const tenant = snapshot.tenants.find((item) => item.id === tenantId)

    if (!tenant) {
      return null
    }

    return {
      tenant,
      contracts: snapshot.contracts
        .filter((contract) => contract.tenantId === tenantId)
        .sort((a, b) => b.startDate.localeCompare(a.startDate)),
      billings: snapshot.billings
        .filter((billing) => billing.tenantId === tenantId)
        .sort((a, b) => b.billingMonth.localeCompare(a.billingMonth)),
      payments: snapshot.payments
        .filter((payment) => payment.tenantId === tenantId)
        .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)),
    }
  }, [tenantId])

  if (!detail) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">{t('Tenant not found')}</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/tenants')}>
          {t('Back to Tenant List')}
        </Button>
      </Paper>
    )
  }

  const roomMap = new Map(databaseRepository.getSnapshot().rooms.map((room) => [room.id, room]))

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Button
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ mb: 0.75, px: 0.5 }}
          onClick={() => navigate('/tenants')}
        >
          {t('Back to list')}
        </Button>

        <Typography component="h1" variant="h5">
          {detail.tenant.firstName} {detail.tenant.lastName}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t('Tenant profile and full payment timeline.')}
        </Typography>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Typography variant="body2">
            {t('Phone')}: {detail.tenant.phone}
          </Typography>
          <Typography variant="body2">
            {t('Email')}: {detail.tenant.email || '-'}
          </Typography>
          <Typography variant="body2">
            {t('ID Card')}: {detail.tenant.idCardNo || '-'}
          </Typography>
          <Typography variant="body2">
            {t('Emergency Contact')}: {detail.tenant.emergencyContactName || '-'}
          </Typography>
        </div>

        <Typography variant="body2" sx={{ mt: 1.5 }}>
          {t('Address')}: {detail.tenant.address || '-'}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {t('Note')}: {detail.tenant.note || '-'}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2.5, overflowX: 'auto' }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {t('Contract History')}
        </Typography>
        <Table size="small" sx={{ mt: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('Contract No.')}</TableCell>
              <TableCell>{t('Room')}</TableCell>
              <TableCell>{t('Start')}</TableCell>
              <TableCell>{t('End Date')}</TableCell>
              <TableCell>{t('Status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detail.contracts.map((contract) => (
              <TableRow key={contract.id} hover>
                <TableCell>{contract.contractNo}</TableCell>
                <TableCell>{roomMap.get(contract.roomId)?.roomNumber ?? '-'}</TableCell>
                <TableCell>{formatDate(contract.startDate)}</TableCell>
                <TableCell>{formatDate(contract.endDate)}</TableCell>
                <TableCell>
                  <StatusChip status={contract.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Paper sx={{ p: 2.5, overflowX: 'auto' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('Billing History')}
          </Typography>
          <Table size="small" sx={{ mt: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('Month')}</TableCell>
                <TableCell align="right">{t('Total')}</TableCell>
                <TableCell>{t('Status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detail.billings.map((billing) => (
                <TableRow key={billing.id} hover>
                  <TableCell>{billing.billingMonth}</TableCell>
                  <TableCell align="right">{formatCurrency(billing.totalAmount)}</TableCell>
                  <TableCell>
                    <StatusChip status={billing.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Paper sx={{ p: 2.5, overflowX: 'auto' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('Payment History')}
          </Typography>
          <Table size="small" sx={{ mt: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('Date')}</TableCell>
                <TableCell align="right">{t('Amount')}</TableCell>
                <TableCell>{t('Method')}</TableCell>
                <TableCell>{t('Status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detail.payments.map((payment) => (
                <TableRow key={payment.id} hover>
                  <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                  <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>
                    <StatusChip status={payment.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    </Stack>
  )
}
