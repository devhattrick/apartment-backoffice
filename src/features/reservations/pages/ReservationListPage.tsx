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
import { databaseRepository, reservationRepository } from '../../../services/repositories'
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

const initialDraft: ReservationDraft = {
  roomId: '',
  tenantId: '',
  expectedMoveInDate: todayIsoDate(),
  status: ReservationStatusEnum.PENDING,
  remark: '',
}

export function ReservationListPage() {
  const { t } = useI18n()
  const [reservations, setReservations] = useState<Reservation[]>(() => reservationRepository.getAll())
  const [rooms, setRooms] = useState<Room[]>(() => databaseRepository.getSnapshot().rooms)
  const [tenants, setTenants] = useState<Tenant[]>(() => databaseRepository.getSnapshot().tenants)
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReservationStatus>('ALL')
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [draft, setDraft] = useState<ReservationDraft>(initialDraft)

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
  }

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
            disabled={!draft.roomId || !draft.tenantId || !draft.expectedMoveInDate}
            onClick={() => {
              reservationRepository.create({
                roomId: draft.roomId,
                tenantId: draft.tenantId,
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
