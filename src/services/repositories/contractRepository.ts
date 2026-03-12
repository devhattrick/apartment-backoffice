import type { Contract } from '../../types'
import { ContractStatus, RoomStatus } from '../../types'
import { addYears, nowIso, todayIsoDate } from '../../utils/date'
import { createId } from '../../utils/id'
import { databaseRepository } from './databaseRepository'

export interface CreateContractInput {
  roomId: string
  tenantId: string
  startDate?: string
  endDate?: string
  monthlyRent?: number
  depositAmount?: number
  paymentDueDay: number
  status?: Contract['status']
}

function createContractNo(contractCount: number): string {
  const sequence = String(contractCount + 1).padStart(3, '0')
  const monthStamp = new Date().toISOString().slice(0, 7).replace('-', '')
  return `CT-${monthStamp}-${sequence}`
}

function resolveRoomStatus(contractStatus: Contract['status']): RoomStatus | null {
  if (contractStatus === ContractStatus.ACTIVE) {
    return RoomStatus.OCCUPIED
  }

  if (contractStatus === ContractStatus.PENDING) {
    return RoomStatus.RESERVED
  }

  return null
}

export const contractRepository = {
  getAll(): Contract[] {
    return [...databaseRepository.getSnapshot().contracts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  getById(contractId: string): Contract | null {
    return databaseRepository.getSnapshot().contracts.find((item) => item.id === contractId) ?? null
  },

  create(input: CreateContractInput): Contract | null {
    const startDate = input.startDate ?? todayIsoDate()
    const endDate = input.endDate ?? addYears(startDate, 1)
    const status = input.status ?? ContractStatus.ACTIVE

    return databaseRepository.update((database) => {
      const room = database.rooms.find((item) => item.id === input.roomId)
      const tenant = database.tenants.find((item) => item.id === input.tenantId)

      if (!room || !tenant) {
        return null
      }

      const timestamp = nowIso()

      const contract: Contract = {
        id: createId('contract'),
        roomId: input.roomId,
        tenantId: input.tenantId,
        contractNo: createContractNo(database.contracts.length),
        startDate,
        endDate,
        monthlyRent: input.monthlyRent ?? room.monthlyRent,
        depositAmount: input.depositAmount ?? room.depositAmount,
        paymentDueDay: input.paymentDueDay,
        status,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      database.contracts.push(contract)

      const nextRoomStatus = resolveRoomStatus(status)
      if (nextRoomStatus) {
        room.status = nextRoomStatus
        room.updatedAt = timestamp
      }

      return { ...contract }
    })
  },

  renew(contractId: string, newEndDate: string): Contract | null {
    return databaseRepository.update((database) => {
      const contract = database.contracts.find((item) => item.id === contractId)

      if (!contract) {
        return null
      }

      contract.endDate = newEndDate
      contract.status = ContractStatus.ACTIVE
      contract.updatedAt = nowIso()

      return { ...contract }
    })
  },

  terminate(contractId: string): Contract | null {
    return databaseRepository.update((database) => {
      const contract = database.contracts.find((item) => item.id === contractId)

      if (!contract) {
        return null
      }

      const timestamp = nowIso()
      contract.status = ContractStatus.TERMINATED
      contract.updatedAt = timestamp

      const room = database.rooms.find((item) => item.id === contract.roomId)
      if (room && room.status === RoomStatus.OCCUPIED) {
        room.status = RoomStatus.CHECKOUT_PENDING
        room.updatedAt = timestamp
      }

      return { ...contract }
    })
  },
}
