import type { GrowthStatus } from '../types'

export const DOT: Record<GrowthStatus, string> = {
  'Ditanam': 'bg-stone-400', 'Belum Berkecambah': 'bg-amber-400', 'Mulai Berkecambah': 'bg-lime-400',
  'Sudah Berkecambah': 'bg-green-500', 'Tumbuh Menjadi Bibit': 'bg-emerald-700',
  'Tidak Berkembang': 'bg-red-500', 'Perlu Diperiksa': 'bg-orange-500',
}
export const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
export const fmtDateTime = (s: string) =>
  new Date(s).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
export const nowLocalInput = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
export const todayInput = () => nowLocalInput().slice(0, 10)

/** Validasi + perkecil foto (maks 1280px, JPEG 80%) sebelum disimpan ke IndexedDB. */
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar (JPG, PNG, atau WebP).')
  if (file.size > 15 * 1024 * 1024) throw new Error('Ukuran foto maksimal 15 MB.')
  try {
    const bmp = await createImageBitmap(file)
    const s = Math.min(1, 1280 / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * s)
    c.height = Math.round(bmp.height * s)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error())), 'image/jpeg', 0.8))
  } catch {
    throw new Error('Foto tidak dapat diproses. Coba foto atau format lain.')
  }
}
