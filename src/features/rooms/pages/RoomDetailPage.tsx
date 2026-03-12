import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
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
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { occupancyTypeLabel, roomStatusLabel, roomStatusTransitions } from '../../../constants/statusMeta'
import { StatusChip } from '../../../components/status/StatusChip'
import { useI18n } from '../../../i18n/useI18n'
import { databaseRepository, roomRepository } from '../../../services/repositories'
import { PaymentStatus } from '../../../types'
import type { Billing, Contract, Maintenance, Payment, Room, RoomStatus, Tenant } from '../../../types'
import { formatDate } from '../../../utils/date'
import { formatCurrency } from '../../../utils/formatters'

interface RoomRelatedData {
  room: Room
  currentContract: Contract | null
  currentTenant: Tenant | null
  roomBillings: Billing[]
  roomPayments: Payment[]
  roomMaintenances: Maintenance[]
}

function resolveAllowedStatus(currentStatus: RoomStatus): RoomStatus[] {
  return [currentStatus, ...roomStatusTransitions[currentStatus]]
}

export function RoomDetailPage() {
  const { t } = useI18n()
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [refreshKey, setRefreshKey] = useState(0)

  if (refreshKey < 0) {
    return null
  }

  let detail: RoomRelatedData | null = null

  if (roomId) {
    const currentRoom = roomRepository.getById(roomId)
    if (currentRoom) {
      const snapshot = databaseRepository.getSnapshot()
      const contracts = snapshot.contracts
        .filter((contract) => contract.roomId === currentRoom.id)
        .sort((a, b) => b.startDate.localeCompare(a.startDate))

      const currentContract = contracts[0] ?? null
      const currentTenant = currentContract
        ? snapshot.tenants.find((tenant) => tenant.id === currentContract.tenantId) ?? null
        : null

      detail = {
        room: currentRoom,
        currentContract,
        currentTenant,
        roomBillings: snapshot.billings
          .filter((billing) => billing.roomId === currentRoom.id)
          .sort((a, b) => b.billingMonth.localeCompare(a.billingMonth)),
        roomPayments: snapshot.payments
          .filter((payment) => payment.roomId === currentRoom.id)
          .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)),
        roomMaintenances: snapshot.maintenances
          .filter((maintenance) => maintenance.roomId === currentRoom.id)
          .sort((a, b) => b.requestedDate.localeCompare(a.requestedDate)),
      }
    }
  }

  if (!detail) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">{t('Room not found')}</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/rooms')}>
          {t('Back to Room List')}
        </Button>
      </Paper>
    )
  }

  const { room, currentContract, currentTenant, roomBillings, roomPayments, roomMaintenances } = detail

  const totalPaid = roomPayments
    .filter((payment) => payment.status === PaymentStatus.SUCCESS)
    .reduce((sum, payment) => sum + payment.amount, 0)

  const allowedStatus = resolveAllowedStatus(room.status)

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1.5}>
          <div>
            <Button
              size="small"
              startIcon={<ArrowBackRoundedIcon />}
              sx={{ mb: 0.75, px: 0.5 }}
              onClick={() => navigate('/rooms')}
            >
              {t('Back to list')}
            </Button>
            <Typography component="h1" variant="h5">
              {t('Room')} {room.roomNumber}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {t('Floor')} {room.floor} | {room.type}
            </Typography>
          </div>
          <StatusChip status={room.status} size="medium" />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
          <Typography variant="body2">
            {t('Occupancy Type')}: {t(occupancyTypeLabel[room.occupancyType])}
          </Typography>
          <Typography variant="body2">
            {t('Rent')}: {formatCurrency(room.monthlyRent)}{' '}
            {room.occupancyType === 'DAILY' ? t('per day') : t('per month')}
          </Typography>
          <Typography variant="body2">
            {t('Deposit')}: {formatCurrency(room.depositAmount)}
          </Typography>
          <Typography variant="body2">
            {t('Total payment history')}: {formatCurrency(totalPaid)}
          </Typography>
        </Stack>

        <FormControl size="small" sx={{ mt: 2.5, minWidth: 220 }}>
          <InputLabel>{t('Change Room Status')}</InputLabel>
          <Select
            label={t('Change Room Status')}
            value={room.status}
            onChange={(event) => {
              roomRepository.updateStatus(room.id, event.target.value as RoomStatus)
              setRefreshKey((prev) => prev + 1)
            }}
          >
            {allowedStatus.map((status) => (
              <MenuItem key={status} value={status}>
                {t(roomStatusLabel[status])}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('Current Tenant & Contract')}
          </Typography>
          {currentContract && currentTenant ? (
            <Stack spacing={0.8} sx={{ mt: 1.25 }}>
              <Typography>
                {t('Tenant')}: {currentTenant.firstName} {currentTenant.lastName}
              </Typography>
              <Typography>
                {t('Phone')}: {currentTenant.phone}
              </Typography>
              <Typography>
                {t('Contract No.')}: {currentContract.contractNo}
              </Typography>
              <Typography>
                {t('Contract')}: {formatDate(currentContract.startDate)} - {formatDate(currentContract.endDate)}
              </Typography>
              <StatusChip status={currentContract.status} />
            </Stack>
          ) : (
            <Typography color="text.secondary" sx={{ mt: 1.25 }}>
              {t('No active tenant for this room.')}
            </Typography>
          )}
        </Paper>

        <Paper sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('Meter Summary')}
          </Typography>
          <Stack spacing={1} sx={{ mt: 1.25 }}>
            <Typography>
              {t('Water meter latest')}: {room.waterMeterLatest}
            </Typography>
            <Typography>
              {t('Electric meter latest')}: {room.electricMeterLatest}
            </Typography>
            <Typography color="text.secondary">
              {t('Update values from Billing module when generating monthly bills.')}
            </Typography>
          </Stack>
        </Paper>
      </div>

      <Paper sx={{ p: 2.5, overflowX: 'auto' }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {t('Billing Summary')}
        </Typography>
        <Table size="small" sx={{ mt: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('Month')}</TableCell>
              <TableCell align="right">{t('Total')}</TableCell>
              <TableCell>{t('Due Date')}</TableCell>
              <TableCell>{t('Status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roomBillings.map((billing) => (
              <TableRow key={billing.id} hover>
                <TableCell>{billing.billingMonth}</TableCell>
                <TableCell align="right">{formatCurrency(billing.totalAmount)}</TableCell>
                <TableCell>{formatDate(billing.dueDate)}</TableCell>
                <TableCell>
                  <StatusChip status={billing.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
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
              {roomPayments.map((payment) => (
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

        <Paper sx={{ p: 2.5, overflowX: 'auto' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('Maintenance History')}
          </Typography>
          <Table size="small" sx={{ mt: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('Title')}</TableCell>
                <TableCell>{t('Requested')}</TableCell>
                <TableCell>{t('Status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomMaintenances.map((maintenance) => (
                <TableRow key={maintenance.id} hover>
                  <TableCell>{maintenance.title}</TableCell>
                  <TableCell>{formatDate(maintenance.requestedDate)}</TableCell>
                  <TableCell>
                    <StatusChip status={maintenance.status} />
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
