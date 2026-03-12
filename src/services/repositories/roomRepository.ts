import type { Room, RoomStatus } from '../../types'
import { nowIso } from '../../utils/date'
import { databaseRepository } from './databaseRepository'

function sortRooms(rooms: Room[]): Room[] {
  return [...rooms].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }))
}

export const roomRepository = {
  getAll(): Room[] {
    return sortRooms(databaseRepository.getSnapshot().rooms)
  },

  getById(roomId: string): Room | null {
    return databaseRepository.getSnapshot().rooms.find((room) => room.id === roomId) ?? null
  },

  updateStatus(roomId: string, status: RoomStatus): Room | null {
    return databaseRepository.update((database) => {
      const room = database.rooms.find((item) => item.id === roomId)

      if (!room) {
        return null
      }

      room.status = status
      room.updatedAt = nowIso()

      return { ...room }
    })
  },

  updateMeters(roomId: string, waterMeterLatest: number, electricMeterLatest: number): Room | null {
    return databaseRepository.update((database) => {
      const room = database.rooms.find((item) => item.id === roomId)

      if (!room) {
        return null
      }

      room.waterMeterLatest = waterMeterLatest
      room.electricMeterLatest = electricMeterLatest
      room.updatedAt = nowIso()

      return { ...room }
    })
  },

  save(roomId: string, updates: Partial<Omit<Room, 'id' | 'createdAt'>>): Room | null {
    return databaseRepository.update((database) => {
      const room = database.rooms.find((item) => item.id === roomId)

      if (!room) {
        return null
      }

      Object.assign(room, updates, { updatedAt: nowIso() })

      return { ...room }
    })
  },
}
