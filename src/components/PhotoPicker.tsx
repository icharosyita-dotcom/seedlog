import { useState, type ChangeEvent } from 'react'
import { Camera, Image as ImageIcon } from 'lucide-react'
import { useBlobUrl } from '../hooks/useBlobUrl'
import { compressImage } from '../utils'

interface Props {
  existing?: Blob | null
  /** undefined = tidak diubah, null = dihapus, Blob = foto baru */
  value: Blob | null | undefined
  onChange: (b: Blob | null) => void
}

export default function PhotoPicker({ existing, value, onChange }: Props) {
  const url = useBlobUrl(value === undefined ? existing : value)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setErr(''); setBusy(true)
    try { onChange(await compressImage(file)) } catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }
  return (
    <div>
      <div className="aspect-[4/3] rounded-3xl bg-mist overflow-hidden grid place-items-center">
        {url ? <img src={url} alt="Pratinjau foto" className="h-full w-full object-cover" /> : <span className="text-sm text-forest/60">Belum ada foto</span>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="btn btn-p cursor-pointer focus-within:outline focus-within:outline-2">
          <Camera size={18} />{url ? 'Ganti (kamera)' : 'Ambil foto'}
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={pick} />
        </label>
        <label className="btn btn-s cursor-pointer focus-within:outline focus-within:outline-2">
          <ImageIcon size={18} />Dari galeri
          <input type="file" accept="image/*" className="sr-only" onChange={pick} />
        </label>
      </div>
      {url && <button type="button" className="btn btn-d mt-2 w-full" onClick={() => onChange(null)}>Hapus foto</button>}
      {busy && <p className="mt-2 text-sm text-forest">Memproses foto…</p>}
      {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
    </div>
  )
}
