import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Archive, ArchiveRestore, Pencil, Plus, Trash2 } from 'lucide-react'
import { db } from '../database/db'
import { deleteGroup, deleteObservation, groupStatus, relatedCount, setArchived } from '../services/seedService'
import { Empty, ObsCard, Pic, StatusBadge } from '../components/ui'
import { fmtDate } from '../utils'

export default function GroupDetail() {
  const id = Number(useParams().id)
  const nav = useNavigate()
  const data = useLiveQuery(async () => {
    const g = await db.seed_groups.get(id)
    if (!g) return null
    const obs = (await db.observations.where('seed_group_id').equals(id).sortBy('observation_date')).reverse()
    return { g, obs, status: await groupStatus(id) }
  }, [id])
  if (data === undefined) return null
  if (data === null) return <Empty text="Kelompok tidak ditemukan."><Link to="/kelompok" className="btn btn-p">Kembali</Link></Empty>
  const { g, obs, status } = data

  const remove = async () => {
    const c = await relatedCount(id)
    if (confirm(`Hapus permanen ${g.group_code}? ${c.obs} pengamatan dan ${c.photos} foto kelompok ini ikut terhapus. Untuk menyimpan datanya, pilih Arsipkan saja.`)) {
      await deleteGroup(id); nav('/kelompok', { replace: true })
    }
  }
  const info = [['Tanggal tanam', fmtDate(g.planting_date)], ['Jumlah benih', `${g.seed_count}`], ['Media tanam', g.planting_medium || '-'], ['Lokasi', g.location || '-']]
  return (
    <div className="space-y-5">
      <Pic id={g.cover_photo_id} className="aspect-[4/3] rounded-3xl" />
      <div>
        <div className="flex items-center justify-between gap-2"><h1 className="text-2xl font-bold text-forest">{g.group_code}</h1>{g.archived ? <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold">Diarsipkan</span> : null}</div>
        <p>{g.group_name}</p><div className="mt-2"><StatusBadge status={status} /></div>
      </div>
      <dl className="card grid grid-cols-2 gap-4 p-5">
        {info.map(([k, v]) => <div key={k}><dt className="text-xs text-ink/60">{k}</dt><dd className="font-medium">{v}</dd></div>)}
        {g.notes && <div className="col-span-2"><dt className="text-xs text-ink/60">Catatan</dt><dd>{g.notes}</dd></div>}
      </dl>
      <div className="grid grid-cols-2 gap-2">
        {!g.archived && <Link to={`/pengamatan/baru?kelompok=${id}`} className="btn btn-p col-span-2"><Plus size={18} />Tambah pengamatan</Link>}
        <Link to={`/kelompok/${id}/ubah`} className="btn btn-s"><Pencil size={16} />Ubah</Link>
        <button className="btn btn-s" onClick={() => setArchived(id, g.archived ? 0 : 1)}>
          {g.archived ? <><ArchiveRestore size={16} />Pulihkan</> : <><Archive size={16} />Arsipkan</>}</button>
        <button className="btn btn-d col-span-2" onClick={remove}><Trash2 size={16} />Hapus permanen</button>
      </div>
      <h2 className="font-bold text-forest">Riwayat pengamatan</h2>
      {obs.length ? <div className="space-y-3">{obs.map((o) => (
        <ObsCard key={o.id} o={o} onDelete={() => confirm('Hapus pengamatan ini beserta fotonya?') && deleteObservation(o.id!)} />))}</div>
        : <p className="text-sm text-ink/60">Belum ada pengamatan untuk kelompok ini.</p>}
    </div>
  )
}
