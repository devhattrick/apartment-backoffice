import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { paymentMethodOptions, paymentStatusOptions } from '../../../constants/options'
import { paymentStatusLabel } from '../../../constants/statusMeta'
import { StatusChip } from '../../../components/status/StatusChip'
import { useI18n } from '../../../i18n/useI18n'
import { databaseRepository, paymentRepository } from '../../../services/repositories'
import type { Billing, Payment, PaymentStatus, Room, Tenant } from '../../../types'
import { BillingStatus, PaymentStatus as PaymentStatusEnum } from '../../../types'
import { todayIsoDate } from '../../../utils/date'
import { formatCurrency } from '../../../utils/formatters'

interface PaymentDraft {
  billingId: string
  paymentDate: string
  amount: number
  method: string
  referenceNo: string
  status: PaymentStatus
  note: string
}

export function PaymentListPage() {
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const initialSnapshot = databaseRepository.getSnapshot()

  const [payments, setPayments] = useState<Payment[]>(() => paymentRepository.getAll())
  const [billings, setBillings] = useState<Billing[]>(() => initialSnapshot.billings)
  const [rooms, setRooms] = useState<Room[]>(() => initialSnapshot.rooms)
  const [tenants, setTenants] = useState<Tenant[]>(() => initialSnapshot.tenants)

  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL')
  const [methodFilter, setMethodFilter] = useState<'ALL' | string>('ALL')

  const [openDialog, setOpenDialog] = useState(false)
  const [draft, setDraft] = useState<PaymentDraft>({
    billingId: searchParams.get('billingId') ?? '',
    paymentDate: todayIsoDate(),
    amount: 0,
    method: paymentMethodOptions[0],
    referenceNo: '',
    status: PaymentStatusEnum.SUCCESS,
    note: '',
  })

  const loadData = () => {
    const snapshot = databaseRepository.getSnapshot()
    setPayments(paymentRepository.getAll())
    setBillings(snapshot.billings)
    setRooms(snapshot.rooms)
    setTenants(snapshot.tenants)
  }

  const billingMap = useMemo(() => new Map(billings.map((billing) => [billing.id, billing])), [billings])
  const roomMap = useMemo(() => new Map(rooms.map((room) => [room.id, room])), [rooms])
  const tenantMap = useMemo(() => new Map(tenants.map((tenant) => [tenant.id, tenant])), [tenants])

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter
      const matchesMethod = methodFilter === 'ALL' || payment.method === methodFilter
      return matchesStatus && matchesMethod
    })
  }, [methodFilter, payments, statusFilter])

  const receivableBillings = useMemo(() => {
    return billings.filter(
      (billing) =>
        billing.status === BillingStatus.UNPAID ||
        billing.status === BillingStatus.PARTIALLY_PAID ||
        billing.status === BillingStatus.OVERDUE,
    )
  }, [billings])

  const selectedBilling = billingMap.get(draft.billingId)
  const paidAmount = useMemo(() => {
    return payments
      .filter((payment) => payment.billingId === draft.billingId && payment.status === PaymentStatusEnum.SUCCESS)
      .reduce((sum, payment) => sum + payment.amount, 0)
  }, [draft.billingId, payments])

  const remainingAmount = Math.max((selectedBilling?.totalAmount ?? 0) - paidAmount, 0)

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1.5}>
          <div>
            <Typography component="h1" variant="h5">
              {t('Payment List')}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {t('Receive payment and automatically update billing status.')}
            </Typography>
          </div>
          <Button variant="contained" onClick={() => setOpenDialog(true)}>
            {t('Receive Payment')}
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2.5 }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>{t('Status')}</InputLabel>
            <Select
              label={t('Status')}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'ALL' | PaymentStatus)}
            >
              <MenuItem value="ALL">{t('All Status')}</MenuItem>
              {paymentStatusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {t(paymentStatusLabel[status])}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>{t('Method')}</InputLabel>
            <Select
              label={t('Method')}
              value={methodFilter}
              onChange={(event) => setMethodFilter(event.target.value as 'ALL' | string)}
            >
              <MenuItem value="ALL">{t('All Methods')}</MenuItem>
              {paymentMethodOptions.map((method) => (
                <MenuItem key={method} value={method}>
                  {t(method)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('Date')}</TableCell>
              <TableCell>{t('Room')}</TableCell>
              <TableCell>{t('Tenant')}</TableCell>
              <TableCell align="right">{t('Amount')}</TableCell>
              <TableCell>{t('Method')}</TableCell>
              <TableCell>{t('Reference')}</TableCell>
              <TableCell>{t('Status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments.map((payment) => {
              const room = roomMap.get(payment.roomId)
              const tenant = tenantMap.get(payment.tenantId)

              return (
                <TableRow key={payment.id} hover>
                  <TableCell>{payment.paymentDate}</TableCell>
                  <TableCell>{room?.roomNumber ?? '-'}</TableCell>
                  <TableCell>{tenant ? `${tenant.firstName} ${tenant.lastName}` : '-'}</TableCell>
                  <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{t(payment.method)}</TableCell>
                  <TableCell>{payment.referenceNo || '-'}</TableCell>
                  <TableCell>
                    <StatusChip status={payment.status} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('Receive Payment')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.75} sx={{ mt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('Billing')}</InputLabel>
              <Select
                label={t('Billing')}
                value={draft.billingId}
                onChange={(event) => {
                  const billingId = event.target.value
                  const billing = billingMap.get(billingId)
                  const successfulPaid = payments
                    .filter(
                      (payment) =>
                        payment.billingId === billingId && payment.status === PaymentStatusEnum.SUCCESS,
                    )
                    .reduce((sum, payment) => sum + payment.amount, 0)

                  setDraft((prev) => ({
                    ...prev,
                    billingId,
                    amount: billing ? Math.max(billing.totalAmount - successfulPaid, 0) : prev.amount,
                  }))
                }}
              >
                {receivableBillings.map((billing) => {
                  const room = roomMap.get(billing.roomId)
                  const tenant = tenantMap.get(billing.tenantId)

                  return (
                    <MenuItem key={billing.id} value={billing.id}>
                      {billing.billingMonth} | {t('Room')} {room?.roomNumber ?? '-'} | {tenant?.firstName ?? '-'}{' '}
                      {tenant?.lastName ?? ''}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>

            {selectedBilling && (
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="body2">
                  {t('Bill total')}: {formatCurrency(selectedBilling.totalAmount)}
                </Typography>
                <Typography variant="body2">
                  {t('Already paid')}: {formatCurrency(paidAmount)}
                </Typography>
                <Typography variant="subtitle2">
                  {t('Remaining')}: {formatCurrency(remainingAmount)}
                </Typography>
              </Paper>
            )}

            <TextField
              type="date"
              size="small"
              label={t('Payment Date')}
              value={draft.paymentDate}
              onChange={(event) => setDraft((prev) => ({ ...prev, paymentDate: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              type="number"
              size="small"
              label={t('Amount')}
              value={draft.amount}
              onChange={(event) => setDraft((prev) => ({ ...prev, amount: Number(event.target.value) }))}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>{t('Method')}</InputLabel>
              <Select
                label={t('Method')}
                value={draft.method}
                onChange={(event) => setDraft((prev) => ({ ...prev, method: event.target.value }))}
              >
                {paymentMethodOptions.map((method) => (
                  <MenuItem key={method} value={method}>
                    {t(method)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>{t('Status')}</InputLabel>
              <Select
                label={t('Status')}
                value={draft.status}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, status: event.target.value as PaymentStatus }))
                }
              >
                {paymentStatusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {t(paymentStatusLabel[status])}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label={t('Reference No')}
              value={draft.referenceNo}
              onChange={(event) => setDraft((prev) => ({ ...prev, referenceNo: event.target.value }))}
            />

            <TextField
              size="small"
              label={t('Note')}
              multiline
              minRows={2}
              value={draft.note}
              onChange={(event) => setDraft((prev) => ({ ...prev, note: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('Cancel')}</Button>
          <Button
            variant="contained"
            disabled={!draft.billingId || draft.amount <= 0}
            onClick={() => {
              paymentRepository.create({
                billingId: draft.billingId,
                paymentDate: draft.paymentDate,
                amount: draft.amount,
                method: draft.method,
                referenceNo: draft.referenceNo,
                status: draft.status,
                note: draft.note,
              })

              setOpenDialog(false)
              setDraft({
                billingId: '',
                paymentDate: todayIsoDate(),
                amount: 0,
                method: paymentMethodOptions[0],
                referenceNo: '',
                status: PaymentStatusEnum.SUCCESS,
                note: '',
              })
              loadData()
            }}
          >
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
