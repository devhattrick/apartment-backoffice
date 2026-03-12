import dayjs from 'dayjs'
import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { roomStatusLabel } from '../../../constants/statusMeta'
import { StatusChip } from '../../../components/status/StatusChip'
import { useI18n } from '../../../i18n/useI18n'
import { dashboardRepository, databaseRepository } from '../../../services/repositories'
import { PaymentStatus, type RoomStatus } from '../../../types'
import { formatDate } from '../../../utils/date'
import { formatCurrency } from '../../../utils/formatters'

const ROOM_STATUS_COLORS: Record<RoomStatus, string> = {
  AVAILABLE: '#16a34a',
  RESERVED: '#f59e0b',
  OCCUPIED: '#0284c7',
  CHECKOUT_PENDING: '#0ea5e9',
  CLEANING: '#64748b',
  MAINTENANCE: '#ef4444',
  UNAVAILABLE: '#7c3aed',
}

interface PieSlice {
  status: RoomStatus
  label: string
  value: number
  color: string
}

interface PieSegment extends PieSlice {
  dashLength: number
  dashOffset: number
}

function createPieSegments(data: PieSlice[], total: number, circumference: number): PieSegment[] {
  let runningOffset = 0

  return data.map((slice) => {
    const dashLength = total > 0 ? (slice.value / total) * circumference : 0
    const segment: PieSegment = {
      ...slice,
      dashLength,
      dashOffset: runningOffset,
    }

    runningOffset += dashLength

    return segment
  })
}

