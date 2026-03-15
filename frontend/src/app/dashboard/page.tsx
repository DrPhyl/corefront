'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Plan = 'free' | 'pro' | 'team'

interface User {
  id: number
  email: string
  full_name: string | null
  plan: Plan
  generations_used: number
  generations_limit: number
}

interface Project {
  id: number
  name: string
  prompt: string
  framework: string
  status: string
  created_at: string
  updated_at: string
}

const FW: Record<string, { label: string; color: string; bg: string }> = {
  react:   { label: 'React',   color: '#61dafb', bg: 'rgba(97,218,251,0.10)' },
  vue:     { label: 'Vue',     color: '#42b883', bg: 'rgba(66,184,131,0.10)' },
  nextjs:  { label: 'Next.js', color: '#ffffff', bg: 'rgba(255,255,255,0.08)' },
  svelte:  { label: 'Svelte',  color: '#ff3e00', bg: 'rgba(255,62,0,0.10)' },
  fastapi: { label: 'FastAPI', color: '#009688', bg: 'rgba(0,150,136,0.10)' },
}

const PLAN_META: Record<Plan, { color: string; bg: string }> = {
  free: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  pro:  { color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
  team: { color: '#2563eb', bg: 'rgba(37,99,235,0.15)' },
}

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    const headers = { Authorization: `Bearer ${token}` }
    const base = process.env.NEXT_PUBLIC_API_URL

    Promise.all([
      fetch(`${base}/api/v1/users/me`, { headers }).then(r => r.json()),
      fetch(`${base}/api/v1/projects`, { headers }).then(r => r.json()),
    ])
      .then(([u, p]) => { setUser(u); setProjects(Array.isArray(p) ? p : []) })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project?')) return
    const token = localStorage.getItem('token')
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.prompt.toLowerCase().includes(search.toLowerCase())
  )

  const canGenerate = !user || user.plan !== 'free' || user.generations_used < user.generations_limit
  const pct = user ? Math.min((user.generations_used / (user.generations_limit === -1 ? 1 : user.generations_limit)) * 100, 100) : 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
      `}</style>

      <div style={{ padding: '40px 48px', maxWidth: 1200, opacity: mounted ? 1 : 0, transition: 'opacity 0.3s' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 700, fontFamily: '"Instrument Serif", Georgia, serif', color: '#f8fafc' }}>
              Your projects
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>
              {loading ? 'Loading...' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user && (
              <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, color: PLAN_META[user.plan].color, background: PLAN_META[user.plan].bg, border: `1px solid ${PLAN_META[user.plan].color}33`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {user.plan}
              </span>
            )}
            <Link href={canGenerate ? '/dashboard/new' : '/settings?tab=billing'} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: canGenerate ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.06)',
              color: canGenerate ? '#fff' : '#475569',
              fontWeight: 600, fontSize: 14, padding: '10px 20px', borderRadius: 10,
              textDecoration: 'none', border: canGenerate ? 'none' : '1px solid rgba(255,255,255,0.08)',
            }}>
              {canGenerate ? <><span style={{ fontSize: 18, marginTop: -1 }}>+</span> New project</> : 'Upgrade to continue →'}
            </Link>
          </div>
        </div>

        {/* Usage meter */}
        {user?.plan === 'free' && (
          <div style={{ background: '#0d1427', border: `1px solid ${pct >= 100 ? 'rgba(239,68,68,0.3)' : pct >= 80 ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{pct >= 100 ? '⚠ Generation limit reached' : 'Generations this month'}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#e2e8f0' }}>
                  {user.generations_used} / {user.generations_limit}
                </span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : 'linear-gradient(90deg, #2563eb, #7c3aed)', borderRadius: 99, transition: 'width 0.6s ease' }} />
              </div>
            </div>
            {pct >= 100 && (
              <Link href="/settings?tab=billing" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Upgrade →
              </Link>
            )}
          </div>
        )}

        {/* Search */}
        {projects.length > 0 && (
          <div style={{ marginBottom: 24, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: 15, pointerEvents: 'none' }}>⌕</span>
            <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', maxWidth: 360, background: '#0d1427', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px 10px 38px', color: '#e2e8f0', fontSize: 14, outline: 'none' }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(37,99,235,0.4)'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.06)'}
            />
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="card-grid">
            {[1,2,3].map(i => <div key={i} style={{ background: '#0d1427', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, height: 180, animation: 'pulse 1.4s ease-in-out infinite' }} />)}
          </div>
        ) : (
          <div className="card-grid">
            {filtered.length > 0 ? filtered.map((p, i) => {
              const fw = FW[p.framework] || { label: p.framework, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }
              return (
                <div key={p.id} className="fade-up" style={{ animationDelay: `${i * 60}ms`, background: '#0d1427', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14, transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(37,99,235,0.35)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, color: fw.color, background: fw.bg, border: `1px solid ${fw.color}22` }}>{fw.label}</span>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'transparent', border: 'none', color: '#334155', cursor: 'pointer', fontSize: 13, padding: '4px 8px', borderRadius: 6 }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#334155'}
                    >✕</button>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#f1f5f9', fontFamily: '"Instrument Serif", Georgia, serif' }}>{p.name}</h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.prompt}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontSize: 12, color: '#475569' }}>Updated {timeAgo(p.updated_at)}</span>
                    <Link href={`/builder/${p.id}`} style={{ fontSize: 13, fontWeight: 500, color: '#2563eb', textDecoration: 'none', padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(37,99,235,0.3)', background: 'rgba(37,99,235,0.06)' }}>
                      Open →
                    </Link>
                  </div>
                </div>
              )
            }) : projects.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 40px', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 20 }}>✦</div>
                <h3 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 600, color: '#e2e8f0', fontFamily: '"Instrument Serif", Georgia, serif' }}>No projects yet</h3>
                <p style={{ margin: '0 0 28px', fontSize: 14, color: '#475569', maxWidth: 320, lineHeight: 1.6 }}>Describe what you want to build and Corefront will generate it instantly.</p>
                <Link href="/dashboard/new" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', fontWeight: 600, fontSize: 14, padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}>
                  Start your first project →
                </Link>
              </div>
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center', color: '#475569', fontSize: 14 }}>
                No projects match "{search}"
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {projects.length > 0 && !loading && (
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 32 }}>
            {[
              { label: 'Total projects', value: projects.length },
              { label: 'Frameworks used', value: new Set(projects.map(p => p.framework)).size },
              { label: 'Generations left', value: user?.plan === 'free' ? `${(user.generations_limit - user.generations_used)}` : 'Unlimited' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#475569' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
