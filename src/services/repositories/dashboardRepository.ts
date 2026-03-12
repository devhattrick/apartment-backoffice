import dayjs from 'dayjs'
import type { Contract, Maintenance, Payment, Room } from '../../types'
import { BillingStatus, ContractStatus, PaymentStatus, RoomStatus } from '../../types'
import { monthKey } from '../../utils/date'
import { databaseRepository } from './databaseRepository'

export interface DashboardSummary {
  totalRooms: number
  availableRooms: number
  occupiedRooms: number
  reservedRooms: number
  pendingPaymentCount: number
  incomeThisMonth: number
  recentPayments: Payment[]
  recentMaintenances: Maintenance[]
  upcomingContractExpiries: Contract[]
  roomStatusBreakdown: Array<{ status: Room['status']; count: number }>
}

export const dashboardRepository = {
  getSummary(): DashboardSummary {
    const snapshot = databaseRepository.getSnapshot()
    const currentMonth = monthKey()

    const roomStatusBreakdown = Object.values(RoomStatus).map((status) => ({
      status,
      count: snapshot.rooms.filter((room) => room.status === status).length,
    }))

    const pendingPaymentCount = snapshot.billings.filter(
      (billing) => billing.status === BillingStatus.UNPAID || billing.status === BillingStatus.OVERDUE,
    ).length

    const incomeThisMonth = snapshot.payments
      .filter(
        (payment) =>
          payment.status === PaymentStatus.SUCCESS &&
          dayjs(payment.paymentDate).format('YYYY-MM') === currentMonth,
      )
      .reduce((total, payment) => total + payment.amount, 0)

    const recentPayments = [...snapshot.payments]
      .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
      .slice(0, 5)

    const recentMaintenances = [...snapshot.maintenances]
      .sort((a, b) => b.requestedDate.localeCompare(a.requestedDate))
      .slice(0, 5)

    const upcomingContractExpiries = snapshot.contracts
      .filter((contract) => contract.status === ContractStatus.ACTIVE || contract.status === ContractStatus.PENDING)
      .sort((a, b) => a.endDate.localeCompare(b.endDate))
      .slice(0, 5)

    return {
      totalRooms: snapshot.rooms.length,
      availableRooms: snapshot.rooms.filter((room) => room.status === RoomStatus.AVAILABLE).length,
      occupiedRooms: snapshot.rooms.filter((room) => room.status === RoomStatus.OCCUPIED).length,
      reservedRooms: snapshot.rooms.filter((room) => room.status === RoomStatus.RESERVED).length,
      pendingPaymentCount,
      incomeThisMonth,
      recentPayments,
      recentMaintenances,
      upcomingContractExpiries,
      roomStatusBreakdown,
    }
  },
}
