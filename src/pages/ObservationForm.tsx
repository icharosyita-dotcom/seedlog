import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../database/db'
import { saveObservation } from '../services/seedService'
import { STATUSES, type GrowthStatus } from '../types'
import { Empty, Field, PageTitle } from '../components/ui'
import PhotoPicker from '../components/PhotoPicker'
import { nowLocalInput } from '../utils'

export default function ObservationForm() {
  const id = Number(useParams().id) || undefined
  const preset = Number(useSearchParams()[0].get('kelompok')) || 0
  const nav = useNavigate()
  const groups = useLiveQuery(() => db.seed_groups.where('archived').equals(0).toArray(), [])
  const [f, setF] = useState({ gid: preset ? String(preset) : '', date: nowLocalInput(), status: 'Ditanam' as GrowthStatus, cond: '', height: '', notes: '' })
  const [photo, setPhoto] = useState<Blob | null | undefined>()
  const [existing, setExisting] = useState<Blob | null>()
  const [err, setErr] = useState('')
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  useEffect(() => {
    if (!id) return
    (async () => {
      const o = await db.observations.get(id)
      if (!o) return nav('/riwayat', { replace: true })
      setF({ gid: String(o.seed_group_id), date: o.observation_date, status: o.growth_status, cond: o.plant_condition, height: o.height == null ? '' : String(o.height), notes: o.notes })
      setExisting((await db.photos.where('observation_id').equals(id).first())?.image_blob ?? null)
    })()
  }, [id, nav])

  if (!groups) return null
  if (!groups.length && !id) return <Empty text="Buat kelompok benih dulu sebelum mencatat pengamatan."><Link to="/kelompok/baru" className="btn btn-p">Tambah kelompok</Link></Empty>

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr('')
    const h = f.height.trim() === '' ? undefined : Number(f.height)
    if (!f.gid) return setErr('Pilih kelompok benih.')
    if (!f.date) return setErr('Tanggal dan waktu wajib diisi.')
    if (h !== undefined && (!Number.isFinite(h) || h < 0 || h > 300)) return setErr('Tinggi harus antara 0 dan 300 cm.')
    try {
      await saveObservation({ seed_group_id: Number(f.gid), observation_date: f.date, growth_status: f.status, plant_condition: f.cond.trim(), height: h, notes: f.notes.trim() }, id, photo)
      nav(`/kelompok/${f.gid}`, { replace: true })
    } catch { setErr('Pengamatan gagal disimpan. Periksa ruang penyimpanan perangkat lalu coba lagi.') }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <PageTitle>{id ? 'Ubah pengamatan' : 'Pengamatan baru'}</PageTitle>
      <PhotoPicker existing={existing} value={photo} onChange={setPhoto} />
      <Field label="Kelompok benih">
        <select className="inp" value={f.gid} onChange={set('gid')} disabled={!!id}>
          <option value="">Pilih kelompok…</option>{groups.map((g) => <option key={g.id} value={g.id}>{g.group_code} – {g.group_name}</option>)}</select></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tanggal dan waktu"><input className="inp" type="datetime-local" value={f.date} onChange={set('date')} /></Field>
        <Field label="Status pertumbuhan"><select className="inp" value={f.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Kondisi benih/tanaman"><input className="inp" value={f.cond} onChange={set('cond')} placeholder="Contoh: akar mulai muncul" /></Field>
        <Field label="Tinggi (cm, opsional)"><input className="inp" type="number" inputMode="decimal" step="0.1" min={0} value={f.height} onChange={set('height')} /></Field>
      </div>
      <Field label="Catatan pengamatan"><textarea className="inp py-3" rows={3} value={f.notes} onChange={set('notes')} /></Field>
      {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
      <div className="grid grid-cols-2 gap-2"><button type="button" className="btn btn-s" onClick={() => nav(-1)}>Batal</button><button className="btn btn-p">Simpan pengamatan</button></div>
    </form>
  )
}
