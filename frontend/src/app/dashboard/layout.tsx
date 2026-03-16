'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface User {
  id: number
  email: string
  full_name: string | null
  plan: 'free' | 'pro' | 'team'
  generations_used: number
  generations_limit: number
}

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/dashboard/new', label: 'New project', icon: '+' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
]

const PLAN_COLOR = { free: '#94a3b8', pro: '#7c3aed', team: '#2563eb' }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/login'); return }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (r.status === 401) { router.push('/login'); return null } return r.json() })
      .then(data => { if (data) setUser(data) })
      .catch(() => router.push('/login'))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    router.push('/login')
  }

  const pct = user ? Math.min((user.generations_used / (user.generations_limit === -1 ? 1 : user.generations_limit)) * 100, 100) : 0
  const planColor = user ? PLAN_COLOR[user.plan] : '#94a3b8'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070b14; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#070b14' }}>

        {/* Sidebar */}
        <aside style={{
          width: collapsed ? 64 : 220,
          minHeight: '100vh',
          background: '#0a0f1e',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          padding: collapsed ? '24px 12px' : '24px 16px',
          transition: 'width 0.25s ease, padding 0.25s ease',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', marginBottom: 32 }}>
            {!collapsed && (
              <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff' }}>◈</div>
                <span style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 17, color: '#f1f5f9', letterSpacing: '-0.02em' }}>corefront</span>
              </Link>
            )}
            {collapsed && (
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#fff' }}>◈</div>
            )}
            {!collapsed && (
              <button onClick={() => setCollapsed(true)} style={{ background: 'transparent', border: 'none', color: '#334155', cursor: 'pointer', fontSize: 16, padding: 4, borderRadius: 6 }}>‹</button>
            )}
          </div>

          {collapsed && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <button onClick={() => setCollapsed(false)} style={{ background: '#0d1427', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', cursor: 'pointer', fontSize: 12, padding: '3px 7px', borderRadius: 6 }}>›</button>
            </div>
          )}

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {NAV.map(item => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: collapsed ? '10px 0' : '10px 12px',
                  borderRadius: 9, textDecoration: 'none',
                  color: active ? '#e2e8f0' : '#475569',
                  background: active ? 'rgba(37,99,235,0.12)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(37,99,235,0.2)' : 'transparent'}`,
                  fontSize: 14, fontWeight: active ? 500 : 400,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: item.icon === '+' ? 20 : 15, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && item.label}
                </Link>
              )
            })}
          </nav>

          {/* Bottom */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>

            {/* Usage mini-meter */}
            {user?.plan === 'free' && !collapsed && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#475569' }}>Generations</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#64748b' }}>
                    {user.generations_used}/{user.generations_limit}
                  </span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : 'linear-gradient(90deg, #2563eb, #7c3aed)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                </div>
                {pct >= 80 && (
                  <Link href="/settings?tab=billing" style={{ display: 'block', marginTop: 10, fontSize: 12, fontWeight: 500, color: '#7c3aed', textDecoration: 'none', textAlign: 'center' }}>
                    Upgrade to Pro →
                  </Link>
                )}
              </div>
            )}

            {/* Plan badge */}
            {!collapsed && user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: planColor, boxShadow: `0 0 6px ${planColor}`, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#64748b', flex: 1, textTransform: 'capitalize' }}>{user.plan} plan</span>
                {user.plan === 'free' && (
                  <Link href="/settings?tab=billing" style={{ fontSize: 11, color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>Upgrade</Link>
                )}
              </div>
            )}

            {/* User row */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '8px 0' : '10px 12px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#a78bfa' }}>
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </div>
                {!collapsed && (
                  <>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.full_name || user.email}</div>
                      <div style={{ fontSize: 11, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                    </div>
                    <button onClick={handleLogout} title="Sign out" style={{ background: 'transparent', border: 'none', color: '#334155', cursor: 'pointer', fontSize: 14, padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#334155'}
                    >⎋</button>
                  </>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minHeight: '100vh', overflow: 'auto', background: '#070b14' }}>
          {children}
        </main>
      </div>
    </>
  )
}