export function DashboardPage() {
  const { t } = useI18n()
  const summary = dashboardRepository.getSummary()
  const snapshot = databaseRepository.getSnapshot()

  const roomMap = new Map(snapshot.rooms.map((room) => [room.id, room]))
  const tenantMap = new Map(snapshot.tenants.map((tenant) => [tenant.id, tenant]))

  const summaryCards = [
    { label: t('Total Rooms'), value: String(summary.totalRooms) },
    { label: t('Available Rooms'), value: String(summary.availableRooms) },
    { label: t('Occupied Rooms'), value: String(summary.occupiedRooms) },
    { label: t('Reserved Rooms'), value: String(summary.reservedRooms) },
    { label: t('Pending Payment'), value: String(summary.pendingPaymentCount) },
    { label: t('Income This Month'), value: formatCurrency(summary.incomeThisMonth) },
  ]

  const pieData: PieSlice[] = summary.roomStatusBreakdown
    .filter((item) => item.count > 0)
    .map((item) => ({
      status: item.status,
      label: t(roomStatusLabel[item.status]),
      value: item.count,
      color: ROOM_STATUS_COLORS[item.status],
    }))

  const pieRadius = 62
  const pieStroke = 24
  const pieCircumference = 2 * Math.PI * pieRadius
  const pieSegments = createPieSegments(pieData, summary.totalRooms, pieCircumference)

  const monthlyIncomeData = Array.from({ length: 6 }, (_, index) => {
    const monthValue = dayjs().subtract(5 - index, 'month').format('YYYY-MM')
    const amount = snapshot.payments
      .filter(
        (payment) =>
          payment.status === PaymentStatus.SUCCESS && dayjs(payment.paymentDate).format('YYYY-MM') === monthValue,
      )
      .reduce((sum, payment) => sum + payment.amount, 0)

    return {
      monthValue,
      monthLabel: dayjs(`${monthValue}-01`).format('MMM'),
      amount,
    }
  })

  const rawMaxIncome = Math.max(...monthlyIncomeData.map((item) => item.amount), 0)
  const incomeScaleMax = Math.max(Math.ceil(rawMaxIncome / 1000) * 1000, 1000)

  const chartWidth = 420
  const chartHeight = 220
  const chartPadding = { top: 14, right: 16, bottom: 36, left: 42 }
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom
  const barGap = 16
  const barWidth = (plotWidth - barGap * (monthlyIncomeData.length - 1)) / monthlyIncomeData.length

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography component="h1" variant="h5">
          {t('Dashboard')}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t('Snapshot from local mock database. Every module updates this dashboard automatically.')}
        </Typography>
      </Paper>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((item) => (
          <Paper key={item.label} sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.8 }}>
              {item.value}
            </Typography>
          </Paper>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Paper sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('Room Status Pie Chart')}
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ md: 'center' }} sx={{ mt: 1.5 }}>
            <svg width="190" height="190" viewBox="0 0 190 190" aria-label="Room status pie chart">
              <circle
                cx="95"
                cy="95"
                r={pieRadius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={pieStroke}
              />
              {pieSegments.map((segment) => (
                <circle
                  key={segment.status}
                  cx="95"
                  cy="95"
                  r={pieRadius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={pieStroke}
                  strokeLinecap="butt"
                  strokeDasharray={`${segment.dashLength} ${pieCircumference - segment.dashLength}`}
                  strokeDashoffset={-segment.dashOffset}
                  transform="rotate(-90 95 95)"
                />
              ))}
              <text x="95" y="90" textAnchor="middle" fontSize="28" fontWeight="700" fill="#0f172a">
                {summary.totalRooms}
              </text>
              <text x="95" y="112" textAnchor="middle" fontSize="12" fill="#64748b">
                {t('Rooms')}
              </text>
            </svg>

            <Stack spacing={1.1} sx={{ width: '100%' }}>
              {pieData.map((slice) => {
                const percent = summary.totalRooms > 0 ? (slice.value / summary.totalRooms) * 100 : 0

                return (
                  <Stack key={slice.status} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          backgroundColor: slice.color,
                          display: 'inline-block',
                        }}
                      />
                      <Typography variant="body2">{slice.label}</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {slice.value} ({percent.toFixed(0)}%)
                    </Typography>
                  </Stack>
                )
              })}
            </Stack>
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('Monthly Income Bar Chart')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('Last 6 months from payment records')}
          </Typography>

          <div className="mt-3 w-full overflow-x-auto">
            <svg
              width="100%"
              height="230"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="xMinYMin meet"
              aria-label="Monthly income bar chart"
            >
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = chartPadding.top + plotHeight - plotHeight * ratio
                const tickValue = incomeScaleMax * ratio

                return (
                  <g key={ratio}>
                    <line
                      x1={chartPadding.left}
                      y1={y}
                      x2={chartWidth - chartPadding.right}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                    <text x={chartPadding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">
                      {Math.round(tickValue / 1000)}k
                    </text>
                  </g>
                )
              })}

              {monthlyIncomeData.map((item, index) => {
                const ratio = item.amount / incomeScaleMax
                const barHeight = ratio * plotHeight
                const x = chartPadding.left + index * (barWidth + barGap)
                const y = chartPadding.top + plotHeight - barHeight

                return (
                  <g key={item.monthValue}>
                    <rect x={x} y={y} width={barWidth} height={barHeight} rx="6" fill="#0284c7" opacity="0.9" />
                    <text
                      x={x + barWidth / 2}
                      y={chartPadding.top + plotHeight + 16}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#64748b"
                    >
                      {item.monthLabel}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </Paper>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Paper sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('Recent Payments')}
          </Typography>
          <Table size="small" sx={{ mt: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('Date')}</TableCell>
                <TableCell>{t('Room')}</TableCell>
                <TableCell>{t('Tenant')}</TableCell>
                <TableCell align="right">{t('Amount')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.recentPayments.map((payment) => {
                const room = roomMap.get(payment.roomId)
                const tenant = tenantMap.get(payment.tenantId)

                return (
                  <TableRow key={payment.id} hover>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>{room?.roomNumber ?? '-'}</TableCell>
                    <TableCell>{tenant ? `${tenant.firstName} ${tenant.lastName}` : '-'}</TableCell>
                    <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('Recent Maintenance')}
          </Typography>
          <Stack spacing={1.25} sx={{ mt: 1.5 }}>
            {summary.recentMaintenances.map((item) => {
              const room = roomMap.get(item.roomId)

              return (
                <Paper key={item.id} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    gap={1}
                  >
                    <div>
                      <Typography fontWeight={600}>{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                        {t('Room')} {room?.roomNumber ?? '-'} | {formatDate(item.requestedDate)}
                      </Typography>
                    </div>
                    <StatusChip status={item.status} />
                  </Stack>
                </Paper>
              )
            })}
          </Stack>
        </Paper>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Paper sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('Upcoming Contract Expiry')}
          </Typography>
          <Table size="small" sx={{ mt: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('Contract No.')}</TableCell>
                <TableCell>{t('Room')}</TableCell>
                <TableCell>{t('Tenant')}</TableCell>
                <TableCell>{t('End Date')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.upcomingContractExpiries.map((contract) => {
                const room = roomMap.get(contract.roomId)
                const tenant = tenantMap.get(contract.tenantId)

                return (
                  <TableRow key={contract.id} hover>
                    <TableCell>{contract.contractNo}</TableCell>
                    <TableCell>{room?.roomNumber ?? '-'}</TableCell>
                    <TableCell>{tenant ? `${tenant.firstName} ${tenant.lastName}` : '-'}</TableCell>
                    <TableCell>{formatDate(contract.endDate)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('Room Status Breakdown')}
          </Typography>
          <Stack spacing={1.25} sx={{ mt: 1.5 }}>
            {summary.roomStatusBreakdown.map((item) => (
              <Stack key={item.status} direction="row" justifyContent="space-between" alignItems="center">
                <StatusChip status={item.status} />
                <Typography fontWeight={600}>{item.count}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </div>
    </Stack>
  )
}
