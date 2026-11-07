import { useEffect, useState } from 'react'
import { Download, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { exportBackup } from '../services/seedService'
import { PageTitle } from '../components/ui'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [info, setInfo] = useState('Memeriksa…')
  const [persisted, setPersisted] = useState<boolean>()
  const [msg, setMsg] = useState('')
  useEffect(() => {
    navigator.storage?.estimate?.().then((e) => setInfo(`${((e.usage ?? 0) / 1048576).toFixed(1)} MB terpakai dari sekitar ${((e.quota ?? 0) / 1048576).toFixed(0)} MB`)).catch(() => setInfo('Tidak tersedia'))
    navigator.storage?.persisted?.().then(setPersisted)
  }, [])
  const ask = async () => setPersisted(await navigator.storage?.persist?.())
  const backup = async () => {
    try {
      const url = URL.createObjectURL(new Blob([await exportBackup()], { type: 'application/json' }))
      Object.assign(document.createElement('a'), { href: url, download: `seedlog-cadangan-${new Date().toISOString().slice(0, 10)}.json` }).click()
      URL.revokeObjectURL(url); setMsg('Cadangan berhasil diunduh.')
    } catch { setMsg('Cadangan gagal dibuat.') }
  }
  return (
    <div className="space-y-4">
      <PageTitle>Pengaturan</PageTitle>
      <section className="card p-5"><h2 className="font-bold text-forest">SEEDLOG</h2><p className="text-sm text-ink/70">Versi 1.0.0 · Pencatatan manual pertumbuhan benih alpukat. Akun aktif: {user?.name}</p></section>
      <section className="card space-y-3 p-5">
        <h2 className="font-bold text-forest">Penyimpanan lokal</h2>
        <p className="text-sm text-ink/70">{info}. Data hanya ada di perangkat ini dan akan hilang jika data situs dihapus.</p>
        <p className="text-sm">Penyimpanan persisten: <b>{persisted === undefined ? 'tidak didukung' : persisted ? 'aktif' : 'belum aktif'}</b></p>
        {persisted === false && <button className="btn btn-s w-full" onClick={ask}>Minta penyimpanan persisten</button>}
        <button className="btn btn-p w-full" onClick={backup}><Download size={18} />Unduh cadangan (JSON)</button>
        {msg && <p role="status" className="text-sm text-forest">{msg}</p>}
      </section>
      <button className="btn btn-d w-full" onClick={logout}><LogOut size={18} />Keluar</button>
    </div>
  )
}
