import type { AppSettings } from '../../types'
import { nowIso } from '../../utils/date'
import { databaseRepository } from './databaseRepository'

export const settingsRepository = {
  get(): AppSettings {
    return databaseRepository.getSnapshot().settings
  },

  update(updates: Partial<Omit<AppSettings, 'updatedAt'>>): AppSettings {
    return databaseRepository.update((database) => {
      Object.assign(database.settings, updates, { updatedAt: nowIso() })
      return { ...database.settings }
    })
  },
}
