import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Pencil } from 'lucide-react'
import { db } from '../database/db'
import { useAuth } from '../hooks/useAuth'
import { groupsWithStatus } from '../services/seedService'
import { STATUSES } from '../types'
import { Empty, GroupCard, StatusBadge } from '../components/ui'
import { DOT, fmtDateTime } from '../utils'

export default function Dashboard() {
  const { user } = useAuth()
  const gs = useLiveQuery(() => groupsWithStatus(0), [])
  const recent = useLiveQuery(async () => {
    const [obs, groups] = await Promise.all([db.observations.orderBy('observation_date').reverse().limit(5).toArray(), db.seed_groups.toArray()])
    const m = new Map(groups.map((g) => [g.id!, g.group_code]))
    return obs.map((o) => ({ ...o, code: m.get(o.seed_group_id) ?? '-' }))
  }, [])
  if (!gs || !recent) return null

  const sum = (f: (s: string) => boolean) => gs.filter((g) => f(g.status)).reduce((n, g) => n + g.seed_count, 0)
  const stats = [
    ['Kelompok benih', gs.length], ['Benih dipantau', sum(() => true)],
    ['Benih mulai berkecambah', sum((s) => s === 'Mulai Berkecambah' || s === 'Sudah Berkecambah')],
    ['Benih jadi bibit', sum((s) => s === 'Tumbuh Menjadi Bibit')],
  ]
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-forest p-6 text-white">
        <p className="text-white/70">Halo, {user?.name ?? 'Pengelola'}</p>
        <p className="mt-1 text-5xl font-bold">{sum(() => true)}</p>
        <p className="text-white/80">benih alpukat sedang dipantau di {gs.length} kelompok</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link to="/kelompok/baru" className="btn bg-leaf text-forest"><Plus size={18} />Kelompok baru</Link>
          <Link to="/pengamatan/baru" className="btn bg-white/15 text-white"><Pencil size={18} />Catat pengamatan</Link>
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3">
        {stats.map(([l, v]) => <div key={l} className="card p-4"><p className="text-3xl font-bold text-forest">{v}</p><p className="text-sm text-ink/65">{l}</p></div>)}
      </section>
      <p className="-mt-3 text-xs text-ink/55">Angka benih dihitung per kelompok berdasarkan status pengamatan terbaru kelompok tersebut.</p>
      <section className="card p-5">
        <h2 className="mb-3 font-bold text-forest">Ringkasan status kelompok</h2>
        <ul className="space-y-2">
          {STATUSES.map((s) => (
            <li key={s} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${DOT[s]}`} />{s}</span>
              <b>{gs.filter((g) => g.status === s).length}</b>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-3 font-bold text-forest">Kelompok terbaru</h2>
        {gs.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{gs.slice(0, 3).map((g) => <GroupCard key={g.id} g={g} />)}</div>
          : <Empty text="Belum ada kelompok benih."><Link to="/kelompok/baru" className="btn btn-p">Tambah kelompok pertama</Link></Empty>}
      </section>
      <section>
        <h2 className="mb-3 font-bold text-forest">Pengamatan terbaru</h2>
        {recent.length ? <div className="space-y-2">{recent.map((o) => (
          <Link key={o.id} to={`/kelompok/${o.seed_group_id}`} className="card flex items-center justify-between gap-3 p-4">
            <div><b className="text-forest">{o.code}</b><p className="text-xs text-ink/60">{fmtDateTime(o.observation_date)}</p></div>
            <StatusBadge status={o.growth_status} />
          </Link>))}</div> : <p className="text-sm text-ink/60">Belum ada pengamatan tercatat.</p>}
      </section>
    </div>
  )
}
