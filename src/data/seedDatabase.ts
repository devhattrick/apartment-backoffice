import dayjs from 'dayjs'
import type { AppDatabase, AppSettings, Billing, Contract, Maintenance, Payment, Reservation, Room, Tenant, User } from '../types'
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

function defaultSettings(now: string): AppSettings {
  return {
    apartmentName: 'Blue Horizon Apartment',
    apartmentAddress: '88 Sukhumvit Road, Bangkok',
    apartmentPhone: '02-555-7788',
    defaultMonthlyRent: 5200,
    defaultDepositMonths: 2,
    waterRate: 18,
    electricRate: 8,
    billingDueDay: 5,
    receiptPrefix: 'RCPT',
    updatedAt: now,
  }
}

function createRoom(
  id: string,
  roomNumber: string,
  floor: number,
  type: string,
  occupancyType: OccupancyType,
  monthlyRent: number,
  status: RoomStatus,
  waterMeterLatest: number,
  electricMeterLatest: number,
  note: string,
  now: string,
): Room {
  return {
    id,
    roomNumber,
    floor,
    type,
    occupancyType,
    monthlyRent,
    depositAmount: monthlyRent * 2,
    status,
    waterMeterLatest,
    electricMeterLatest,
    note,
    createdAt: now,
    updatedAt: now,
  }
}

function createTenant(
  id: string,
  firstName: string,
  lastName: string,
  phone: string,
  email: string,
  idCardNo: string,
  address: string,
  now: string,
): Tenant {
  return {
    id,
    firstName,
    lastName,
    phone,
    email,
    idCardNo,
    address,
    emergencyContactName: `${firstName} Family`,
    emergencyContactPhone: '081-000-0000',
    note: '',
    createdAt: now,
    updatedAt: now,
  }
}

function createContract(
  id: string,
  roomId: string,
  tenantId: string,
  contractNo: string,
  startDate: string,
  endDate: string,
  monthlyRent: number,
  paymentDueDay: number,
  status: ContractStatus,
  now: string,
): Contract {
  return {
    id,
    roomId,
    tenantId,
    contractNo,
    startDate,
    endDate,
    monthlyRent,
    depositAmount: monthlyRent * 2,
    paymentDueDay,
    status,
    createdAt: now,
    updatedAt: now,
  }
}

function createBilling(input: {
  id: string
  roomId: string
  tenantId: string
  contractId: string
  billingMonth: string
  roomRent: number
  waterUnits: number
  waterRate: number
  electricUnits: number
  electricRate: number
  otherAmount: number
  dueDate: string
  status: BillingStatus
  now: string
}): Billing {
  const waterAmount = input.waterUnits * input.waterRate
  const electricAmount = input.electricUnits * input.electricRate

  return {
    id: input.id,
    roomId: input.roomId,
    tenantId: input.tenantId,
    contractId: input.contractId,
    billingMonth: input.billingMonth,
    roomRent: input.roomRent,
    waterUnits: input.waterUnits,
    waterRate: input.waterRate,
    waterAmount,
    electricUnits: input.electricUnits,
    electricRate: input.electricRate,
    electricAmount,
    otherAmount: input.otherAmount,
    totalAmount: input.roomRent + waterAmount + electricAmount + input.otherAmount,
    dueDate: input.dueDate,
    status: input.status,
    createdAt: input.now,
    updatedAt: input.now,
  }
}

function createPayment(input: {
  id: string
  billingId: string
  tenantId: string
  roomId: string
  paymentDate: string
  amount: number
  method: string
  referenceNo: string
  status: PaymentStatus
  note: string
  now: string
}): Payment {
  return {
    id: input.id,
    billingId: input.billingId,
    tenantId: input.tenantId,
    roomId: input.roomId,
    paymentDate: input.paymentDate,
    amount: input.amount,
    method: input.method,
    referenceNo: input.referenceNo,
    status: input.status,
    note: input.note,
    createdAt: input.now,
  }
}

function createMaintenance(
  id: string,
  roomId: string,
  title: string,
  description: string,
  priority: Maintenance['priority'],
  status: MaintenanceStatus,
  requestedDate: string,
  completedDate: string | null,
  cost: number,
  now: string,
): Maintenance {
  return {
    id,
    roomId,
    title,
    description,
    priority,
    status,
    requestedDate,
    completedDate,
    cost,
    note: '',
    createdAt: now,
    updatedAt: now,
  }
}

