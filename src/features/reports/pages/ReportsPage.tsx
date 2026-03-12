import dayjs from 'dayjs'
import { Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { StatusChip } from '../../../components/status/StatusChip'
import { useI18n } from '../../../i18n/useI18n'
import { databaseRepository } from '../../../services/repositories'
import { BillingStatus, PaymentStatus, RoomStatus } from '../../../types'
import { formatCurrency } from '../../../utils/formatters'

export function ReportsPage() {
  const { t } = useI18n()
  const snapshot = databaseRepository.getSnapshot()
  const currentMonth = dayjs().format('YYYY-MM')

  const totalRooms = snapshot.rooms.length
  const occupiedRooms = snapshot.rooms.filter((room) => room.status === RoomStatus.OCCUPIED).length
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

  const monthIncome = snapshot.payments
    .filter(
      (payment) =>
        payment.status === PaymentStatus.SUCCESS && dayjs(payment.paymentDate).format('YYYY-MM') === currentMonth,
    )
    .reduce((sum, payment) => sum + payment.amount, 0)

  const outstandingAmount = snapshot.billings
    .filter((billing) => billing.status !== BillingStatus.PAID)
    .reduce((sum, billing) => sum + billing.totalAmount, 0)

  const maintenanceCost = snapshot.maintenances
    .filter((maintenance) => dayjs(maintenance.requestedDate).format('YYYY-MM') === currentMonth)
    .reduce((sum, maintenance) => sum + maintenance.cost, 0)

  const roomStatusSummary = Object.values(RoomStatus).map((status) => ({
    status,
    count: snapshot.rooms.filter((room) => room.status === status).length,
  }))

  const monthlyIncomeRows = Array.from({ length: 6 }, (_, index) => dayjs().subtract(index, 'month').format('YYYY-MM')).map(
    (month) => ({
      month,
      income: snapshot.payments
        .filter(
          (payment) =>
            payment.status === PaymentStatus.SUCCESS && dayjs(payment.paymentDate).format('YYYY-MM') === month,
        )
        .reduce((sum, payment) => sum + payment.amount, 0),
    }),
  )

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography component="h1" variant="h5">
          {t('Reports')}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t('Basic operational reports generated from local mock data.')}
        </Typography>
      </Paper>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Paper sx={{ p: 2.25 }}>
          <Typography variant="body2" color="text.secondary">
            {t('Occupancy Rate')}
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.7 }}>
            {occupancyRate.toFixed(1)}%
          </Typography>
        </Paper>
        <Paper sx={{ p: 2.25 }}>
          <Typography variant="body2" color="text.secondary">
            {t('Income')} ({currentMonth})
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.7 }}>
            {formatCurrency(monthIncome)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2.25 }}>
          <Typography variant="body2" color="text.secondary">
            {t('Outstanding Payments')}
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.7 }}>
            {formatCurrency(outstandingAmount)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2.25 }}>
          <Typography variant="body2" color="text.secondary">
            {t('Maintenance Cost')} ({currentMonth})
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.7 }}>
            {formatCurrency(maintenanceCost)}
          </Typography>
        </Paper>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('Room Status Summary')}
          </Typography>
          <Stack spacing={1.2} sx={{ mt: 1.5 }}>
            {roomStatusSummary.map((item) => (
              <Stack key={item.status} direction="row" justifyContent="space-between" alignItems="center">
                <StatusChip status={item.status} />
                <Typography fontWeight={600}>{item.count}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5, overflowX: 'auto' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('Monthly Income Trend')}
          </Typography>
          <Table size="small" sx={{ mt: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('Month')}</TableCell>
                <TableCell align="right">{t('Income')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlyIncomeRows.map((row) => (
                <TableRow key={row.month} hover>
                  <TableCell>{row.month}</TableCell>
                  <TableCell align="right">{formatCurrency(row.income)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    </Stack>
  )
}
