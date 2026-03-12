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
import { billingStatusOptions } from '../../../constants/options'
import { billingStatusLabel } from '../../../constants/statusMeta'
import { StatusChip } from '../../../components/status/StatusChip'
import { useI18n } from '../../../i18n/useI18n'
import { billingRepository, databaseRepository } from '../../../services/repositories'
import type { Billing, BillingStatus, Contract, Room, Tenant } from '../../../types'
import { ContractStatus } from '../../../types'
import { monthKey, todayIsoDate } from '../../../utils/date'
import { formatCurrency } from '../../../utils/formatters'

interface BillingDraft {
  contractId: string
  billingMonth: string
  waterUnits: number
  electricUnits: number
  otherAmount: number
  dueDate: string
}

export function BillingListPage() {
  const { t } = useI18n()
  const initialSnapshot = databaseRepository.getSnapshot()
  const [billings, setBillings] = useState<Billing[]>(() => billingRepository.getAll())
  const [contracts, setContracts] = useState<Contract[]>(() => initialSnapshot.contracts)
  const [rooms, setRooms] = useState<Room[]>(() => initialSnapshot.rooms)
  const [tenants, setTenants] = useState<Tenant[]>(() => initialSnapshot.tenants)
  const [monthFilter, setMonthFilter] = useState<'ALL' | string>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | BillingStatus>('ALL')

  const [openGenerateDialog, setOpenGenerateDialog] = useState(false)
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null)

  const [draft, setDraft] = useState<BillingDraft>({
    contractId: '',
    billingMonth: monthKey(),
    waterUnits: 0,
    electricUnits: 0,
    otherAmount: 0,
    dueDate: todayIsoDate(),
  })

  const [waterRate, setWaterRate] = useState(initialSnapshot.settings.waterRate)
  const [electricRate, setElectricRate] = useState(initialSnapshot.settings.electricRate)

  const loadData = () => {
    const snapshot = databaseRepository.getSnapshot()

    setBillings(billingRepository.getAll())
    setContracts(snapshot.contracts)
    setRooms(snapshot.rooms)
    setTenants(snapshot.tenants)
    setWaterRate(snapshot.settings.waterRate)
    setElectricRate(snapshot.settings.electricRate)
  }

  const activeContracts = contracts.filter(
    (contract) => contract.status === ContractStatus.ACTIVE || contract.status === ContractStatus.PENDING,
  )

  const roomMap = useMemo(() => new Map(rooms.map((room) => [room.id, room])), [rooms])
  const tenantMap = useMemo(() => new Map(tenants.map((tenant) => [tenant.id, tenant])), [tenants])
  const contractMap = useMemo(() => new Map(contracts.map((contract) => [contract.id, contract])), [contracts])

  const monthOptions = useMemo(() => {
    return Array.from(new Set(billings.map((billing) => billing.billingMonth))).sort((a, b) =>
      b.localeCompare(a),
    )
  }, [billings])

  const filteredBillings = useMemo(() => {
    return billings.filter((billing) => {
      const matchesMonth = monthFilter === 'ALL' || billing.billingMonth === monthFilter
      const matchesStatus = statusFilter === 'ALL' || billing.status === statusFilter
      return matchesMonth && matchesStatus
    })
  }, [billings, monthFilter, statusFilter])

  const selectedContract = contractMap.get(draft.contractId)
  const roomRentPreview = selectedContract?.monthlyRent ?? 0
  const waterAmountPreview = draft.waterUnits * waterRate
  const electricAmountPreview = draft.electricUnits * electricRate
  const totalPreview = roomRentPreview + waterAmountPreview + electricAmountPreview + draft.otherAmount

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1.5}>
          <div>
            <Typography component="h1" variant="h5">
              {t('Billing List')}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {t('Generate monthly invoice from meter units and track payment status.')}
            </Typography>
          </div>
          <Button variant="contained" onClick={() => setOpenGenerateDialog(true)}>
            {t('Generate Bill')}
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2.5 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('Month')}</InputLabel>
            <Select
              label={t('Month')}
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value as 'ALL' | string)}
            >
              <MenuItem value="ALL">{t('All Months')}</MenuItem>
              {monthOptions.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>{t('Status')}</InputLabel>
            <Select
              label={t('Status')}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'ALL' | BillingStatus)}
            >
              <MenuItem value="ALL">{t('All Status')}</MenuItem>
              {billingStatusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {t(billingStatusLabel[status])}
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
              <TableCell>{t('Month')}</TableCell>
              <TableCell>{t('Room')}</TableCell>
              <TableCell>{t('Tenant')}</TableCell>
              <TableCell align="right">{t('Total')}</TableCell>
              <TableCell>{t('Due Date')}</TableCell>
              <TableCell>{t('Status')}</TableCell>
              <TableCell align="right">{t('Action')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBillings.map((billing) => {
              const room = roomMap.get(billing.roomId)
              const tenant = tenantMap.get(billing.tenantId)

              return (
                <TableRow key={billing.id} hover>
                  <TableCell>{billing.billingMonth}</TableCell>
                  <TableCell>{room?.roomNumber ?? '-'}</TableCell>
                  <TableCell>{tenant ? `${tenant.firstName} ${tenant.lastName}` : '-'}</TableCell>
                  <TableCell align="right">{formatCurrency(billing.totalAmount)}</TableCell>
                  <TableCell>{billing.dueDate}</TableCell>
                  <TableCell>
                    <StatusChip status={billing.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => setSelectedBilling(billing)}>
                        {t('Detail')}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          billingRepository.markOverdue(billing.id)
                          loadData()
                        }}
                      >
                        {t('Mark Overdue')}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openGenerateDialog} onClose={() => setOpenGenerateDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('Generate Bill')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.75} sx={{ mt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('Contract')}</InputLabel>
              <Select
                label={t('Contract')}
                value={draft.contractId}
                onChange={(event) => setDraft((prev) => ({ ...prev, contractId: event.target.value }))}
              >
                {activeContracts.map((contract) => {
                  const room = roomMap.get(contract.roomId)
                  const tenant = tenantMap.get(contract.tenantId)
                  return (
                    <MenuItem key={contract.id} value={contract.id}>
                      {contract.contractNo} | {t('Room')} {room?.roomNumber ?? '-'} | {tenant?.firstName ?? '-'}{' '}
                      {tenant?.lastName ?? ''}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>

            <TextField
              label={t('Month')}
              size="small"
              value={draft.billingMonth}
              onChange={(event) => setDraft((prev) => ({ ...prev, billingMonth: event.target.value }))}
              placeholder="YYYY-MM"
            />

            <TextField
              type="number"
              label={t('Water Units')}
              size="small"
              value={draft.waterUnits}
              onChange={(event) => setDraft((prev) => ({ ...prev, waterUnits: Number(event.target.value) }))}
            />

            <TextField
              type="number"
              label={t('Electric Units')}
              size="small"
              value={draft.electricUnits}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, electricUnits: Number(event.target.value) }))
              }
            />

            <TextField
              type="number"
              label={t('Other Amount')}
              size="small"
              value={draft.otherAmount}
              onChange={(event) => setDraft((prev) => ({ ...prev, otherAmount: Number(event.target.value) }))}
            />

            <TextField
              type="date"
              label={t('Due Date')}
              size="small"
              value={draft.dueDate}
              onChange={(event) => setDraft((prev) => ({ ...prev, dueDate: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />

            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="body2">
                {t('Rent')}: {formatCurrency(roomRentPreview)}
              </Typography>
              <Typography variant="body2">
                {t('Water')}: ({draft.waterUnits} x {waterRate}) {formatCurrency(waterAmountPreview)}
              </Typography>
              <Typography variant="body2">
                {t('Electric')}: ({draft.electricUnits} x {electricRate}) {formatCurrency(electricAmountPreview)}
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 0.7 }}>
                {t('Total')}: {formatCurrency(totalPreview)}
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGenerateDialog(false)}>{t('Cancel')}</Button>
          <Button
            variant="contained"
            disabled={!draft.contractId}
            onClick={() => {
              billingRepository.create({
                contractId: draft.contractId,
                billingMonth: draft.billingMonth,
                waterUnits: draft.waterUnits,
                electricUnits: draft.electricUnits,
                otherAmount: draft.otherAmount,
                dueDate: draft.dueDate,
              })
              setOpenGenerateDialog(false)
              loadData()
            }}
          >
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(selectedBilling)} onClose={() => setSelectedBilling(null)} fullWidth maxWidth="xs">
        <DialogTitle>{t('Detail')}</DialogTitle>
        <DialogContent>
          {selectedBilling && (
            <Stack spacing={0.9} sx={{ mt: 1 }}>
              <Typography>
                {t('Rent')}: {formatCurrency(selectedBilling.roomRent)}
              </Typography>
              <Typography>
                {t('Water')}: {selectedBilling.waterUnits} x {selectedBilling.waterRate} ={' '}
                {formatCurrency(selectedBilling.waterAmount)}
              </Typography>
              <Typography>
                {t('Electric')}: {selectedBilling.electricUnits} x {selectedBilling.electricRate} ={' '}
                {formatCurrency(selectedBilling.electricAmount)}
              </Typography>
              <Typography>
                {t('Other Amount')}: {formatCurrency(selectedBilling.otherAmount)}
              </Typography>
              <Typography fontWeight={700}>
                {t('Total')}: {formatCurrency(selectedBilling.totalAmount)}
              </Typography>
              <Typography>
                {t('Due Date')}: {selectedBilling.dueDate}
              </Typography>
              <StatusChip status={selectedBilling.status} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBilling(null)}>{t('Cancel')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
