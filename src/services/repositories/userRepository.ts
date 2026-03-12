import type { User } from '../../types'
import { UserStatus } from '../../types'
import { nowIso } from '../../utils/date'
import { createId } from '../../utils/id'
import { databaseRepository } from './databaseRepository'

export interface CreateUserInput {
  username: string
  fullName: string
  role: User['role']
}

export const userRepository = {
  getAll(): User[] {
    return [...databaseRepository.getSnapshot().users].sort((a, b) => a.username.localeCompare(b.username))
  },

  create(input: CreateUserInput): User {
    const timestamp = nowIso()

    return databaseRepository.update((database) => {
      const user: User = {
        id: createId('user'),
        username: input.username.trim(),
        fullName: input.fullName.trim(),
        role: input.role,
        status: UserStatus.ACTIVE,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      database.users.push(user)
      return { ...user }
    })
  },

  updateRole(userId: string, role: User['role']): User | null {
    return databaseRepository.update((database) => {
      const user = database.users.find((item) => item.id === userId)
      if (!user) {
        return null
      }

      user.role = role
      user.updatedAt = nowIso()

      return { ...user }
    })
  },

  toggleStatus(userId: string): User | null {
    return databaseRepository.update((database) => {
      const user = database.users.find((item) => item.id === userId)
      if (!user) {
        return null
      }

      user.status = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE
      user.updatedAt = nowIso()

      return { ...user }
    })
  },
}
