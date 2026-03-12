import type { Contract, Reservation } from '../../types'
import { ContractStatus, ReservationStatus, RoomStatus } from '../../types'
import { addYears, nowIso, todayIsoDate } from '../../utils/date'
import { createId } from '../../utils/id'
import { databaseRepository } from './databaseRepository'

export interface CreateReservationInput {
  roomId: string
  tenantId: string
  expectedMoveInDate: string
  reservedDate?: string
  remark?: string
  status?: Reservation['status']
}

export interface ConvertReservationInput {
  startDate?: string
  endDate?: string
  paymentDueDay?: number
}

function createContractNo(contractCount: number): string {
  const sequence = String(contractCount + 1).padStart(3, '0')
  const monthStamp = new Date().toISOString().slice(0, 7).replace('-', '')
  return `CT-${monthStamp}-${sequence}`
}

export const reservationRepository = {
  getAll(): Reservation[] {
    return [...databaseRepository.getSnapshot().reservations].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    )
  },

  create(input: CreateReservationInput): Reservation | null {
    const timestamp = nowIso()

    return databaseRepository.update((database) => {
      const room = database.rooms.find((item) => item.id === input.roomId)
      const tenantExists = database.tenants.some((item) => item.id === input.tenantId)

      if (!room || !tenantExists) {
        return null
      }

      const reservation: Reservation = {
        id: createId('reservation'),
        roomId: input.roomId,
        tenantId: input.tenantId,
        reservedDate: input.reservedDate ?? todayIsoDate(),
        expectedMoveInDate: input.expectedMoveInDate,
        status: input.status ?? ReservationStatus.PENDING,
        remark: input.remark?.trim() ?? '',
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      database.reservations.push(reservation)
      room.status = RoomStatus.RESERVED
      room.updatedAt = timestamp

      return { ...reservation }
    })
  },

  updateStatus(reservationId: string, status: Reservation['status']): Reservation | null {
    return databaseRepository.update((database) => {
      const reservation = database.reservations.find((item) => item.id === reservationId)

      if (!reservation) {
        return null
      }

      reservation.status = status
      reservation.updatedAt = nowIso()

      return { ...reservation }
    })
  },

  cancel(reservationId: string): Reservation | null {
    return databaseRepository.update((database) => {
      const reservation = database.reservations.find((item) => item.id === reservationId)

      if (!reservation) {
        return null
      }

      reservation.status = ReservationStatus.CANCELLED
      reservation.updatedAt = nowIso()

      const room = database.rooms.find((item) => item.id === reservation.roomId)
      if (room && room.status === RoomStatus.RESERVED) {
        room.status = RoomStatus.AVAILABLE
        room.updatedAt = reservation.updatedAt
      }

      return { ...reservation }
    })
  },

  convertToContract(
    reservationId: string,
    input: ConvertReservationInput = {},
  ): { reservation: Reservation; contract: Contract } | null {
    const startDate = input.startDate ?? todayIsoDate()
    const endDate = input.endDate ?? addYears(startDate, 1)
    const paymentDueDay = input.paymentDueDay ?? 5

    return databaseRepository.update((database) => {
      const reservation = database.reservations.find((item) => item.id === reservationId)

      if (!reservation || reservation.status === ReservationStatus.CANCELLED) {
        return null
      }

      const room = database.rooms.find((item) => item.id === reservation.roomId)
      const tenant = database.tenants.find((item) => item.id === reservation.tenantId)

      if (!room || !tenant) {
        return null
      }

      const timestamp = nowIso()
      const contract: Contract = {
        id: createId('contract'),
        roomId: room.id,
        tenantId: tenant.id,
        contractNo: createContractNo(database.contracts.length),
        startDate,
        endDate,
        occupancyType: room.occupancyType,
        monthlyRent: room.monthlyRent,
        depositAmount: room.depositAmount,
        paymentDueDay,
        status: ContractStatus.ACTIVE,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      database.contracts.push(contract)

      reservation.status = ReservationStatus.CONVERTED
      reservation.updatedAt = timestamp

      room.status = RoomStatus.OCCUPIED
      room.updatedAt = timestamp

      return {
        reservation: { ...reservation },
        contract: { ...contract },
      }
    })
  },
}
