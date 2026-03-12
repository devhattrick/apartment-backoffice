export const RoomStatus = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  OCCUPIED: 'OCCUPIED',
  CHECKOUT_PENDING: 'CHECKOUT_PENDING',
  CLEANING: 'CLEANING',
  MAINTENANCE: 'MAINTENANCE',
  UNAVAILABLE: 'UNAVAILABLE',
} as const

export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus]

export const OccupancyType = {
  MONTHLY: 'MONTHLY',
  DAILY: 'DAILY',
} as const

export type OccupancyType = (typeof OccupancyType)[keyof typeof OccupancyType]

export const ReservationStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  CONVERTED: 'CONVERTED',
} as const

export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus]

export const ContractStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  TERMINATED: 'TERMINATED',
  PENDING: 'PENDING',
} as const

export type ContractStatus = (typeof ContractStatus)[keyof typeof ContractStatus]

export const BillingStatus = {
  UNPAID: 'UNPAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
} as const

export type BillingStatus = (typeof BillingStatus)[keyof typeof BillingStatus]

export const PaymentStatus = {
  SUCCESS: 'SUCCESS',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

export const MaintenanceStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type MaintenanceStatus = (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus]

export const UserRole = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  ACCOUNTANT: 'ACCOUNTANT',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]
