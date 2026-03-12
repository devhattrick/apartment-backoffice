import type { Billing } from '../../types'
import { BillingStatus } from '../../types'
import { monthKey, nowIso, todayIsoDate } from '../../utils/date'
import { createId } from '../../utils/id'
import { databaseRepository } from './databaseRepository'

export interface CreateBillingInput {
  contractId: string
  billingMonth?: string
  roomRent?: number
  waterUnits: number
  waterRate?: number
  electricUnits: number
  electricRate?: number
  otherAmount?: number
  dueDate?: string
}

function calculateTotalAmount(
  roomRent: number,
  waterUnits: number,
  waterRate: number,
  electricUnits: number,
  electricRate: number,
  otherAmount: number,
): number {
  return roomRent + waterUnits * waterRate + electricUnits * electricRate + otherAmount
}

export const billingRepository = {
  getAll(): Billing[] {
    return [...databaseRepository.getSnapshot().billings].sort((a, b) => b.billingMonth.localeCompare(a.billingMonth))
  },

  getById(billingId: string): Billing | null {
    return databaseRepository.getSnapshot().billings.find((item) => item.id === billingId) ?? null
  },

  create(input: CreateBillingInput): Billing | null {
    return databaseRepository.update((database) => {
      const contract = database.contracts.find((item) => item.id === input.contractId)

      if (!contract) {
        return null
      }

      const room = database.rooms.find((item) => item.id === contract.roomId)
      if (!room) {
        return null
      }

      const timestamp = nowIso()
      const waterRate = input.waterRate ?? database.settings.waterRate
      const electricRate = input.electricRate ?? database.settings.electricRate
      const roomRent = input.roomRent ?? contract.monthlyRent
      const otherAmount = input.otherAmount ?? 0
      const billingMonth = input.billingMonth ?? monthKey()
      const dueDate = input.dueDate ?? todayIsoDate()
      const waterAmount = input.waterUnits * waterRate
      const electricAmount = input.electricUnits * electricRate

      const billing: Billing = {
        id: createId('billing'),
        roomId: contract.roomId,
        tenantId: contract.tenantId,
        contractId: contract.id,
        billingMonth,
        roomRent,
        waterUnits: input.waterUnits,
        waterRate,
        waterAmount,
        electricUnits: input.electricUnits,
        electricRate,
        electricAmount,
        otherAmount,
        totalAmount: calculateTotalAmount(
          roomRent,
          input.waterUnits,
          waterRate,
          input.electricUnits,
          electricRate,
          otherAmount,
        ),
        dueDate,
        status: BillingStatus.UNPAID,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      database.billings.push(billing)

      room.waterMeterLatest += input.waterUnits
      room.electricMeterLatest += input.electricUnits
      room.updatedAt = timestamp

      return { ...billing }
    })
  },

  updateStatus(billingId: string, status: Billing['status']): Billing | null {
    return databaseRepository.update((database) => {
      const billing = database.billings.find((item) => item.id === billingId)

      if (!billing) {
        return null
      }

      billing.status = status
      billing.updatedAt = nowIso()

      return { ...billing }
    })
  },

  markOverdue(billingId: string): Billing | null {
    return billingRepository.updateStatus(billingId, BillingStatus.OVERDUE)
  },
}
