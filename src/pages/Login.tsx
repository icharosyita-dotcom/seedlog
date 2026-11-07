import { useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Sprout } from 'lucide-react'
import { db } from '../database/db'
import { login, register } from '../services/authService'
import { Field } from '../components/ui'

export default function Login({ onDone }: { onDone: (id: number) => void }) {
  const count = useLiveQuery(() => db.users.count(), [])
  const [f, setF] = useState({ name: '', username: '', pw: '', pw2: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  if (count === undefined) return null
  const reg = count === 0
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr('')
    if (reg) {
      if (!f.name.trim() || !f.username.trim()) return setErr('Nama dan nama pengguna wajib diisi.')
      if (f.pw.length < 6) return setErr('Kata sandi minimal 6 karakter.')
      if (f.pw !== f.pw2) return setErr('Konfirmasi kata sandi tidak sama.')
    }
    setBusy(true)
    try { onDone(reg ? await register(f.name, f.username, f.pw) : await login(f.username, f.pw)) }
    catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }
  return (
    <div className="min-h-screen grid place-items-center bg-forest p-5">
      <form onSubmit={submit} className="card w-full max-w-sm p-6 space-y-4">
        <div className="text-center"><Sprout className="mx-auto text-leaf" size={44} /><h1 className="text-2xl font-bold text-forest">SEEDLOG</h1>
          <p className="text-sm text-ink/60">{reg ? 'Buat akun pengelola untuk perangkat ini' : 'Masuk untuk melihat catatan benih'}</p></div>
        {reg && <Field label="Nama"><input className="inp" value={f.name} onChange={set('name')} autoComplete="name" /></Field>}
        <Field label="Nama pengguna"><input className="inp" value={f.username} onChange={set('username')} autoComplete="username" autoCapitalize="none" /></Field>
        <Field label="Kata sandi"><input className="inp" type="password" value={f.pw} onChange={set('pw')} autoComplete={reg ? 'new-password' : 'current-password'} /></Field>
        {reg && <Field label="Ulangi kata sandi"><input className="inp" type="password" value={f.pw2} onChange={set('pw2')} autoComplete="new-password" /></Field>}
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <button className="btn btn-p w-full" disabled={busy}>{reg ? 'Buat akun' : 'Masuk'}</button>
      </form>
    </div>
  )
}
