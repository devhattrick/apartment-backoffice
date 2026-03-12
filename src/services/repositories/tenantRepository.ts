import type { Tenant } from '../../types'
import { createId } from '../../utils/id'
import { nowIso } from '../../utils/date'
import { databaseRepository } from './databaseRepository'

export interface CreateTenantInput {
  firstName: string
  lastName: string
  phone: string
  email: string
  idCardNo?: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  note?: string
}

export const tenantRepository = {
  getAll(): Tenant[] {
    return [...databaseRepository.getSnapshot().tenants].sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    )
  },

  getById(tenantId: string): Tenant | null {
    return databaseRepository.getSnapshot().tenants.find((tenant) => tenant.id === tenantId) ?? null
  },

  create(input: CreateTenantInput): Tenant {
    const timestamp = nowIso()

    return databaseRepository.update((database) => {
      const tenant: Tenant = {
        id: createId('tenant'),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
        email: input.email.trim(),
        idCardNo: input.idCardNo?.trim() ?? '',
        address: input.address?.trim() ?? '',
        emergencyContactName: input.emergencyContactName?.trim() ?? '',
        emergencyContactPhone: input.emergencyContactPhone?.trim() ?? '',
        note: input.note?.trim() ?? '',
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      database.tenants.push(tenant)

      return { ...tenant }
    })
  },

  update(tenantId: string, updates: Partial<Omit<Tenant, 'id' | 'createdAt'>>): Tenant | null {
    return databaseRepository.update((database) => {
      const tenant = database.tenants.find((item) => item.id === tenantId)

      if (!tenant) {
        return null
      }

      Object.assign(tenant, updates, { updatedAt: nowIso() })

      return { ...tenant }
    })
  },
}
