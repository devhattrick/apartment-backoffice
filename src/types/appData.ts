import type {
  Billing,
  Contract,
  ISODateString,
  Maintenance,
  Payment,
  Reservation,
  Room,
  Tenant,
  User,
} from './entities'

export interface AppSettings {
  apartmentName: string
  apartmentAddress: string
  apartmentPhone: string
  defaultMonthlyRent: number
  defaultDepositMonths: number
  waterRate: number
  electricRate: number
  billingDueDay: number
  receiptPrefix: string
  updatedAt: ISODateString
}

export interface AppDatabaseMeta {
  version: number
  seededAt: ISODateString
  updatedAt: ISODateString
}

export interface AppDatabase {
  rooms: Room[]
  tenants: Tenant[]
  reservations: Reservation[]
  contracts: Contract[]
  billings: Billing[]
  payments: Payment[]
  maintenances: Maintenance[]
  users: User[]
  settings: AppSettings
  meta: AppDatabaseMeta
}
