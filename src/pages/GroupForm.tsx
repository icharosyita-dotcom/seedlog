import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../database/db'
import { nextCode, saveGroup } from '../services/seedService'
import { Field, PageTitle } from '../components/ui'
import PhotoPicker from '../components/PhotoPicker'
import { todayInput } from '../utils'

export default function GroupForm() {
  const id = Number(useParams().id) || undefined
  const nav = useNavigate()
  const [f, setF] = useState({ group_code: '', group_name: '', planting_date: todayInput(), seed_count: '', planting_medium: '', location: '', notes: '' })
  const [photo, setPhoto] = useState<Blob | null | undefined>()
  const [existing, setExisting] = useState<Blob | null>()
  const [err, setErr] = useState('')
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  useEffect(() => {
    (async () => {
      if (!id) return setF((p) => ({ ...p, group_code: '' })), nextCode().then((c) => setF((p) => ({ ...p, group_code: c })))
      const g = await db.seed_groups.get(id)
      if (!g) return nav('/kelompok', { replace: true })
      setF({ ...g, seed_count: String(g.seed_count) })
      if (g.cover_photo_id) setExisting((await db.photos.get(g.cover_photo_id))?.image_blob)
    })()
  }, [id, nav])

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr('')
    const code = f.group_code.trim().toUpperCase(), n = Number(f.seed_count)
    if (!code) return setErr('Kode kelompok wajib diisi.')
    if (!f.group_name.trim()) return setErr('Nama kelompok wajib diisi.')
    if (!f.planting_date) return setErr('Tanggal penanaman wajib diisi.')
    if (!Number.isInteger(n) || n < 1) return setErr('Jumlah benih harus bilangan bulat minimal 1.')
    try {
      const gid = await saveGroup({ group_code: code, group_name: f.group_name.trim(), planting_date: f.planting_date, seed_count: n,
        planting_medium: f.planting_medium.trim(), location: f.location.trim(), notes: f.notes.trim() }, id, photo)
      nav(`/kelompok/${gid}`, { replace: true })
    } catch (x) { setErr((x as Error).message) }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <PageTitle>{id ? 'Ubah kelompok' : 'Kelompok baru'}</PageTitle>
      <PhotoPicker existing={existing} value={photo} onChange={setPhoto} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kode kelompok"><input className="inp" value={f.group_code} onChange={set('group_code')} /></Field>
        <Field label="Nama kelompok"><input className="inp" value={f.group_name} onChange={set('group_name')} placeholder="Contoh: Benih Hass Batch 1" /></Field>
        <Field label="Tanggal penanaman"><input className="inp" type="date" value={f.planting_date} onChange={set('planting_date')} /></Field>
        <Field label="Jumlah benih"><input className="inp" type="number" inputMode="numeric" min={1} value={f.seed_count} onChange={set('seed_count')} /></Field>
        <Field label="Media tanam"><input className="inp" value={f.planting_medium} onChange={set('planting_medium')} placeholder="Contoh: tanah + pasir" /></Field>
        <Field label="Lokasi penanaman"><input className="inp" value={f.location} onChange={set('location')} placeholder="Contoh: bedeng 2" /></Field>
      </div>
      <Field label="Catatan tambahan"><textarea className="inp py-3" rows={3} value={f.notes} onChange={set('notes')} /></Field>
      {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
      <div className="grid grid-cols-2 gap-2"><button type="button" className="btn btn-s" onClick={() => nav(-1)}>Batal</button><button className="btn btn-p">Simpan kelompok</button></div>
    </form>
  )
}
