import dayjs from 'dayjs'
import type { Payment } from '../../types'
import { BillingStatus, PaymentStatus } from '../../types'
import { nowIso, todayIsoDate } from '../../utils/date'
import { createId } from '../../utils/id'
import { databaseRepository } from './databaseRepository'

export interface CreatePaymentInput {
  billingId: string
  paymentDate?: string
  amount: number
  method: string
  referenceNo?: string
  status?: Payment['status']
  note?: string
}

function resolveBillingStatus(totalAmount: number, paidAmount: number, dueDate: string): BillingStatus {
  if (paidAmount >= totalAmount) {
    return BillingStatus.PAID
  }

  if (paidAmount > 0) {
    return BillingStatus.PARTIALLY_PAID
  }

  if (dayjs(dueDate).isBefore(dayjs(), 'day')) {
    return BillingStatus.OVERDUE
  }

  return BillingStatus.UNPAID
}

export const paymentRepository = {
  getAll(): Payment[] {
    return [...databaseRepository.getSnapshot().payments].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
  },

  create(input: CreatePaymentInput): Payment | null {
    return databaseRepository.update((database) => {
      const billing = database.billings.find((item) => item.id === input.billingId)

      if (!billing) {
        return null
      }

      const timestamp = nowIso()
      const status = input.status ?? PaymentStatus.SUCCESS
      const payment: Payment = {
        id: createId('payment'),
        billingId: input.billingId,
        tenantId: billing.tenantId,
        roomId: billing.roomId,
        paymentDate: input.paymentDate ?? todayIsoDate(),
        amount: input.amount,
        method: input.method,
        referenceNo: input.referenceNo?.trim() ?? '',
        status,
        note: input.note?.trim() ?? '',
        createdAt: timestamp,
      }

      database.payments.push(payment)

      const paidAmount = database.payments
        .filter((item) => item.billingId === billing.id && item.status === PaymentStatus.SUCCESS)
        .reduce((total, item) => total + item.amount, 0)

      billing.status = resolveBillingStatus(billing.totalAmount, paidAmount, billing.dueDate)
      billing.updatedAt = timestamp

      return { ...payment }
    })
  },
}
