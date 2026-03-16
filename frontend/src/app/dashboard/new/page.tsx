'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const FRAMEWORKS = [
  { id: 'react',   label: 'React',   color: '#61dafb', desc: 'Component-based UI library' },
  { id: 'nextjs',  label: 'Next.js', color: '#ffffff', desc: 'Full-stack React framework' },
  { id: 'vue',     label: 'Vue',     color: '#42b883', desc: 'Progressive JS framework' },
  { id: 'svelte',  label: 'Svelte',  color: '#ff3e00', desc: 'Compiled web framework' },
  { id: 'fastapi', label: 'FastAPI', color: '#009688', desc: 'Python REST API framework' },
]

const EXAMPLES = [
  'A task manager with drag and drop',
  'A REST API with user authentication',
  'A real-time chat application',
  'A SaaS dashboard with analytics',
  'An e-commerce product page',
]

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [framework, setFramework] = useState('react')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim() || !prompt.trim()) { setError('Project name and description are required'); return }
    const token = localStorage.getItem('access_token')
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, prompt, framework }),
      })
      if (res.status === 402) { setError('You have reached your free plan limit. Upgrade to continue.'); return }
      if (!res.ok) { setError('Failed to create project. Please try again.'); return }
      const project = await res.json()
      router.push(`/builder/${project.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        textarea::placeholder, input::placeholder { color: #334155; }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ padding: '40px 48px', maxWidth: 680, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
          <Link href="/dashboard" style={{ color: '#475569', textDecoration: 'none', fontSize: 18 }}>←</Link>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, fontFamily: '"Instrument Serif",Georgia,serif', color: '#f8fafc' }}>New project</h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#475569' }}>Describe what you want to build</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Project name */}
          <div style={{ background: '#0d1427', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 28px' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 8 }}>Project name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="My awesome app"
              style={{ width: '100%', background: '#070b14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '11px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none' }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(37,99,235,0.4)'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* Framework */}
          <div style={{ background: '#0d1427', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 28px' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 12 }}>Framework</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {FRAMEWORKS.map(f => (
                <button key={f.id} onClick={() => setFramework(f.id)} style={{
                  padding: '10px 16px', borderRadius: 9, border: `1px solid ${framework === f.id ? f.color + '55' : 'rgba(255,255,255,0.06)'}`,
                  background: framework === f.id ? f.color + '15' : 'transparent',
                  color: framework === f.id ? f.color : '#475569',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3,
                }}>
                  <span>{f.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.7, fontWeight: 400 }}>{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div style={{ background: '#0d1427', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 28px' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 8 }}>What do you want to build?</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5}
              placeholder="Describe your app in as much detail as you like..."
              style={{ width: '100%', background: '#070b14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '11px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
              onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(37,99,235,0.4)'}
              onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.08)'}
            />
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: '#334155', marginBottom: 8 }}>Examples:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {EXAMPLES.map(ex => (
                  <button key={ex} onClick={() => setPrompt(ex)} style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20,
                    padding: '4px 12px', color: '#475569', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(37,99,235,0.3)'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = '#475569' }}
                  >
                    → {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <div style={{ fontSize: 13, color: '#ef4444', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

          <button onClick={handleCreate} disabled={loading || !name.trim() || !prompt.trim()} style={{
            background: name.trim() && prompt.trim() && !loading ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : 'rgba(255,255,255,0.06)',
            color: name.trim() && prompt.trim() && !loading ? '#fff' : '#475569',
            border: 'none', borderRadius: 11, padding: '14px', fontSize: 15, fontWeight: 600,
            cursor: name.trim() && prompt.trim() && !loading ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s',
          }}>
            {loading ? (
              <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Creating project...</>
            ) : 'Create project →'}
          </button>

        </div>
      </div>
    </>
  )
}
