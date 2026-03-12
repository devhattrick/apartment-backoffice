import {
  BillingStatus,
  ContractStatus,
  MaintenanceStatus,
  OccupancyType,
  PaymentStatus,
  ReservationStatus,
  RoomStatus,
  UserRole,
  UserStatus,
} from '../types'

export const roomStatusLabel: Record<RoomStatus, string> = {
  [RoomStatus.AVAILABLE]: 'Available',
  [RoomStatus.RESERVED]: 'Reserved',
  [RoomStatus.OCCUPIED]: 'Occupied',
  [RoomStatus.CHECKOUT_PENDING]: 'Check-out Pending',
  [RoomStatus.CLEANING]: 'Cleaning',
  [RoomStatus.MAINTENANCE]: 'Maintenance',
  [RoomStatus.UNAVAILABLE]: 'Unavailable',
}

export const reservationStatusLabel: Record<ReservationStatus, string> = {
  [ReservationStatus.PENDING]: 'Pending',
  [ReservationStatus.CONFIRMED]: 'Confirmed',
  [ReservationStatus.CANCELLED]: 'Cancelled',
  [ReservationStatus.CONVERTED]: 'Converted',
}

export const occupancyTypeLabel: Record<OccupancyType, string> = {
  [OccupancyType.MONTHLY]: 'Monthly',
  [OccupancyType.DAILY]: 'Daily',
}

export const contractStatusLabel: Record<ContractStatus, string> = {
  [ContractStatus.ACTIVE]: 'Active',
  [ContractStatus.EXPIRED]: 'Expired',
  [ContractStatus.TERMINATED]: 'Terminated',
  [ContractStatus.PENDING]: 'Pending',
}

export const billingStatusLabel: Record<BillingStatus, string> = {
  [BillingStatus.UNPAID]: 'Unpaid',
  [BillingStatus.PARTIALLY_PAID]: 'Partially Paid',
  [BillingStatus.PAID]: 'Paid',
  [BillingStatus.OVERDUE]: 'Overdue',
}

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  [PaymentStatus.SUCCESS]: 'Success',
  [PaymentStatus.PENDING]: 'Pending',
  [PaymentStatus.FAILED]: 'Failed',
  [PaymentStatus.REFUNDED]: 'Refunded',
}

export const maintenanceStatusLabel: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.OPEN]: 'Open',
  [MaintenanceStatus.IN_PROGRESS]: 'In Progress',
  [MaintenanceStatus.COMPLETED]: 'Completed',
  [MaintenanceStatus.CANCELLED]: 'Cancelled',
}

export const userRoleLabel: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.STAFF]: 'Staff',
  [UserRole.ACCOUNTANT]: 'Accountant',
}

export const userStatusLabel: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Active',
  [UserStatus.INACTIVE]: 'Inactive',
}

export const roomStatusTransitions: Record<RoomStatus, RoomStatus[]> = {
  [RoomStatus.AVAILABLE]: [RoomStatus.RESERVED, RoomStatus.MAINTENANCE, RoomStatus.UNAVAILABLE],
  [RoomStatus.RESERVED]: [RoomStatus.OCCUPIED, RoomStatus.MAINTENANCE, RoomStatus.UNAVAILABLE],
  [RoomStatus.OCCUPIED]: [RoomStatus.CHECKOUT_PENDING, RoomStatus.MAINTENANCE, RoomStatus.UNAVAILABLE],
  [RoomStatus.CHECKOUT_PENDING]: [RoomStatus.CLEANING, RoomStatus.MAINTENANCE, RoomStatus.UNAVAILABLE],
  [RoomStatus.CLEANING]: [RoomStatus.AVAILABLE, RoomStatus.MAINTENANCE, RoomStatus.UNAVAILABLE],
  [RoomStatus.MAINTENANCE]: [RoomStatus.CLEANING, RoomStatus.AVAILABLE, RoomStatus.UNAVAILABLE],
  [RoomStatus.UNAVAILABLE]: [RoomStatus.AVAILABLE],
}
