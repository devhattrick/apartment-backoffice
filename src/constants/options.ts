import {
  OccupancyType,
  BillingStatus,
  ContractStatus,
  MaintenanceStatus,
  PaymentStatus,
  ReservationStatus,
  RoomStatus,
  UserRole,
  UserStatus,
} from '../types'

export const roomStatusOptions = Object.values(RoomStatus)
export const occupancyTypeOptions = Object.values(OccupancyType)
export const reservationStatusOptions = Object.values(ReservationStatus)
export const contractStatusOptions = Object.values(ContractStatus)
export const billingStatusOptions = Object.values(BillingStatus)
export const paymentStatusOptions = Object.values(PaymentStatus)
export const maintenanceStatusOptions = Object.values(MaintenanceStatus)
export const userRoleOptions = Object.values(UserRole)
export const userStatusOptions = Object.values(UserStatus)

export const paymentMethodOptions = ['CASH', 'BANK_TRANSFER', 'PROMPTPAY', 'CARD'] as const
export type PaymentMethod = (typeof paymentMethodOptions)[number]

export const maintenancePriorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const
export type MaintenancePriority = (typeof maintenancePriorityOptions)[number]
