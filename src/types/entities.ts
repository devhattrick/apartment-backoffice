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
} from './enums'

export type EntityId = string
export type ISODateString = string

export interface Room {
  id: EntityId
  roomNumber: string
  floor: number
  type: string
  occupancyType: OccupancyType
  monthlyRent: number
  depositAmount: number
  status: RoomStatus
  waterMeterLatest: number
  electricMeterLatest: number
  note: string
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface Tenant {
  id: EntityId
  firstName: string
  lastName: string
  phone: string
  email: string
  idCardNo: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  note: string
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface Reservation {
  id: EntityId
  roomId: EntityId
  tenantId: EntityId
  reservedDate: ISODateString
  expectedMoveInDate: ISODateString
  status: ReservationStatus
  remark: string
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface Contract {
  id: EntityId
  roomId: EntityId
  tenantId: EntityId
  contractNo: string
  startDate: ISODateString
  endDate: ISODateString
  monthlyRent: number
  depositAmount: number
  paymentDueDay: number
  status: ContractStatus
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface Billing {
  id: EntityId
  roomId: EntityId
  tenantId: EntityId
  contractId: EntityId
  billingMonth: string
  roomRent: number
  waterUnits: number
  waterRate: number
  waterAmount: number
  electricUnits: number
  electricRate: number
  electricAmount: number
  otherAmount: number
  totalAmount: number
  dueDate: ISODateString
  status: BillingStatus
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface Payment {
  id: EntityId
  billingId: EntityId
  tenantId: EntityId
  roomId: EntityId
  paymentDate: ISODateString
  amount: number
  method: string
  referenceNo: string
  status: PaymentStatus
  note: string
  createdAt: ISODateString
}

export interface Maintenance {
  id: EntityId
  roomId: EntityId
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: MaintenanceStatus
  requestedDate: ISODateString
  completedDate: ISODateString | null
  cost: number
  note: string
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface User {
  id: EntityId
  username: string
  fullName: string
  role: UserRole
  status: UserStatus
  createdAt: ISODateString
  updatedAt: ISODateString
}
