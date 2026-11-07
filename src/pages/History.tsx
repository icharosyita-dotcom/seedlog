import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../database/db'
import { deleteObservation } from '../services/seedService'
import { Empty, ObsCard, PageTitle } from '../components/ui'

export default function History() {
  const [sp, setSp] = useSearchParams()
  const gid = Number(sp.get('kelompok')) || 0
  const [desc, setDesc] = useState(true)
  const data = useLiveQuery(async () => {
    const [groups, obs] = await Promise.all([db.seed_groups.toArray(), (gid ? db.observations.where('seed_group_id').equals(gid) : db.observations.toCollection()).toArray()])
    return { groups, obs }
  }, [gid])
  if (!data) return null
  const code = new Map(data.groups.map((g) => [g.id!, g.group_code]))
  const obs = [...data.obs].sort((a, b) => (desc ? -1 : 1) * a.observation_date.localeCompare(b.observation_date))
  return (
    <div>
      <PageTitle>Riwayat pengamatan</PageTitle>
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <select className="inp" aria-label="Filter kelompok" value={gid || ''} onChange={(e) => setSp(e.target.value ? { kelompok: e.target.value } : {})}>
          <option value="">Semua kelompok</option>{data.groups.map((g) => <option key={g.id} value={g.id}>{g.group_code} – {g.group_name}</option>)}</select>
        <select className="inp" aria-label="Urutan" value={desc ? 'd' : 'a'} onChange={(e) => setDesc(e.target.value === 'd')}>
          <option value="d">Terbaru dulu</option><option value="a">Terlama dulu</option></select>
      </div>
      {obs.length ? <div className="space-y-3 border-l-2 border-leaf/50 pl-3">{obs.map((o) => (
        <ObsCard key={o.id} o={o} label={code.get(o.seed_group_id)} onDelete={() => confirm('Hapus pengamatan ini beserta fotonya?') && deleteObservation(o.id!)} />))}</div>
        : <Empty text="Belum ada pengamatan tercatat." />}
    </div>
  )
}
