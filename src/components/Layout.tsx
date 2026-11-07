import { NavLink, Outlet } from 'react-router-dom'
import { History, Home, Pencil, Settings, Sprout } from 'lucide-react'

const items = [
  { to: '/', label: 'Beranda', Icon: Home, end: true },
  { to: '/kelompok', label: 'Kelompok', Icon: Sprout },
  { to: '/pengamatan/baru', label: 'Pengamatan', Icon: Pencil },
  { to: '/riwayat', label: 'Riwayat', Icon: History },
  { to: '/pengaturan', label: 'Pengaturan', Icon: Settings },
]

export default function Layout() {
  return (
    <div className="min-h-screen md:pl-60">
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col gap-1 bg-forest p-5 text-white">
        <div className="flex items-center gap-2 text-xl font-bold mb-6"><Sprout className="text-leaf" />SEEDLOG</div>
        {items.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 min-h-[48px] ${isActive ? 'bg-white/15 font-semibold' : 'text-white/75 hover:bg-white/10'}`}>
            <Icon size={20} />{label}
          </NavLink>
        ))}
      </aside>
      <main className="mx-auto max-w-4xl p-4 pb-28 md:p-8"><Outlet /></main>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-10 grid grid-cols-5 border-t border-black/5 bg-white pb-[env(safe-area-inset-bottom)]">
        {items.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] ${isActive ? 'text-forest font-bold' : 'text-ink/55'}`}>
            <Icon size={22} />{label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