function createUser(
  id: string,
  username: string,
  fullName: string,
  role: UserRole,
  status: UserStatus,
  now: string,
): User {
  return {
    id,
    username,
    fullName,
    role,
    status,
    createdAt: now,
    updatedAt: now,
  }
}

export function createSeedDatabase(): AppDatabase {
  const now = dayjs().hour(8).minute(0).second(0).millisecond(0).toISOString()
  const billingMonth = dayjs().format('YYYY-MM')
  const dueDate = `${billingMonth}-05`

  const rooms: Room[] = [
    createRoom('room-101', '101', 1, 'Standard', OccupancyType.MONTHLY, 4800, RoomStatus.OCCUPIED, 128, 990, '', now),
    createRoom('room-102', '102', 1, 'Standard', OccupancyType.MONTHLY, 4900, RoomStatus.OCCUPIED, 121, 1025, '', now),
    createRoom('room-103', '103', 1, 'Standard', OccupancyType.MONTHLY, 5000, RoomStatus.RESERVED, 115, 1001, 'Reserved for move-in', now),
    createRoom('room-104', '104', 1, 'Standard', OccupancyType.DAILY, 5000, RoomStatus.AVAILABLE, 100, 952, '', now),
    createRoom('room-105', '105', 1, 'Standard', OccupancyType.DAILY, 5100, RoomStatus.MAINTENANCE, 98, 946, 'Air-condition repair', now),
    createRoom('room-106', '106', 1, 'Standard', OccupancyType.DAILY, 5100, RoomStatus.CLEANING, 97, 940, 'Deep cleaning in progress', now),
    createRoom('room-107', '107', 1, 'Standard', OccupancyType.MONTHLY, 5200, RoomStatus.OCCUPIED, 134, 1080, '', now),
    createRoom('room-108', '108', 1, 'Standard', OccupancyType.MONTHLY, 5200, RoomStatus.CHECKOUT_PENDING, 119, 1011, 'Waiting final inspection', now),
    createRoom('room-109', '109', 1, 'Standard', OccupancyType.DAILY, 5300, RoomStatus.UNAVAILABLE, 80, 921, 'Reserved by owner', now),
    createRoom('room-110', '110', 1, 'Standard', OccupancyType.DAILY, 5300, RoomStatus.AVAILABLE, 83, 930, '', now),
    createRoom('room-201', '201', 2, 'Deluxe', OccupancyType.MONTHLY, 5900, RoomStatus.OCCUPIED, 206, 1440, '', now),
    createRoom('room-202', '202', 2, 'Deluxe', OccupancyType.MONTHLY, 6000, RoomStatus.OCCUPIED, 203, 1462, '', now),
    createRoom('room-203', '203', 2, 'Deluxe', OccupancyType.MONTHLY, 6100, RoomStatus.RESERVED, 188, 1398, 'Reserved for April', now),
    createRoom('room-204', '204', 2, 'Deluxe', OccupancyType.DAILY, 6100, RoomStatus.AVAILABLE, 182, 1388, '', now),
    createRoom('room-205', '205', 2, 'Deluxe', OccupancyType.MONTHLY, 6200, RoomStatus.OCCUPIED, 211, 1522, '', now),
    createRoom('room-206', '206', 2, 'Deluxe', OccupancyType.MONTHLY, 6200, RoomStatus.OCCUPIED, 215, 1516, '', now),
    createRoom('room-207', '207', 2, 'Deluxe', OccupancyType.DAILY, 6300, RoomStatus.AVAILABLE, 170, 1360, '', now),
    createRoom('room-208', '208', 2, 'Deluxe', OccupancyType.MONTHLY, 6300, RoomStatus.OCCUPIED, 217, 1536, '', now),
    createRoom('room-209', '209', 2, 'Deluxe', OccupancyType.MONTHLY, 6400, RoomStatus.MAINTENANCE, 163, 1344, 'Water leak maintenance', now),
    createRoom('room-210', '210', 2, 'Deluxe', OccupancyType.DAILY, 6400, RoomStatus.AVAILABLE, 160, 1330, '', now),
  ]

  const tenants: Tenant[] = [
    createTenant('tenant-001', 'Narin', 'Chai', '081-112-3344', 'narin@example.com', '1100100010011', 'Bangna, Bangkok', now),
    createTenant('tenant-002', 'Ploy', 'Siri', '081-212-3344', 'ploy@example.com', '1100100010012', 'Ladprao, Bangkok', now),
    createTenant('tenant-003', 'Anan', 'Wong', '081-312-3344', 'anan@example.com', '1100100010013', 'Phayathai, Bangkok', now),
    createTenant('tenant-004', 'Mali', 'Rak', '081-412-3344', 'mali@example.com', '1100100010014', 'Rama 9, Bangkok', now),
    createTenant('tenant-005', 'Krit', 'Mee', '081-512-3344', 'krit@example.com', '1100100010015', 'Sukhumvit, Bangkok', now),
    createTenant('tenant-006', 'Pear', 'Tan', '081-612-3344', 'pear@example.com', '1100100010016', 'Sathorn, Bangkok', now),
    createTenant('tenant-007', 'Toon', 'Pra', '081-712-3344', 'toon@example.com', '1100100010017', 'Silom, Bangkok', now),
    createTenant('tenant-008', 'Mew', 'Krit', '081-812-3344', 'mew@example.com', '1100100010018', 'Onnut, Bangkok', now),
    createTenant('tenant-009', 'Palm', 'Nop', '081-912-3344', 'palm@example.com', '1100100010019', 'Ratchada, Bangkok', now),
    createTenant('tenant-010', 'Rin', 'Sopa', '082-012-3344', 'rin@example.com', '1100100010020', 'Samut Prakan', now),
    createTenant('tenant-011', 'Beam', 'Lita', '082-112-3344', 'beam@example.com', '1100100010021', 'Nakhon Pathom', now),
  ]

  const contracts: Contract[] = [
    createContract('contract-001', 'room-101', 'tenant-001', 'CT-2025-001', '2025-09-01', '2026-08-31', 4800, 5, ContractStatus.ACTIVE, now),
    createContract('contract-002', 'room-102', 'tenant-002', 'CT-2025-002', '2025-10-01', '2026-09-30', 4900, 5, ContractStatus.ACTIVE, now),
    createContract('contract-003', 'room-107', 'tenant-003', 'CT-2025-003', '2025-11-01', '2026-10-31', 5200, 5, ContractStatus.ACTIVE, now),
    createContract('contract-004', 'room-108', 'tenant-004', 'CT-2025-004', '2025-07-01', '2026-06-30', 5200, 5, ContractStatus.PENDING, now),
    createContract('contract-005', 'room-201', 'tenant-005', 'CT-2025-005', '2025-09-15', '2026-09-14', 5900, 5, ContractStatus.ACTIVE, now),
    createContract('contract-006', 'room-202', 'tenant-006', 'CT-2025-006', '2025-08-01', '2026-07-31', 6000, 5, ContractStatus.ACTIVE, now),
    createContract('contract-007', 'room-205', 'tenant-007', 'CT-2025-007', '2025-10-20', '2026-10-19', 6200, 5, ContractStatus.ACTIVE, now),
    createContract('contract-008', 'room-206', 'tenant-008', 'CT-2025-008', '2025-11-15', '2026-11-14', 6200, 5, ContractStatus.ACTIVE, now),
    createContract('contract-009', 'room-208', 'tenant-009', 'CT-2025-009', '2025-09-10', '2026-09-09', 6300, 5, ContractStatus.ACTIVE, now),
    createContract('contract-010', 'room-104', 'tenant-010', 'CT-2024-010', '2024-01-01', '2024-12-31', 5000, 5, ContractStatus.EXPIRED, now),
  ]

  const reservations: Reservation[] = [
    {
      id: 'reservation-001',
      roomId: 'room-103',
      tenantId: 'tenant-010',
      reservedDate: dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
      expectedMoveInDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
      status: ReservationStatus.CONFIRMED,
      remark: 'Customer paid booking fee',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'reservation-002',
      roomId: 'room-203',
      tenantId: 'tenant-011',
      reservedDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      expectedMoveInDate: dayjs().add(14, 'day').format('YYYY-MM-DD'),
      status: ReservationStatus.PENDING,
      remark: 'Waiting confirmation',
      createdAt: now,
      updatedAt: now,
    },
  ]

  const settings = defaultSettings(now)

  const billings: Billing[] = [
    createBilling({
      id: 'billing-001',
      roomId: 'room-101',
      tenantId: 'tenant-001',
      contractId: 'contract-001',
      billingMonth,
      roomRent: 4800,
      waterUnits: 9,
      waterRate: settings.waterRate,
      electricUnits: 125,
      electricRate: settings.electricRate,
      otherAmount: 100,
      dueDate,
      status: BillingStatus.PAID,
      now,
    }),
    createBilling({
      id: 'billing-002',
      roomId: 'room-102',
      tenantId: 'tenant-002',
      contractId: 'contract-002',
      billingMonth,
      roomRent: 4900,
      waterUnits: 8,
      waterRate: settings.waterRate,
      electricUnits: 110,
      electricRate: settings.electricRate,
      otherAmount: 120,
      dueDate,
      status: BillingStatus.UNPAID,
      now,
    }),
    createBilling({
      id: 'billing-003',
      roomId: 'room-107',
      tenantId: 'tenant-003',
      contractId: 'contract-003',
      billingMonth,
      roomRent: 5200,
      waterUnits: 10,
      waterRate: settings.waterRate,
      electricUnits: 132,
      electricRate: settings.electricRate,
      otherAmount: 80,
      dueDate,
      status: BillingStatus.PARTIALLY_PAID,
      now,
    }),
    createBilling({
      id: 'billing-004',
      roomId: 'room-108',
      tenantId: 'tenant-004',
      contractId: 'contract-004',
      billingMonth,
      roomRent: 5200,
      waterUnits: 9,
      waterRate: settings.waterRate,
      electricUnits: 118,
      electricRate: settings.electricRate,
      otherAmount: 0,
      dueDate: dayjs().subtract(8, 'day').format('YYYY-MM-DD'),
      status: BillingStatus.OVERDUE,
      now,
    }),
    createBilling({
      id: 'billing-005',
      roomId: 'room-201',
      tenantId: 'tenant-005',
      contractId: 'contract-005',
      billingMonth,
      roomRent: 5900,
      waterUnits: 11,
      waterRate: settings.waterRate,
      electricUnits: 160,
      electricRate: settings.electricRate,
      otherAmount: 150,
      dueDate,
      status: BillingStatus.PAID,
      now,
    }),
    createBilling({
      id: 'billing-006',
      roomId: 'room-202',
      tenantId: 'tenant-006',
      contractId: 'contract-006',
      billingMonth,
      roomRent: 6000,
      waterUnits: 12,
      waterRate: settings.waterRate,
      electricUnits: 170,
      electricRate: settings.electricRate,
      otherAmount: 200,
      dueDate,
      status: BillingStatus.PAID,
      now,
    }),
    createBilling({
      id: 'billing-007',
      roomId: 'room-205',
      tenantId: 'tenant-007',
      contractId: 'contract-007',
      billingMonth,
      roomRent: 6200,
      waterUnits: 10,
      waterRate: settings.waterRate,
      electricUnits: 166,
      electricRate: settings.electricRate,
      otherAmount: 100,
      dueDate,
      status: BillingStatus.UNPAID,
      now,
    }),
    createBilling({
      id: 'billing-008',
      roomId: 'room-206',
      tenantId: 'tenant-008',
      contractId: 'contract-008',
      billingMonth,
      roomRent: 6200,
      waterUnits: 9,
      waterRate: settings.waterRate,
      electricUnits: 162,
      electricRate: settings.electricRate,
      otherAmount: 0,
      dueDate,
      status: BillingStatus.PAID,
      now,
    }),
    createBilling({
      id: 'billing-009',
      roomId: 'room-208',
      tenantId: 'tenant-009',
      contractId: 'contract-009',
      billingMonth,
      roomRent: 6300,
      waterUnits: 8,
      waterRate: settings.waterRate,
      electricUnits: 175,
      electricRate: settings.electricRate,
      otherAmount: 250,
      dueDate,
      status: BillingStatus.PARTIALLY_PAID,
      now,
    }),
  ]

  const billingMap = new Map(billings.map((item) => [item.id, item]))

  const payments: Payment[] = [
    createPayment({
      id: 'payment-001',
      billingId: 'billing-001',
      tenantId: 'tenant-001',
      roomId: 'room-101',
      paymentDate: dayjs().date(3).format('YYYY-MM-DD'),
      amount: billingMap.get('billing-001')?.totalAmount ?? 0,
      method: 'PROMPTPAY',
      referenceNo: 'PPM240301001',
      status: PaymentStatus.SUCCESS,
      note: '',
      now,
    }),
    createPayment({
      id: 'payment-002',
      billingId: 'billing-003',
      tenantId: 'tenant-003',
      roomId: 'room-107',
      paymentDate: dayjs().date(4).format('YYYY-MM-DD'),
      amount: 3500,
      method: 'BANK_TRANSFER',
      referenceNo: 'TRF240304001',
      status: PaymentStatus.SUCCESS,
      note: 'First installment',
      now,
    }),
    createPayment({
      id: 'payment-003',
      billingId: 'billing-005',
      tenantId: 'tenant-005',
      roomId: 'room-201',
      paymentDate: dayjs().date(2).format('YYYY-MM-DD'),
      amount: billingMap.get('billing-005')?.totalAmount ?? 0,
      method: 'CASH',
      referenceNo: 'CSH240302001',
      status: PaymentStatus.SUCCESS,
      note: '',
      now,
    }),
    createPayment({
      id: 'payment-004',
      billingId: 'billing-006',
      tenantId: 'tenant-006',
      roomId: 'room-202',
      paymentDate: dayjs().date(5).format('YYYY-MM-DD'),
      amount: billingMap.get('billing-006')?.totalAmount ?? 0,
      method: 'PROMPTPAY',
      referenceNo: 'PPM240305001',
      status: PaymentStatus.SUCCESS,
      note: '',
      now,
    }),
    createPayment({
      id: 'payment-005',
      billingId: 'billing-008',
      tenantId: 'tenant-008',
      roomId: 'room-206',
      paymentDate: dayjs().date(5).format('YYYY-MM-DD'),
      amount: billingMap.get('billing-008')?.totalAmount ?? 0,
      method: 'BANK_TRANSFER',
      referenceNo: 'TRF240305002',
      status: PaymentStatus.SUCCESS,
      note: '',
      now,
    }),
    createPayment({
      id: 'payment-006',
      billingId: 'billing-009',
      tenantId: 'tenant-009',
      roomId: 'room-208',
      paymentDate: dayjs().date(6).format('YYYY-MM-DD'),
      amount: 3000,
      method: 'PROMPTPAY',
      referenceNo: 'PPM240306001',
      status: PaymentStatus.SUCCESS,
      note: 'Partial payment',
      now,
    }),
  ]

  const maintenances: Maintenance[] = [
    createMaintenance(
      'maintenance-001',
      'room-105',
      'Air-condition not cooling',
      'Inspect compressor and refill gas',
      'HIGH',
      MaintenanceStatus.IN_PROGRESS,
      dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
      null,
      0,
      now,
    ),
    createMaintenance(
      'maintenance-002',
      'room-209',
      'Water leak near sink',
      'Change valve and inspect pipeline',
      'URGENT',
      MaintenanceStatus.OPEN,
      dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      null,
      0,
      now,
    ),
    createMaintenance(
      'maintenance-003',
      'room-106',
      'Deep clean after move-out',
      'Full room sanitization',
      'MEDIUM',
      MaintenanceStatus.COMPLETED,
      dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
      dayjs().subtract(4, 'day').format('YYYY-MM-DD'),
      800,
      now,
    ),
  ]

  const users: User[] = [
    createUser('user-001', 'admin', 'System Admin', UserRole.ADMIN, UserStatus.ACTIVE, now),
    createUser('user-002', 'staff01', 'Front Desk Staff', UserRole.STAFF, UserStatus.ACTIVE, now),
    createUser('user-003', 'acc01', 'Accountant Team', UserRole.ACCOUNTANT, UserStatus.ACTIVE, now),
    createUser('user-004', 'staff02', 'Night Shift Staff', UserRole.STAFF, UserStatus.INACTIVE, now),
  ]

  return {
    rooms,
    tenants,
    reservations,
    contracts,
    billings,
    payments,
    maintenances,
    users,
    settings,
    meta: {
      version: 2,
      seededAt: now,
      updatedAt: now,
    },
  }
}
