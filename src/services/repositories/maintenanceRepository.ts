import type { Maintenance } from '../../types'
import { MaintenanceStatus, RoomStatus } from '../../types'
import { nowIso, todayIsoDate } from '../../utils/date'
import { createId } from '../../utils/id'
import { databaseRepository } from './databaseRepository'

export interface CreateMaintenanceInput {
  roomId: string
  title: string
  description?: string
  priority: Maintenance['priority']
  requestedDate?: string
  note?: string
}

export const maintenanceRepository = {
  getAll(): Maintenance[] {
    return [...databaseRepository.getSnapshot().maintenances].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  create(input: CreateMaintenanceInput): Maintenance | null {
    return databaseRepository.update((database) => {
      const room = database.rooms.find((item) => item.id === input.roomId)
      if (!room) {
        return null
      }

      const timestamp = nowIso()

      const maintenance: Maintenance = {
        id: createId('maintenance'),
        roomId: input.roomId,
        title: input.title.trim(),
        description: input.description?.trim() ?? '',
        priority: input.priority,
        status: MaintenanceStatus.OPEN,
        requestedDate: input.requestedDate ?? todayIsoDate(),
        completedDate: null,
        cost: 0,
        note: input.note?.trim() ?? '',
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      database.maintenances.push(maintenance)
      room.status = RoomStatus.MAINTENANCE
      room.updatedAt = timestamp

      return { ...maintenance }
    })
  },

  updateStatus(
    maintenanceId: string,
    status: Maintenance['status'],
    options?: { cost?: number; note?: string },
  ): Maintenance | null {
    return databaseRepository.update((database) => {
      const maintenance = database.maintenances.find((item) => item.id === maintenanceId)

      if (!maintenance) {
        return null
      }

      const timestamp = nowIso()
      maintenance.status = status
      maintenance.updatedAt = timestamp

      if (typeof options?.cost === 'number') {
        maintenance.cost = options.cost
      }

      if (typeof options?.note === 'string') {
        maintenance.note = options.note
      }

      if (status === MaintenanceStatus.COMPLETED) {
        maintenance.completedDate = todayIsoDate()
      }

      const room = database.rooms.find((item) => item.id === maintenance.roomId)
      if (room) {
        if (status === MaintenanceStatus.OPEN || status === MaintenanceStatus.IN_PROGRESS) {
          room.status = RoomStatus.MAINTENANCE
          room.updatedAt = timestamp
        }

        if (status === MaintenanceStatus.COMPLETED && room.status === RoomStatus.MAINTENANCE) {
          room.status = RoomStatus.CLEANING
          room.updatedAt = timestamp
        }

        if (status === MaintenanceStatus.CANCELLED && room.status === RoomStatus.MAINTENANCE) {
          room.status = RoomStatus.AVAILABLE
          room.updatedAt = timestamp
        }
      }

      return { ...maintenance }
    })
  },
}
