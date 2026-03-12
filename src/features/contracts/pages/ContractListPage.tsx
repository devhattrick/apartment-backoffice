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
import { useNavigate } from 'react-router-dom'
import { contractStatusOptions } from '../../../constants/options'
import { contractStatusLabel } from '../../../constants/statusMeta'
import { StatusChip } from '../../../components/status/StatusChip'
import { useI18n } from '../../../i18n/useI18n'
import { contractRepository, databaseRepository } from '../../../services/repositories'
import type { Contract, ContractStatus, Room, Tenant } from '../../../types'
import { ContractStatus as ContractStatusEnum, RoomStatus } from '../../../types'
import { addYears, todayIsoDate } from '../../../utils/date'
import { formatCurrency } from '../../../utils/formatters'

interface ContractDraft {
  roomId: string
  tenantId: string
  startDate: string
  endDate: string
  paymentDueDay: number
  status: ContractStatus
}

export function ContractListPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const initialSnapshot = databaseRepository.getSnapshot()

  const [contracts, setContracts] = useState<Contract[]>(() => contractRepository.getAll())
  const [rooms, setRooms] = useState<Room[]>(() => initialSnapshot.rooms)
  const [tenants, setTenants] = useState<Tenant[]>(() => initialSnapshot.tenants)
  const [statusFilter, setStatusFilter] = useState<'ALL' | ContractStatus>('ALL')

  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openRenewDialog, setOpenRenewDialog] = useState(false)
  const [selectedContractId, setSelectedContractId] = useState<string>('')
  const [renewEndDate, setRenewEndDate] = useState(addYears(todayIsoDate(), 1))

  const [draft, setDraft] = useState<ContractDraft>({
    roomId: '',
    tenantId: '',
    startDate: todayIsoDate(),
    endDate: addYears(todayIsoDate(), 1),
    paymentDueDay: initialSnapshot.settings.billingDueDay,
    status: ContractStatusEnum.ACTIVE,
  })

  const loadData = () => {
    const snapshot = databaseRepository.getSnapshot()
    setContracts(contractRepository.getAll())
    setRooms(snapshot.rooms)
    setTenants(snapshot.tenants)
  }

  const roomMap = useMemo(() => new Map(rooms.map((room) => [room.id, room])), [rooms])
  const tenantMap = useMemo(() => new Map(tenants.map((tenant) => [tenant.id, tenant])), [tenants])

  const availableRooms = rooms.filter(
    (room) => room.status === RoomStatus.AVAILABLE || room.status === RoomStatus.RESERVED,
  )

  const filteredContracts = useMemo(() => {
    if (statusFilter === 'ALL') {
      return contracts
    }

    return contracts.filter((contract) => contract.status === statusFilter)
  }, [contracts, statusFilter])

  const resetDraft = () => {
    setDraft({
      roomId: '',
      tenantId: '',
      startDate: todayIsoDate(),
      endDate: addYears(todayIsoDate(), 1),
      paymentDueDay: initialSnapshot.settings.billingDueDay,
      status: ContractStatusEnum.ACTIVE,
    })
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1.5}>
          <div>
            <Typography component="h1" variant="h5">
              {t('Contract List')}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {t('Create, renew and terminate tenant contracts.')}
            </Typography>
          </div>
          <Button variant="contained" onClick={() => setOpenCreateDialog(true)}>
            {t('Create Contract')}
          </Button>
        </Stack>

        <FormControl size="small" sx={{ mt: 2.5, minWidth: 180 }}>
          <InputLabel>{t('Status')}</InputLabel>
          <Select
            label={t('Status')}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'ALL' | ContractStatus)}
          >
            <MenuItem value="ALL">{t('All Status')}</MenuItem>
            {contractStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {t(contractStatusLabel[status])}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('Contract No.')}</TableCell>
              <TableCell>{t('Room')}</TableCell>
              <TableCell>{t('Tenant')}</TableCell>
              <TableCell>{t('Start')}</TableCell>
              <TableCell>{t('End Date')}</TableCell>
              <TableCell align="right">{t('Rent')}</TableCell>
              <TableCell>{t('Status')}</TableCell>
              <TableCell align="right">{t('Action')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContracts.map((contract) => (
              <TableRow key={contract.id} hover>
                <TableCell>{contract.contractNo}</TableCell>
                <TableCell>{roomMap.get(contract.roomId)?.roomNumber ?? '-'}</TableCell>
                <TableCell>{(() => {
                  const tenant = tenantMap.get(contract.tenantId)
                  return tenant ? `${tenant.firstName} ${tenant.lastName}` : '-'
                })()}</TableCell>
                <TableCell>{contract.startDate}</TableCell>
                <TableCell>{contract.endDate}</TableCell>
                <TableCell align="right">{formatCurrency(contract.monthlyRent)}</TableCell>
                <TableCell>
                  <StatusChip status={contract.status} />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      onClick={() => {
                        const tenant = tenantMap.get(contract.tenantId)
                        if (tenant) {
                          navigate(`/tenants/${tenant.id}`)
                        }
                      }}
                    >
                      {t('Tenant')}
                    </Button>
                    {(contract.status === ContractStatusEnum.ACTIVE ||
                      contract.status === ContractStatusEnum.PENDING) && (
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedContractId(contract.id)
                          setRenewEndDate(addYears(contract.endDate, 1))
                          setOpenRenewDialog(true)
                        }}
                      >
                        {t('Renew')}
                      </Button>
                    )}
                    {contract.status === ContractStatusEnum.ACTIVE && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          contractRepository.terminate(contract.id)
                          loadData()
                        }}
                      >
                        {t('Terminate')}
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('Create Contract')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.75} sx={{ mt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('Room')}</InputLabel>
              <Select
                label={t('Room')}
                value={draft.roomId}
                onChange={(event) => setDraft((prev) => ({ ...prev, roomId: event.target.value }))}
              >
                {availableRooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {t('Room')} {room.roomNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>{t('Tenant')}</InputLabel>
              <Select
                label={t('Tenant')}
                value={draft.tenantId}
                onChange={(event) => setDraft((prev) => ({ ...prev, tenantId: event.target.value }))}
              >
                {tenants.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.id}>
                    {tenant.firstName} {tenant.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="date"
              label={t('Start')}
              size="small"
              value={draft.startDate}
              onChange={(event) => setDraft((prev) => ({ ...prev, startDate: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              type="date"
              label={t('End Date')}
              size="small"
              value={draft.endDate}
              onChange={(event) => setDraft((prev) => ({ ...prev, endDate: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              type="number"
              label={t('Payment Due Day')}
              size="small"
              value={draft.paymentDueDay}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, paymentDueDay: Number(event.target.value) }))
              }
              inputProps={{ min: 1, max: 28 }}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>{t('Status')}</InputLabel>
              <Select
                label={t('Status')}
                value={draft.status}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, status: event.target.value as ContractStatus }))
                }
              >
                <MenuItem value={ContractStatusEnum.ACTIVE}>{t('Active')}</MenuItem>
                <MenuItem value={ContractStatusEnum.PENDING}>{t('Pending')}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenCreateDialog(false)
              resetDraft()
            }}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={!draft.roomId || !draft.tenantId}
            onClick={() => {
              contractRepository.create({
                roomId: draft.roomId,
                tenantId: draft.tenantId,
                startDate: draft.startDate,
                endDate: draft.endDate,
                paymentDueDay: draft.paymentDueDay,
                status: draft.status,
              })
              setOpenCreateDialog(false)
              resetDraft()
              loadData()
            }}
          >
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRenewDialog} onClose={() => setOpenRenewDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('Renew')} {t('Contract')}</DialogTitle>
        <DialogContent>
          <TextField
            type="date"
            label={t('End Date')}
            size="small"
            fullWidth
            sx={{ mt: 1 }}
            value={renewEndDate}
            onChange={(event) => setRenewEndDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRenewDialog(false)}>{t('Cancel')}</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedContractId) {
                contractRepository.renew(selectedContractId, renewEndDate)
                loadData()
              }
              setOpenRenewDialog(false)
            }}
          >
            {t('Renew')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
