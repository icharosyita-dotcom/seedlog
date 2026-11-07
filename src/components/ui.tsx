import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pencil, Trash2, Sprout } from 'lucide-react'
import type { ReactNode } from 'react'
import { db } from '../database/db'
import { useBlobUrl } from '../hooks/useBlobUrl'
import type { GrowthStatus, Observation } from '../types'
import type { GroupView } from '../services/seedService'
import { DOT, fmtDate, fmtDateTime } from '../utils'

function Img({ blob, className = '' }: { blob?: Blob; className?: string }) {
  const url = useBlobUrl(blob)
  return (
    <div className={`bg-mist grid place-items-center overflow-hidden ${className}`}>
      {url ? <img src={url} alt="Foto benih alpukat" className="w-full h-full object-cover" /> : <Sprout className="text-leaf" size={32} />}
    </div>
  )
}
export const Pic = ({ id, className }: { id?: number; className?: string }) => {
  const p = useLiveQuery(() => (id ? db.photos.get(id) : undefined), [id])
  return <Img blob={p?.image_blob} className={className} />
}
export const ObsPic = ({ obs, className }: { obs: number; className?: string }) => {
  const p = useLiveQuery(() => db.photos.where('observation_id').equals(obs).first(), [obs])
  return p ? <Img blob={p.image_blob} className={className} /> : null
}

export const StatusBadge = ({ status }: { status: GrowthStatus }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-forest">
    <span className={`h-2 w-2 rounded-full ${DOT[status]}`} />{status}
  </span>
)

export const GroupCard = ({ g }: { g: GroupView }) => (
  <Link to={`/kelompok/${g.id}`} className="card block overflow-hidden active:scale-[.98] transition">
    <Pic id={g.cover_photo_id} className="aspect-[4/3]" />
    <div className="p-4 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <b className="text-forest">{g.group_code}</b><span className="text-xs text-ink/60">{g.seed_count} benih</span>
      </div>
      <p className="font-medium leading-tight">{g.group_name}</p>
      <p className="text-xs text-ink/60">Ditanam {fmtDate(g.planting_date)}</p>
      <StatusBadge status={g.status} />
    </div>
  </Link>
)

export function ObsCard({ o, label, onDelete }: { o: Observation; label?: string; onDelete: () => void }) {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          {label && <b className="text-forest block">{label}</b>}
          <span className="text-xs text-ink/60">{fmtDateTime(o.observation_date)}</span>
        </div>
        <StatusBadge status={o.growth_status} />
      </div>
      <ObsPic obs={o.id!} className="aspect-[4/3] rounded-2xl" />
      {o.height != null && <p className="text-sm">Tinggi: <b>{o.height} cm</b></p>}
      {o.plant_condition && <p className="text-sm">Kondisi: {o.plant_condition}</p>}
      {o.notes && <p className="text-sm text-ink/70">{o.notes}</p>}
      <div className="flex gap-2">
        <Link to={`/pengamatan/${o.id}/ubah`} className="btn btn-s flex-1"><Pencil size={16} />Ubah</Link>
        <button className="btn btn-d flex-1" onClick={onDelete}><Trash2 size={16} />Hapus</button>
      </div>
    </div>
  )
}

export const Empty = ({ text, children }: { text: string; children?: ReactNode }) => (
  <div className="card p-8 text-center space-y-4"><Sprout className="mx-auto text-leaf" size={40} /><p className="text-ink/70">{text}</p>{children}</div>
)
export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block"><span className="lbl">{label}</span>{children}</label>
)
export const PageTitle = ({ children, right }: { children: ReactNode; right?: ReactNode }) => (
  <div className="flex items-center justify-between gap-3 mb-5"><h1 className="text-2xl font-bold text-forest">{children}</h1>{right}</div>
)
