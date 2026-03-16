'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: number
  email: string
  full_name: string | null
  plan: 'free' | 'pro' | 'team'
  generations_used: number
  generations_limit: number
}

const PLAN_META = {
  free:  { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.2)' },
  pro:   { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)',  border: 'rgba(124,58,237,0.25)' },
  team:  { color: '#2563eb', bg: 'rgba(37,99,235,0.12)',   border: 'rgba(37,99,235,0.25)'  },
}

type Tab = 'profile' | 'billing' | 'apikeys'

function SettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'profile')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fullName, setFullName] = useState('')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const showSuccess = searchParams.get('success') === 'true'

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/login'); return }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (r.status === 401) { router.push('/login'); return null } return r.json() })
      .then(data => { if (data) { setUser(data); setFullName(data.full_name || '') } })
      .finally(() => setLoading(false))
  }, [])

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('access_token')
    setSaving(true)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ full_name: fullName }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPwError('')
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return }
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters'); return }
    const token = localStorage.getItem('access_token')
    setSaving(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      })
      if (!res.ok) { setPwError('Current password is incorrect'); return }
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'billing', label: 'Billing' },
    { key: 'apikeys', label: 'API Keys' },
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#070b14', color: '#475569', fontSize: 14 }}>
      Loading...
    </div>
  )

  const plan = user ? PLAN_META[user.plan] : PLAN_META.free
  const pct = user ? Math.min((user.generations_used / (user.generations_limit === -1 ? 1 : user.generations_limit)) * 100, 100) : 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        input::placeholder { color: #334155; }
      `}</style>

      <div style={{ padding: '40px 48px', maxWidth: 760, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 700, fontFamily: '"Instrument Serif",Georgia,serif', color: '#f8fafc' }}>Settings</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>Manage your account and billing</p>
        </div>

        {showSuccess && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, fontSize: 14, color: '#22c55e' }}>
            ✓ Your plan has been upgraded successfully!
          </div>
        )}

        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: '#0d1427', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid rgba(255,255,255,0.06)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
              background: tab === t.key ? '#1e2d4a' : 'transparent',
              color: tab === t.key ? '#e2e8f0' : '#475569',
              transition: 'all 0.15s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: '#0d1427', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '28px 32px' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Personal info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>Full name</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name"
                    style={{ width: '100%', background: '#070b14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none' }}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(37,99,235,0.4)'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>Email</label>
                  <input value={user?.email || ''} readOnly
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 14px', color: '#475569', fontSize: 14, outline: 'none', cursor: 'not-allowed' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSaveProfile} disabled={saving} style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ background: '#0d1427', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '28px 32px' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Change password</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Current password', value: currentPw, setter: setCurrentPw },
                  { label: 'New password', value: newPw, setter: setNewPw },
                  { label: 'Confirm new password', value: confirmPw, setter: setConfirmPw },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>{f.label}</label>
                    <input type="password" value={f.value} onChange={e => f.setter(e.target.value)} placeholder="••••••••"
                      style={{ width: '100%', background: '#070b14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none' }}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(37,99,235,0.4)'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </div>
                ))}
                {pwError && <div style={{ fontSize: 13, color: '#ef4444' }}>{pwError}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleChangePassword} disabled={saving} style={{ background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    {saving ? 'Saving...' : 'Update password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'billing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: '#0d1427', border: `1px solid ${plan.border}`, borderRadius: 14, padding: '28px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Current plan</h3>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, color: plan.color, background: plan.bg, border: `1px solid ${plan.border}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {user?.plan}
                </span>
              </div>
              {user?.plan === 'free' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>Generations used this month</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: pct >= 100 ? '#ef4444' : '#e2e8f0' }}>{user.generations_used} / {user.generations_limit}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginBottom: 16 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#ef4444' : 'linear-gradient(90deg,#2563eb,#7c3aed)', borderRadius: 99 }} />
                  </div>
                </>
              )}
              {user?.plan !== 'free' && (
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('access_token')
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/stripe/portal/`, {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}` },
                    })
                    const data = await res.json()
                    if (data.portal_url) window.location.href = data.portal_url
                  }}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 20px', color: '#94a3b8', fontSize: 14, cursor: 'pointer', marginTop: 8 }}
                >
                  Manage billing →
                </button>
              )}
            </div>

            {user?.plan === 'free' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { name: 'Pro', price: '$29', plan: 'pro', color: '#7c3aed', border: 'rgba(124,58,237,0.3)', features: ['Unlimited generations','All frameworks','Private projects','API access','Priority support'] },
                  { name: 'Team', price: '$59', plan: 'team', color: '#2563eb', border: 'rgba(37,99,235,0.3)', features: ['Everything in Pro','Team collaboration','SSO & SAML','Dedicated support','Custom integrations'] },
                ].map(p => (
                  <div key={p.name} style={{ background: '#0d1427', border: `1px solid ${p.border}`, borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{p.name}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                        <span style={{ fontSize: 32, fontWeight: 800, color: '#f8fafc' }}>{p.price}</span>
                        <span style={{ fontSize: 14, color: '#475569' }}>/month</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {p.features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8' }}>
                          <span style={{ color: p.color }}>✓</span> {f}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('access_token')
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/stripe/checkout/`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ plan: p.plan }),
                        })
                        const data = await res.json()
                        if (data.checkout_url) window.location.href = data.checkout_url
                      }}
                      style={{ background: `linear-gradient(135deg,${p.color},${p.color}dd)`, color: '#fff', border: 'none', borderRadius: 9, padding: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 'auto' }}
                    >
                      Upgrade to {p.name} →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'apikeys' && (
          <div style={{ background: '#0d1427', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '28px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>API Keys</h3>
              <button style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                + Create key
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', textAlign: 'center', gap: 8 }}>
              <div style={{ fontSize: 32 }}>🔑</div>
              <div style={{ fontSize: 14, color: '#475569' }}>No API keys yet</div>
              <div style={{ fontSize: 13, color: '#334155' }}>Create a key to access the Corefront API programmatically</div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#070b14', color: '#475569', fontSize: 14 }}>
        Loading...
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}
