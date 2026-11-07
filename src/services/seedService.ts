import { db } from '../database/db'
import type { GrowthStatus, Observation, SeedGroup } from '../types'

const now = () => new Date().toISOString()

export async function groupsWithStatus(archived: 0 | 1) {
  const [gs, obs] = await Promise.all([db.seed_groups.where('archived').equals(archived).toArray(), db.observations.toArray()])
  const latest = new Map<number, Observation>()
  for (const o of obs) {
    const c = latest.get(o.seed_group_id)
    if (!c || o.observation_date > c.observation_date) latest.set(o.seed_group_id, o)
  }
  return gs
    .map((g) => ({ ...g, status: (latest.get(g.id!)?.growth_status ?? 'Ditanam') as GrowthStatus }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}
export type GroupView = Awaited<ReturnType<typeof groupsWithStatus>>[number]

export async function groupStatus(id: number): Promise<GrowthStatus> {
  const o = await db.observations.where('seed_group_id').equals(id).sortBy('observation_date')
  return o.length ? o[o.length - 1].growth_status : 'Ditanam'
}

const isCodeTaken = async (code: string, exceptId?: number) => {
  const g = await db.seed_groups.where('group_code').equals(code).first()
  return !!g && g.id !== exceptId
}
export async function nextCode() {
  let i = (await db.seed_groups.count()) + 1
  while (await isCodeTaken('ALP-' + String(i).padStart(3, '0'))) i++
  return 'ALP-' + String(i).padStart(3, '0')
}

export type GroupInput = Pick<SeedGroup, 'group_code' | 'group_name' | 'planting_date' | 'seed_count' | 'planting_medium' | 'location' | 'notes'>

/** photo: undefined = tidak diubah, null = hapus, Blob = ganti. */
export function saveGroup(data: GroupInput, id?: number, photo?: Blob | null) {
  return db.transaction('rw', db.seed_groups, db.photos, async () => {
    if (await isCodeTaken(data.group_code, id)) throw new Error('Kode kelompok sudah dipakai kelompok lain.')
    const t = now()
    let gid = id
    if (id) await db.seed_groups.update(id, { ...data, updated_at: t })
    else gid = await db.seed_groups.add({ ...data, archived: 0, created_at: t, updated_at: t })
    if (photo !== undefined) {
      const g = (await db.seed_groups.get(gid!))!
      if (g.cover_photo_id) await db.photos.delete(g.cover_photo_id)
      const pid = photo ? await db.photos.add({ seed_group_id: gid!, image_blob: photo, caption: 'Foto kelompok', created_at: t }) : undefined
      await db.seed_groups.update(gid!, { cover_photo_id: pid })
    }
    return gid!
  })
}

export const setArchived = (id: number, flag: 0 | 1) => db.seed_groups.update(id, { archived: flag, updated_at: now() })

export async function relatedCount(id: number) {
  return {
    obs: await db.observations.where('seed_group_id').equals(id).count(),
    photos: await db.photos.where('seed_group_id').equals(id).count(),
  }
}
export function deleteGroup(id: number) {
  return db.transaction('rw', db.seed_groups, db.observations, db.photos, async () => {
    await db.photos.where('seed_group_id').equals(id).delete()
    await db.observations.where('seed_group_id').equals(id).delete()
    await db.seed_groups.delete(id)
  })
}

export type ObsInput = Pick<Observation, 'seed_group_id' | 'observation_date' | 'growth_status' | 'plant_condition' | 'height' | 'notes'>

export function saveObservation(data: ObsInput, id?: number, photo?: Blob | null) {
  return db.transaction('rw', db.observations, db.photos, async () => {
    const t = now()
    let oid = id
    if (id) await db.observations.update(id, { ...data, updated_at: t })
    else oid = await db.observations.add({ ...data, created_at: t, updated_at: t })
    if (photo !== undefined) {
      await db.photos.where('observation_id').equals(oid!).delete()
      if (photo) await db.photos.add({ seed_group_id: data.seed_group_id, observation_id: oid!, image_blob: photo, caption: 'Foto pengamatan', created_at: t })
    }
    return oid!
  })
}
export function deleteObservation(id: number) {
  return db.transaction('rw', db.observations, db.photos, async () => {
    await db.photos.where('observation_id').equals(id).delete()
    await db.observations.delete(id)
  })
}

const toDataUrl = (b: Blob) => new Promise<string>((res, rej) => {
  const r = new FileReader()
  r.onload = () => res(r.result as string)
  r.onerror = () => rej(r.error)
  r.readAsDataURL(b)
})

/** Cadangan JSON (foto sebagai data URL). Data akun tidak disertakan. */
export async function exportBackup() {
  const photos = await Promise.all((await db.photos.toArray()).map(async (p) => ({ ...p, image_blob: await toDataUrl(p.image_blob) })))
  return JSON.stringify({
    app: 'SEEDLOG', exported_at: now(),
    seed_groups: await db.seed_groups.toArray(), observations: await db.observations.toArray(), photos,
  })
}
