import { createSeedDatabase } from '../../data/seedDatabase'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import { OccupancyType, type AppDatabase } from '../../types'
import { nowIso } from '../../utils/date'
import { storageService } from '../storage/storageService'

const DATABASE_VERSION = 2

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

  if (database.meta.version === 1) {
    return {
      ...database,
      rooms: database.rooms.map((room) => ({
        ...room,
        occupancyType: room.occupancyType ?? OccupancyType.MONTHLY,
      })),
      meta: {
        ...database.meta,
        version: DATABASE_VERSION,
        updatedAt: timestamp,
      },
    }
  }

  return {
    ...database,
    meta: {
      ...database.meta,
      version: DATABASE_VERSION,
      updatedAt: timestamp,
    },
  }
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
