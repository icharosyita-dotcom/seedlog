import { useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './database/db'
import { AuthCtx } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Groups from './pages/Groups'
import GroupForm from './pages/GroupForm'
import GroupDetail from './pages/GroupDetail'
import ObservationForm from './pages/ObservationForm'
import History from './pages/History'
import SettingsPage from './pages/SettingsPage'

const KEY = 'seedlog_uid'

export default function App() {
  const [uid, setUid] = useState(() => Number(localStorage.getItem(KEY)) || 0)
  const user = useLiveQuery(() => (uid ? db.users.get(uid) : undefined), [uid])
  const logout = () => { localStorage.removeItem(KEY); setUid(0) }

  if (!uid) return <Login onDone={(id) => { localStorage.setItem(KEY, String(id)); setUid(id) }} />
  return (
    <AuthCtx.Provider value={{ user, logout }}>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="kelompok" element={<Groups />} />
            <Route path="kelompok/baru" element={<GroupForm />} />
            <Route path="kelompok/:id" element={<GroupDetail />} />
            <Route path="kelompok/:id/ubah" element={<GroupForm />} />
            <Route path="pengamatan/baru" element={<ObservationForm />} />
            <Route path="pengamatan/:id/ubah" element={<ObservationForm />} />
            <Route path="riwayat" element={<History />} />
            <Route path="pengaturan" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthCtx.Provider>
  )
}
