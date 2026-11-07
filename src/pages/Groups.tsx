import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Search } from 'lucide-react'
import { groupsWithStatus } from '../services/seedService'
import { STATUSES } from '../types'
import { Empty, GroupCard, PageTitle } from '../components/ui'

export default function Groups() {
  const [arch, setArch] = useState<0 | 1>(0)
  const [q, setQ] = useState('')
  const [st, setSt] = useState('')
  const gs = useLiveQuery(() => groupsWithStatus(arch), [arch])
  const list = (gs ?? []).filter((g) =>
    (!st || g.status === st) && (g.group_code + ' ' + g.group_name + ' ' + g.planting_date).toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <div>
      <PageTitle right={<Link to="/kelompok/baru" className="btn btn-p"><Plus size={18} />Tambah</Link>}>Kelompok benih</PageTitle>
      <div role="tablist" className="mb-4 grid grid-cols-2 rounded-2xl bg-mist p-1">
        {([[0, 'Aktif'], [1, 'Arsip']] as const).map(([v, l]) => (
          <button key={v} role="tab" aria-selected={arch === v} onClick={() => setArch(v)}
            className={`min-h-[44px] rounded-xl font-semibold ${arch === v ? 'bg-white text-forest shadow-sm' : 'text-forest/60'}`}>{l}</button>))}
      </div>
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <div className="relative"><Search size={18} className="absolute left-4 top-3.5 text-ink/40" />
          <input className="inp pl-11" placeholder="Cari kode, nama, atau tanggal (2025-01-31)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari kelompok" /></div>
        <select className="inp" value={st} onChange={(e) => setSt(e.target.value)} aria-label="Filter status">
          <option value="">Semua status</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      {list.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{list.map((g) => <GroupCard key={g.id} g={g} />)}</div>
        : <Empty text={gs?.length ? 'Tidak ada kelompok yang cocok dengan pencarian.' : arch ? 'Belum ada kelompok yang diarsipkan.' : 'Belum ada kelompok benih.'}>
            {!gs?.length && !arch && <Link to="/kelompok/baru" className="btn btn-p">Tambah kelompok</Link>}</Empty>}
    </div>
  )
}
