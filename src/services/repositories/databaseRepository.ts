import { createSeedDatabase } from '../../data/seedDatabase'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import { ContractStatus, OccupancyType, type AppDatabase } from '../../types'
import { nowIso } from '../../utils/date'
import { storageService } from '../storage/storageService'

const DATABASE_VERSION = 4

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function isValidDatabase(value: unknown): value is AppDatabase {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as AppDatabase

  return (
    Array.isArray(candidate.rooms) &&
    Array.isArray(candidate.tenants) &&
    Array.isArray(candidate.reservations) &&
    Array.isArray(candidate.contracts) &&
    Array.isArray(candidate.billings) &&
    Array.isArray(candidate.payments) &&
    Array.isArray(candidate.maintenances) &&
    Array.isArray(candidate.users) &&
    typeof candidate.settings === 'object' &&
    candidate.settings !== null &&
    typeof candidate.meta?.version === 'number'
  )
}

function seedAndPersist(): AppDatabase {
  const seed = createSeedDatabase()
  storageService.setItem(STORAGE_KEYS.APP_DATABASE, seed)
  return seed
}

function migrateDatabase(database: AppDatabase): AppDatabase {
  if (database.meta.version >= DATABASE_VERSION) {
    return database
  }

  const timestamp = nowIso()
  let nextDatabase = database

  if (nextDatabase.meta.version < 2) {
    nextDatabase = {
      ...nextDatabase,
      rooms: nextDatabase.rooms.map((room) => ({
        ...room,
        occupancyType: room.occupancyType ?? OccupancyType.MONTHLY,
      })),
      meta: {
        ...nextDatabase.meta,
        version: 2,
        updatedAt: timestamp,
      },
    }
  }

  if (nextDatabase.meta.version < 3) {
    const roomOccupancyTypeMap = new Map(
      nextDatabase.rooms.map((room) => [room.id, room.occupancyType ?? OccupancyType.MONTHLY]),
    )

    nextDatabase = {
      ...nextDatabase,
      contracts: nextDatabase.contracts.map((contract) => ({
        ...contract,
        occupancyType:
          contract.occupancyType ??
          roomOccupancyTypeMap.get(contract.roomId) ??
          OccupancyType.MONTHLY,
      })),
      meta: {
        ...nextDatabase.meta,
        version: 3,
        updatedAt: timestamp,
      },
    }
  }

  if (nextDatabase.meta.version < 4) {
    const latestActiveContractByRoom = new Map<string, (typeof nextDatabase.contracts)[number]>()
    const sortedContracts = [...nextDatabase.contracts].sort((a, b) =>
      b.startDate.localeCompare(a.startDate) || b.createdAt.localeCompare(a.createdAt),
    )

    sortedContracts.forEach((contract) => {
      if (contract.status !== ContractStatus.ACTIVE && contract.status !== ContractStatus.PENDING) {
        return
      }

      if (!latestActiveContractByRoom.has(contract.roomId)) {
        latestActiveContractByRoom.set(contract.roomId, contract)
      }
    })

    nextDatabase = {
      ...nextDatabase,
      rooms: nextDatabase.rooms.map((room) => {
        const contract = latestActiveContractByRoom.get(room.id)

        if (!contract) {
          return room
        }

        return {
          ...room,
          occupancyType: contract.occupancyType ?? room.occupancyType ?? OccupancyType.MONTHLY,
        }
      }),
      meta: {
        ...nextDatabase.meta,
        version: 4,
        updatedAt: timestamp,
      },
    }
  }

  return nextDatabase
}

function readRawDatabase(): AppDatabase {
  const saved = storageService.getItem<AppDatabase>(STORAGE_KEYS.APP_DATABASE)

  if (!isValidDatabase(saved)) {
    return seedAndPersist()
  }

  if (saved.meta.version > DATABASE_VERSION) {
    return saved
  }

  const migrated = migrateDatabase(saved)

  if (migrated.meta.version !== saved.meta.version) {
    storageService.setItem(STORAGE_KEYS.APP_DATABASE, migrated)
  }

  return migrated
}

export const databaseRepository = {
  ensureSeeded(): AppDatabase {
    return deepClone(readRawDatabase())
  },

  getSnapshot(): AppDatabase {
    return deepClone(readRawDatabase())
  },

  update<T>(updater: (database: AppDatabase) => T): T {
    const nextDatabase = deepClone(readRawDatabase())
    const result = updater(nextDatabase)
    nextDatabase.meta.updatedAt = nowIso()
    storageService.setItem(STORAGE_KEYS.APP_DATABASE, nextDatabase)

    return result
  },

  reset(): AppDatabase {
    return deepClone(seedAndPersist())
  },
}
