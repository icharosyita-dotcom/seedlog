export const STATUSES = [
  'Ditanam', 'Belum Berkecambah', 'Mulai Berkecambah', 'Sudah Berkecambah',
  'Tumbuh Menjadi Bibit', 'Tidak Berkembang', 'Perlu Diperiksa',
] as const
export type GrowthStatus = (typeof STATUSES)[number]

export interface User { id?: number; name: string; username: string; salt: string; hash: string; created_at: string }
export interface SeedGroup {
  id?: number; group_code: string; group_name: string; planting_date: string; seed_count: number
  planting_medium: string; location: string; notes: string; cover_photo_id?: number
  archived: 0 | 1; created_at: string; updated_at: string
}
export interface Observation {
  id?: number; seed_group_id: number; observation_date: string; growth_status: GrowthStatus
  plant_condition: string; height?: number; notes: string; created_at: string; updated_at: string
}
export interface Photo { id?: number; seed_group_id: number; observation_id?: number; image_blob: Blob; caption: string; created_at: string }
