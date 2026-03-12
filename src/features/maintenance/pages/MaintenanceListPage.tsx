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
import { maintenancePriorityOptions, maintenanceStatusOptions } from '../../../constants/options'
import { maintenanceStatusLabel } from '../../../constants/statusMeta'
import { StatusChip } from '../../../components/status/StatusChip'
import { useI18n } from '../../../i18n/useI18n'
import { databaseRepository, maintenanceRepository } from '../../../services/repositories'
import type { Maintenance, MaintenanceStatus, Room } from '../../../types'
import { MaintenanceStatus as MaintenanceStatusEnum } from '../../../types'
import { todayIsoDate } from '../../../utils/date'
import { formatCurrency } from '../../../utils/formatters'

interface MaintenanceDraft {
  roomId: string
  title: string
  description: string
  priority: Maintenance['priority']
  requestedDate: string
}

export function MaintenanceListPage() {
  const { t } = useI18n()
  const initialSnapshot = databaseRepository.getSnapshot()
  const [maintenances, setMaintenances] = useState<Maintenance[]>(() => maintenanceRepository.getAll())
  const [rooms, setRooms] = useState<Room[]>(() => initialSnapshot.rooms)
  const [statusFilter, setStatusFilter] = useState<'ALL' | MaintenanceStatus>('ALL')

  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openCloseDialog, setOpenCloseDialog] = useState(false)
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<string>('')
  const [closeCost, setCloseCost] = useState(0)
  const [closeNote, setCloseNote] = useState('')

  const [draft, setDraft] = useState<MaintenanceDraft>({
    roomId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    requestedDate: todayIsoDate(),
  })

  const loadData = () => {
    const snapshot = databaseRepository.getSnapshot()
    setMaintenances(maintenanceRepository.getAll())
    setRooms(snapshot.rooms)
  }

  const roomMap = useMemo(() => new Map(rooms.map((room) => [room.id, room])), [rooms])

  const filteredMaintenances = useMemo(() => {
    if (statusFilter === 'ALL') {
      return maintenances
    }

    return maintenances.filter((maintenance) => maintenance.status === statusFilter)
  }, [maintenances, statusFilter])

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1.5}>
          <div>
            <Typography component="h1" variant="h5">
              {t('Maintenance List')}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {t('Create maintenance request and update ticket progress.')}
            </Typography>
          </div>
          <Button variant="contained" onClick={() => setOpenCreateDialog(true)}>
            {t('New Ticket')}
          </Button>
        </Stack>

        <FormControl size="small" sx={{ mt: 2.5, minWidth: 180 }}>
          <InputLabel>{t('Status')}</InputLabel>
          <Select
            label={t('Status')}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'ALL' | MaintenanceStatus)}
          >
            <MenuItem value="ALL">{t('All Status')}</MenuItem>
            {maintenanceStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {t(maintenanceStatusLabel[status])}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('Room')}</TableCell>
              <TableCell>{t('Title')}</TableCell>
              <TableCell>{t('Priority')}</TableCell>
              <TableCell>{t('Requested')}</TableCell>
              <TableCell>{t('Status')}</TableCell>
              <TableCell align="right">{t('Cost')}</TableCell>
              <TableCell align="right">{t('Action')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMaintenances.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{roomMap.get(item.roomId)?.roomNumber ?? '-'}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.priority}</TableCell>
                <TableCell>{item.requestedDate}</TableCell>
                <TableCell>
                  <StatusChip status={item.status} />
                </TableCell>
                <TableCell align="right">{formatCurrency(item.cost)}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <Select
                        value={item.status}
                        onChange={(event) => {
                          const status = event.target.value as MaintenanceStatus
                          maintenanceRepository.updateStatus(item.id, status)
                          loadData()
                        }}
                      >
                        {maintenanceStatusOptions.map((status) => (
                          <MenuItem key={status} value={status}>
                            {t(maintenanceStatusLabel[status])}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {(item.status === MaintenanceStatusEnum.OPEN ||
                      item.status === MaintenanceStatusEnum.IN_PROGRESS) && (
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedMaintenanceId(item.id)
                          setCloseCost(item.cost)
                          setCloseNote(item.note)
                          setOpenCloseDialog(true)
                        }}
                      >
                        {t('Close Job')}
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
        <DialogTitle>{t('Create Maintenance Ticket')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.75} sx={{ mt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('Room')}</InputLabel>
              <Select
                label={t('Room')}
                value={draft.roomId}
                onChange={(event) => setDraft((prev) => ({ ...prev, roomId: event.target.value }))}
              >
                {rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {t('Room')} {room.roomNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label={t('Title')}
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            />

            <TextField
              size="small"
              label={t('Description')}
              value={draft.description}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
              multiline
              minRows={2}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>{t('Priority')}</InputLabel>
              <Select
                label={t('Priority')}
                value={draft.priority}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, priority: event.target.value as Maintenance['priority'] }))
                }
              >
                {maintenancePriorityOptions.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {t(priority)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="date"
              size="small"
              label={t('Requested Date')}
              value={draft.requestedDate}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, requestedDate: event.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>{t('Cancel')}</Button>
          <Button
            variant="contained"
            disabled={!draft.roomId || !draft.title.trim()}
            onClick={() => {
              maintenanceRepository.create({
                roomId: draft.roomId,
                title: draft.title,
                description: draft.description,
                priority: draft.priority,
                requestedDate: draft.requestedDate,
              })
              setOpenCreateDialog(false)
              setDraft({
                roomId: '',
                title: '',
                description: '',
                priority: 'MEDIUM',
                requestedDate: todayIsoDate(),
              })
              loadData()
            }}
          >
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCloseDialog} onClose={() => setOpenCloseDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('Close Maintenance Job')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              type="number"
              label={t('Final Cost')}
              size="small"
              value={closeCost}
              onChange={(event) => setCloseCost(Number(event.target.value))}
            />
            <TextField
              label={t('Note')}
              size="small"
              value={closeNote}
              onChange={(event) => setCloseNote(event.target.value)}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCloseDialog(false)}>{t('Cancel')}</Button>
          <Button
            variant="contained"
            onClick={() => {
              maintenanceRepository.updateStatus(selectedMaintenanceId, MaintenanceStatusEnum.COMPLETED, {
                cost: closeCost,
                note: closeNote,
              })
              setOpenCloseDialog(false)
              setSelectedMaintenanceId('')
              setCloseCost(0)
              setCloseNote('')
              loadData()
            }}
          >
            {t('Complete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
