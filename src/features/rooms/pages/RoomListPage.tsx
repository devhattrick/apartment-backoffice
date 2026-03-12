import {
  Button,
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
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { occupancyTypeOptions, roomStatusOptions } from '../../../constants/options'
import { occupancyTypeLabel, roomStatusLabel } from '../../../constants/statusMeta'
import { StatusChip } from '../../../components/status/StatusChip'
import { useI18n } from '../../../i18n/useI18n'
import { roomRepository } from '../../../services/repositories'
import type { OccupancyType, Room, RoomStatus } from '../../../types'
import { formatCurrency } from '../../../utils/formatters'

const roomBlockTone: Record<RoomStatus, { background: string; border: string; text: string }> = {
  AVAILABLE: { background: '#f0fdf4', border: '#22c55e', text: '#14532d' },
  RESERVED: { background: '#fffbeb', border: '#f59e0b', text: '#78350f' },
  OCCUPIED: { background: '#eff6ff', border: '#3b82f6', text: '#1e3a8a' },
  CHECKOUT_PENDING: { background: '#ecfeff', border: '#06b6d4', text: '#164e63' },
  CLEANING: { background: '#f8fafc', border: '#64748b', text: '#334155' },
  MAINTENANCE: { background: '#fef2f2', border: '#ef4444', text: '#7f1d1d' },
  UNAVAILABLE: { background: '#faf5ff', border: '#8b5cf6', text: '#4c1d95' },
}

export function RoomListPage() {
  const { t } = useI18n()
  const [rooms, setRooms] = useState<Room[]>(() => roomRepository.getAll())
  const [searchKeyword, setSearchKeyword] = useState('')
  const [floorFilter, setFloorFilter] = useState<'ALL' | number>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | RoomStatus>('ALL')
  const [occupancyTypeFilter, setOccupancyTypeFilter] = useState<'ALL' | OccupancyType>('ALL')
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'block'>('block')

  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const loadRooms = () => {
    setRooms(roomRepository.getAll())
  }

  const floorOptions = useMemo(
    () => Array.from(new Set(rooms.map((room) => room.floor))).sort((a, b) => a - b),
    [rooms],
  )

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch = room.roomNumber.includes(searchKeyword.trim())
      const matchesFloor = floorFilter === 'ALL' || room.floor === floorFilter
      const matchesStatus = statusFilter === 'ALL' || room.status === statusFilter
      const matchesOccupancy = occupancyTypeFilter === 'ALL' || room.occupancyType === occupancyTypeFilter

      return matchesSearch && matchesFloor && matchesStatus && matchesOccupancy
    })
  }, [floorFilter, occupancyTypeFilter, rooms, searchKeyword, statusFilter])

  const roomsByFloor = useMemo(() => {
    const floorMap = new Map<number, Room[]>()

    filteredRooms.forEach((room) => {
      const current = floorMap.get(room.floor) ?? []
      current.push(room)
      floorMap.set(room.floor, current)
    })

    return [...floorMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([floor, floorRooms]) => ({
        floor,
        rooms: [...floorRooms].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })),
      }))
  }, [filteredRooms])

  const activeView = isMobile ? 'block' : viewMode
  const legendItems = roomStatusOptions.map((status) => ({
    status,
    label: t(roomStatusLabel[status]),
    color: roomBlockTone[status].border,
  }))

  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    roomRepository.updateStatus(roomId, status)
    loadRooms()
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography component="h1" variant="h5">
          {t('Room List')}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t('Search and filter all rooms with quick status updates.')}
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mt: 2.5 }}>
          <TextField
            label={t('Search room')}
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>{t('Floor')}</InputLabel>
            <Select
              label={t('Floor')}
              value={floorFilter}
              onChange={(event) => {
                const value = event.target.value
                setFloorFilter(value === 'ALL' ? 'ALL' : Number(value))
              }}
            >
              <MenuItem value="ALL">{t('All Floors')}</MenuItem>
              {floorOptions.map((floor) => (
                <MenuItem key={floor} value={floor}>
                  {t('Floor')} {floor}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t('Status')}</InputLabel>
            <Select
              label={t('Status')}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'ALL' | RoomStatus)}
            >
              <MenuItem value="ALL">{t('All Status')}</MenuItem>
              {roomStatusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {t(roomStatusLabel[status])}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t('Occupancy Type')}</InputLabel>
            <Select
              label={t('Occupancy Type')}
              value={occupancyTypeFilter}
              onChange={(event) => setOccupancyTypeFilter(event.target.value as 'ALL' | OccupancyType)}
            >
              <MenuItem value="ALL">{t('All Occupancy Types')}</MenuItem>
              {occupancyTypeOptions.map((occupancyType) => (
                <MenuItem key={occupancyType} value={occupancyType}>
                  {t(occupancyTypeLabel[occupancyType])}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!isMobile && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value: 'table' | 'card' | 'block' | null) => {
                if (value) {
                  setViewMode(value)
                }
              }}
              size="small"
            >
              <ToggleButton value="table">{t('Table')}</ToggleButton>
              <ToggleButton value="card">{t('Card')}</ToggleButton>
              <ToggleButton value="block">{t('Block')}</ToggleButton>
            </ToggleButtonGroup>
          )}
        </Stack>
      </Paper>

      {activeView === 'table' ? (
        <Paper sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('Room')}</TableCell>
                <TableCell>{t('Floor')}</TableCell>
                <TableCell>{t('Type')}</TableCell>
                <TableCell>{t('Occupancy Type')}</TableCell>
                <TableCell align="right">{t('Rent')}</TableCell>
                <TableCell>{t('Status')}</TableCell>
                <TableCell>{t('Quick Status')}</TableCell>
                <TableCell align="right">{t('Action')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.id} hover>
                  <TableCell>{room.roomNumber}</TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>{t(occupancyTypeLabel[room.occupancyType])}</TableCell>
                  <TableCell align="right">{formatCurrency(room.monthlyRent)}</TableCell>
                  <TableCell>
                    <StatusChip status={room.status} />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 170 }}>
                      <Select
                        value={room.status}
                        onChange={(event) => updateRoomStatus(room.id, event.target.value as RoomStatus)}
                      >
                        {roomStatusOptions.map((status) => (
                          <MenuItem key={status} value={status}>
                            {t(roomStatusLabel[status])}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => navigate(`/rooms/${room.id}`)}>
                      {t('View')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ) : activeView === 'card' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRooms.map((room) => (
            <Paper key={room.id} sx={{ p: 2.25 }}>
              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">
                    {t('Room')} {room.roomNumber}
                  </Typography>
                  <StatusChip status={room.status} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {t('Floor')} {room.floor} | {room.type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('Occupancy Type')}: {t(occupancyTypeLabel[room.occupancyType])}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(room.monthlyRent)}{' '}
                  {room.occupancyType === 'DAILY' ? t('per day') : t('per month')}
                </Typography>

                <FormControl size="small" fullWidth>
                  <InputLabel>{t('Status')}</InputLabel>
                  <Select
                    label={t('Status')}
                    value={room.status}
                    onChange={(event) => updateRoomStatus(room.id, event.target.value as RoomStatus)}
                  >
                    {roomStatusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {t(roomStatusLabel[status])}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button variant="outlined" size="small" onClick={() => navigate(`/rooms/${room.id}`)}>
                  {t('View Detail')}
                </Button>
              </Stack>
            </Paper>
          ))}
        </div>
      ) : (
        <Stack spacing={2.5}>
          <Paper sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {t('Status Legend')}
            </Typography>
            <div className="mt-2 flex flex-wrap gap-2">
              {legendItems.map((item) => (
                <span
                  key={item.status}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1"
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      backgroundColor: item.color,
                      display: 'inline-block',
                    }}
                  />
                  <Typography variant="caption" sx={{ lineHeight: 1 }}>
                    {item.label}
                  </Typography>
                </span>
              ))}
            </div>
          </Paper>

          {roomsByFloor.map((floorBlock) => (
            <Paper key={floorBlock.floor} sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {t('Floor')} {floorBlock.floor}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {floorBlock.rooms.length} {t('rooms')}
                </Typography>
              </Stack>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                {floorBlock.rooms.map((room) => {
                  const tone = roomBlockTone[room.status]
                  const tooltipContent = (
                    <Stack spacing={0.25} sx={{ py: 0.25 }}>
                      <Typography variant="caption" fontWeight={700} color="inherit">
                        {t('Room')} {room.roomNumber}
                      </Typography>
                      <Typography variant="caption" color="inherit">
                        {t('Floor')} {room.floor} | {room.type}
                      </Typography>
                      <Typography variant="caption" color="inherit">
                        {t('Occupancy Type')}: {t(occupancyTypeLabel[room.occupancyType])}
                      </Typography>
                      <Typography variant="caption" color="inherit">
                        {t('Rent')}: {formatCurrency(room.monthlyRent)}{' '}
                        {room.occupancyType === 'DAILY' ? t('per day') : t('per month')}
                      </Typography>
                      <Typography variant="caption" color="inherit">
                        {t('Status')}: {t(roomStatusLabel[room.status])}
                      </Typography>
                    </Stack>
                  )

                  return (
                    <Tooltip key={room.id} title={tooltipContent} arrow placement="top">
                      <Paper
                        component="button"
                        onClick={() => navigate(`/rooms/${room.id}`)}
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: tone.border,
                          backgroundColor: tone.background,
                          color: tone.text,
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 3,
                          },
                        }}
                      >
                        <Typography variant="caption" sx={{ opacity: 0.85 }}>
                          {t('Room')}
                        </Typography>
                        <Typography variant="h6" sx={{ lineHeight: 1.1, mt: 0.2 }}>
                          {room.roomNumber}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.8 }}>
                          {t(roomStatusLabel[room.status])}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
                          {t(occupancyTypeLabel[room.occupancyType])}
                        </Typography>
                      </Paper>
                    </Tooltip>
                  )
                })}
              </div>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
