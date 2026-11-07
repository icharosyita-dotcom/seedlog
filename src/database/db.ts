import Dexie, { type Table } from 'dexie'
import type { Observation, Photo, SeedGroup, User } from '../types'

class SeedlogDB extends Dexie {
  users!: Table<User, number>
  seed_groups!: Table<SeedGroup, number>
  observations!: Table<Observation, number>
  photos!: Table<Photo, number>
  constructor() {
    super('seedlog')
    this.version(1).stores({
      users: '++id, &username',
      seed_groups: '++id, &group_code, archived, planting_date',
      observations: '++id, seed_group_id, observation_date',
      photos: '++id, seed_group_id, observation_id',
    })
  }
}
export const db = new SeedlogDB()
