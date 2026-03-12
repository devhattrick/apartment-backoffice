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
import { reservationStatusOptions } from '../../../constants/options'
import { reservationStatusLabel } from '../../../constants/statusMeta'
import { StatusChip } from '../../../components/status/StatusChip'
import { useI18n } from '../../../i18n/useI18n'
import { databaseRepository, reservationRepository, tenantRepository } from '../../../services/repositories'
import type { Reservation, ReservationStatus, Room, Tenant } from '../../../types'
import { ReservationStatus as ReservationStatusEnum, RoomStatus } from '../../../types'
import { todayIsoDate } from '../../../utils/date'

interface ReservationDraft {
  roomId: string
  tenantId: string
  expectedMoveInDate: string
  status: ReservationStatus
  remark: string
}

type TenantMode = 'EXISTING' | 'NEW'

interface NewTenantDraft {
  firstName: string
  lastName: string
  phone: string
  email: string
  idCardNo: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  note: string
}

const initialDraft: ReservationDraft = {
  roomId: '',
  tenantId: '',
  expectedMoveInDate: todayIsoDate(),
  status: ReservationStatusEnum.PENDING,
  remark: '',
}

const initialNewTenantDraft: NewTenantDraft = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  idCardNo: '',
  address: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  note: '',
}

export function ReservationListPage() {
  const { t } = useI18n()
  const [reservations, setReservations] = useState<Reservation[]>(() => reservationRepository.getAll())
  const [rooms, setRooms] = useState<Room[]>(() => databaseRepository.getSnapshot().rooms)
  const [tenants, setTenants] = useState<Tenant[]>(() => databaseRepository.getSnapshot().tenants)
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReservationStatus>('ALL')
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [draft, setDraft] = useState<ReservationDraft>(initialDraft)
  const [tenantMode, setTenantMode] = useState<TenantMode>('EXISTING')
  const [newTenantDraft, setNewTenantDraft] = useState<NewTenantDraft>(initialNewTenantDraft)

  const loadData = () => {
    const snapshot = databaseRepository.getSnapshot()
    setReservations(reservationRepository.getAll())
    setRooms(snapshot.rooms)
    setTenants(snapshot.tenants)
  }

  const roomMap = useMemo(() => new Map(rooms.map((room) => [room.id, room])), [rooms])
  const tenantMap = useMemo(() => new Map(tenants.map((tenant) => [tenant.id, tenant])), [tenants])

  const availableRooms = rooms.filter((room) => room.status === RoomStatus.AVAILABLE)

  const filteredReservations = useMemo(() => {
    if (statusFilter === 'ALL') {
      return reservations
    }

    return reservations.filter((reservation) => reservation.status === statusFilter)
  }, [reservations, statusFilter])

  const resetDraft = () => {
    setDraft(initialDraft)
    setTenantMode('EXISTING')
    setNewTenantDraft(initialNewTenantDraft)
  }

  const isNewTenantValid =
    newTenantDraft.firstName.trim().length > 0 &&
    newTenantDraft.lastName.trim().length > 0 &&
    newTenantDraft.phone.trim().length > 0

  const canSaveReservation =
    draft.roomId.length > 0 &&
    draft.expectedMoveInDate.length > 0 &&
    (tenantMode === 'EXISTING' ? draft.tenantId.length > 0 : isNewTenantValid)

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1.5}>
          <div>
            <Typography component="h1" variant="h5">
              {t('Reservation List')}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {t('Track room booking from pending to contract conversion.')}
            </Typography>
          </div>
          <Button variant="contained" onClick={() => setOpenCreateDialog(true)}>
            {t('Create Reservation')}
          </Button>
        </Stack>

        <FormControl size="small" sx={{ mt: 2.5, minWidth: 180 }}>
          <InputLabel>{t('Status')}</InputLabel>
          <Select
            label={t('Status')}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'ALL' | ReservationStatus)}
          >
            <MenuItem value="ALL">{t('All Status')}</MenuItem>
            {reservationStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {t(reservationStatusLabel[status])}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('Reserved Date')}</TableCell>
              <TableCell>{t('Expected Move-in')}</TableCell>
              <TableCell>{t('Room')}</TableCell>
              <TableCell>{t('Tenant')}</TableCell>
              <TableCell>{t('Status')}</TableCell>
              <TableCell>{t('Remark')}</TableCell>
              <TableCell align="right">{t('Action')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReservations.map((reservation) => {
              const room = roomMap.get(reservation.roomId)
              const tenant = tenantMap.get(reservation.tenantId)

              return (
                <TableRow key={reservation.id} hover>
                  <TableCell>{reservation.reservedDate}</TableCell>
                  <TableCell>{reservation.expectedMoveInDate}</TableCell>
                  <TableCell>{room?.roomNumber ?? '-'}</TableCell>
                  <TableCell>{tenant ? `${tenant.firstName} ${tenant.lastName}` : '-'}</TableCell>
                  <TableCell>
                    <StatusChip status={reservation.status} />
                  </TableCell>
                  <TableCell>{reservation.remark || '-'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {reservation.status === ReservationStatusEnum.PENDING && (
                        <Button
                          size="small"
                          onClick={() => {
                            reservationRepository.updateStatus(
                              reservation.id,
                              ReservationStatusEnum.CONFIRMED,
                            )
                            loadData()
                          }}
                        >
                          {t('Confirm')}
                        </Button>
                      )}

                      {reservation.status !== ReservationStatusEnum.CANCELLED &&
                        reservation.status !== ReservationStatusEnum.CONVERTED && (
                          <Button
                            size="small"
                            onClick={() => {
                            reservationRepository.convertToContract(reservation.id)
                            loadData()
                          }}
                        >
                          {t('Convert')}
                        </Button>
                      )}

                      {reservation.status !== ReservationStatusEnum.CANCELLED &&
                        reservation.status !== ReservationStatusEnum.CONVERTED && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => {
                              reservationRepository.cancel(reservation.id)
                              loadData()
                            }}
                          >
                            {t('Cancel')}
                          </Button>
                        )}
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('Create Reservation')}</DialogTitle>
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
              <InputLabel>{t('Tenant Type')}</InputLabel>
              <Select
                label={t('Tenant Type')}
                value={tenantMode}
                onChange={(event) => setTenantMode(event.target.value as TenantMode)}
              >
                <MenuItem value="EXISTING">{t('Select Existing Tenant')}</MenuItem>
                <MenuItem value="NEW">{t('Create New Tenant')}</MenuItem>
              </Select>
            </FormControl>

            {tenantMode === 'EXISTING' ? (
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
            ) : (
              <Stack spacing={1.25}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                  <TextField
                    required
                    size="small"
                    label={t('First Name')}
                    value={newTenantDraft.firstName}
                    onChange={(event) =>
                      setNewTenantDraft((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                    fullWidth
                  />
                  <TextField
                    required
                    size="small"
                    label={t('Last Name')}
                    value={newTenantDraft.lastName}
                    onChange={(event) =>
                      setNewTenantDraft((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                    fullWidth
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                  <TextField
                    required
                    size="small"
                    label={t('Phone')}
                    value={newTenantDraft.phone}
                    onChange={(event) =>
                      setNewTenantDraft((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label={t('Email')}
                    value={newTenantDraft.email}
                    onChange={(event) =>
                      setNewTenantDraft((prev) => ({ ...prev, email: event.target.value }))
                    }
                    fullWidth
                  />
                </Stack>

                <TextField
                  size="small"
                  label={t('ID Card')}
                  value={newTenantDraft.idCardNo}
                  onChange={(event) =>
                    setNewTenantDraft((prev) => ({ ...prev, idCardNo: event.target.value }))
                  }
                />

                <TextField
                  size="small"
                  label={t('Address')}
                  value={newTenantDraft.address}
                  onChange={(event) =>
                    setNewTenantDraft((prev) => ({ ...prev, address: event.target.value }))
                  }
                  multiline
                  minRows={2}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                  <TextField
                    size="small"
                    label={t('Emergency Contact Name')}
                    value={newTenantDraft.emergencyContactName}
                    onChange={(event) =>
                      setNewTenantDraft((prev) => ({
                        ...prev,
                        emergencyContactName: event.target.value,
                      }))
                    }
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label={t('Emergency Contact Phone')}
                    value={newTenantDraft.emergencyContactPhone}
                    onChange={(event) =>
                      setNewTenantDraft((prev) => ({
                        ...prev,
                        emergencyContactPhone: event.target.value,
                      }))
                    }
                    fullWidth
                  />
                </Stack>

                <TextField
                  size="small"
                  label={t('Note')}
                  value={newTenantDraft.note}
                  onChange={(event) =>
                    setNewTenantDraft((prev) => ({ ...prev, note: event.target.value }))
                  }
                  multiline
                  minRows={2}
                />
              </Stack>
            )}

            <TextField
              type="date"
              label={t('Expected Move-in')}
              size="small"
              value={draft.expectedMoveInDate}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, expectedMoveInDate: event.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>{t('Status')}</InputLabel>
              <Select
                label={t('Status')}
                value={draft.status}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, status: event.target.value as ReservationStatus }))
                }
              >
                {reservationStatusOptions
                  .filter((status) => status !== ReservationStatusEnum.CANCELLED)
                  .map((status) => (
                    <MenuItem key={status} value={status}>
                      {t(reservationStatusLabel[status])}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              label={t('Remark')}
              size="small"
              value={draft.remark}
              onChange={(event) => setDraft((prev) => ({ ...prev, remark: event.target.value }))}
              multiline
              minRows={2}
            />
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
            disabled={!canSaveReservation}
            onClick={() => {
              let tenantId = draft.tenantId

              if (tenantMode === 'NEW') {
                const createdTenant = tenantRepository.create({
                  firstName: newTenantDraft.firstName,
                  lastName: newTenantDraft.lastName,
                  phone: newTenantDraft.phone,
                  email: newTenantDraft.email,
                  idCardNo: newTenantDraft.idCardNo,
                  address: newTenantDraft.address,
                  emergencyContactName: newTenantDraft.emergencyContactName,
                  emergencyContactPhone: newTenantDraft.emergencyContactPhone,
                  note: newTenantDraft.note,
                })
                tenantId = createdTenant.id
              }

              if (!tenantId) {
                return
              }

              reservationRepository.create({
                roomId: draft.roomId,
                tenantId,
                expectedMoveInDate: draft.expectedMoveInDate,
                status: draft.status,
                remark: draft.remark,
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
    </Stack>
  )
}
