'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const FRAMEWORKS = [
  { id: 'react',   label: 'React',   color: '#61dafb', desc: 'Component-based UI' },
  { id: 'nextjs',  label: 'Next.js', color: '#ffffff', desc: 'Full-stack framework' },
  { id: 'vue',     label: 'Vue',     color: '#42b883', desc: 'Progressive JS' },
  { id: 'svelte',  label: 'Svelte',  color: '#ff3e00', desc: 'Compiled framework' },
  { id: 'fastapi', label: 'FastAPI', color: '#009688', desc: 'Python REST API' },
]

const PROJECT_TYPES = [
  { id: 'landing', label: 'Landing page', icon: '🌐' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'saas', label: 'SaaS app', icon: '🚀' },
  { id: 'ecommerce', label: 'E-commerce', icon: '🛍' },
  { id: 'portfolio', label: 'Portfolio', icon: '💼' },
  { id: 'blog', label: 'Blog', icon: '✍️' },
  { id: 'api', label: 'REST API', icon: '⚡' },
  { id: 'custom', label: 'Custom', icon: '✨' },
]

const DESIGN_STYLES = [
  { id: 'clean', label: 'Clean & minimal', desc: 'White space, simple typography' },
  { id: 'dark', label: 'Dark & modern', desc: 'Dark backgrounds, glowing accents' },
  { id: 'bold', label: 'Bold & colorful', desc: 'Vibrant colors, strong contrast' },
  { id: 'corporate', label: 'Professional', desc: 'Trust-building, business-focused' },
  { id: 'playful', label: 'Playful & fun', desc: 'Rounded, friendly, energetic' },
]

const SECTIONS_BY_TYPE: Record<string, string[]> = {
  landing: ['Hero', 'Features', 'Pricing', 'Testimonials', 'FAQ', 'Footer', 'CTA', 'About'],
  dashboard: ['Sidebar nav', 'Stats cards', 'Charts', 'Data table', 'Activity feed', 'Header'],
  saas: ['Hero', 'Features', 'Pricing', 'Testimonials', 'FAQ', 'Footer', 'Login/Signup'],
  ecommerce: ['Hero', 'Product grid', 'Product detail', 'Cart', 'Checkout', 'Footer'],
  portfolio: ['Hero', 'About', 'Projects grid', 'Skills', 'Contact', 'Footer'],
  blog: ['Header', 'Featured post', 'Post grid', 'Sidebar', 'Footer'],
  api: ['Overview', 'Authentication', 'Endpoints', 'Request/Response examples', 'Error codes'],
  custom: ['Hero', 'Features', 'About', 'Contact', 'Footer'],
}

type Step = 'type' | 'details' | 'style' | 'sections' | 'confirm'

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('type')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [projectType, setProjectType] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessDesc, setBusinessDesc] = useState('')
  const [framework, setFramework] = useState('react')
  const [designStyle, setDesignStyle] = useState('')
  const [selectedSections, setSelectedSections] = useState<string[]>([])

  const toggleSection = (s: string) => {
    setSelectedSections(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const buildPrompt = () => {
    const type = PROJECT_TYPES.find(t => t.id === projectType)?.label || projectType
    const style = DESIGN_STYLES.find(s => s.id === designStyle)
    const sections = selectedSections.length > 0 ? selectedSections.join(', ') : 'all standard sections'

    return `Build a ${type} for "${businessName}".

Business description: ${businessDesc || 'Not specified'}
Design style: ${style?.label} — ${style?.desc}
Include these sections: ${sections}
Framework: ${framework}

Make it production-quality, fully responsive, and visually polished. Use realistic placeholder content that fits the business. Apply the ${style?.label.toLowerCase()} design style throughout.`
  }

  const handleCreate = async () => {
    const token = localStorage.getItem('access_token')
    setLoading(true)
    setError('')
    const prompt = buildPrompt()
    const name = `${businessName} - ${PROJECT_TYPES.find(t => t.id === projectType)?.label}`

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, prompt, framework }),
      })
      if (res.status === 402) { setError('Generation limit reached. Upgrade to continue.'); return }
      if (!res.ok) { setError('Failed to create project.'); return }
      const project = await res.json()
      router.push(`/builder/${project.id}`)
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 'type') return !!projectType
    if (step === 'details') return !!businessName.trim()
    if (step === 'style') return !!designStyle
    if (step === 'sections') return selectedSections.length > 0
    return true
  }

  const nextStep = () => {
    const steps: Step[] = ['type', 'details', 'style', 'sections', 'confirm']
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) setStep(steps[idx + 1])
  }

  const prevStep = () => {
    const steps: Step[] = ['type', 'details', 'style', 'sections', 'confirm']
    const idx = steps.indexOf(step)
    if (idx > 0) setStep(steps[idx - 1])
  }

  const STEP_LABELS = ['Type', 'Details', 'Style', 'Sections', 'Confirm']
  const stepIndex = ['type', 'details', 'style', 'sections', 'confirm'].indexOf(step)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        input, textarea { outline: none; font-family: inherit; }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ padding: '40px 48px', maxWidth: 720, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
          <Link href="/dashboard" style={{ color: '#475569', textDecoration: 'none', fontSize: 18 }}>←</Link>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, fontFamily: '"Instrument Serif",Georgia,serif', color: '#f8fafc' }}>New project</h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#475569' }}>Answer a few questions for better results</p>
          </div>
        </div>

        {/* Progress steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
          {STEP_LABELS.map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEP_LABELS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600,
                  background: i < stepIndex ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : i === stepIndex ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.06)',
                  color: i <= stepIndex ? '#e2e8f0' : '#334155',
                  border: i === stepIndex ? '2px solid #2563eb' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i === stepIndex ? '#94a3b8' : '#334155', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < stepIndex ? 'linear-gradient(90deg,#2563eb,#7c3aed)' : 'rgba(255,255,255,0.06)', margin: '0 8px', marginBottom: 22, transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div style={{ background: '#0d1427', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '32px 36px', marginBottom: 24 }}>

          {/* STEP 1: Project type */}
          {step === 'type' && (
            <div>
              <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600, color: '#f1f5f9' }}>What are you building?</h2>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: '#475569' }}>Choose the type of project</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {PROJECT_TYPES.map(t => (
                  <button key={t.id} onClick={() => setProjectType(t.id)} style={{
                    padding: '16px 12px', borderRadius: 12, border: `1px solid ${projectType === t.id ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.06)'}`,
                    background: projectType === t.id ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: 24 }}>{t.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: projectType === t.id ? '#e2e8f0' : '#64748b' }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Details */}
          {step === 'details' && (
            <div>
              <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600, color: '#f1f5f9' }}>Tell us about your project</h2>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: '#475569' }}>The more detail, the better the output</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 8 }}>
                    Business or project name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input value={businessName} onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g. BrightSmile Dental, Acme SaaS, My Portfolio"
                    style={{ width: '100%', background: '#070b14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '11px 14px', color: '#e2e8f0', fontSize: 14 }}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(37,99,235,0.4)'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 8 }}>
                    Brief description <span style={{ color: '#475569', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea value={businessDesc} onChange={e => setBusinessDesc(e.target.value)}
                    placeholder="e.g. A dental clinic specializing in family care, whitening, and orthodontics in Dallas TX"
                    rows={3}
                    style={{ width: '100%', background: '#070b14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '11px 14px', color: '#e2e8f0', fontSize: 14, resize: 'vertical', lineHeight: 1.6 }}
                    onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(37,99,235,0.4)'}
                    onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 12 }}>Framework</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {FRAMEWORKS.map(f => (
                      <button key={f.id} onClick={() => setFramework(f.id)} style={{
                        padding: '8px 16px', borderRadius: 8,
                        border: `1px solid ${framework === f.id ? f.color + '55' : 'rgba(255,255,255,0.06)'}`,
                        background: framework === f.id ? f.color + '15' : 'transparent',
                        color: framework === f.id ? f.color : '#475569',
                        fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Design style */}
          {step === 'style' && (
            <div>
              <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600, color: '#f1f5f9' }}>Choose a design style</h2>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: '#475569' }}>This shapes the visual feel of your output</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {DESIGN_STYLES.map(s => (
                  <button key={s.id} onClick={() => setDesignStyle(s.id)} style={{
                    padding: '16px 20px', borderRadius: 12, border: `1px solid ${designStyle === s.id ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.06)'}`,
                    background: designStyle === s.id ? 'rgba(37,99,235,0.10)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: designStyle === s.id ? '#e2e8f0' : '#94a3b8', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 13, color: '#475569' }}>{s.desc}</div>
                    </div>
                    {designStyle === s.id && <span style={{ color: '#2563eb', fontSize: 18 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Sections */}
          {step === 'sections' && (
            <div>
              <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600, color: '#f1f5f9' }}>What sections do you need?</h2>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: '#475569' }}>Select all that apply</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {(SECTIONS_BY_TYPE[projectType] || SECTIONS_BY_TYPE.custom).map(s => (
                  <button key={s} onClick={() => toggleSection(s)} style={{
                    padding: '9px 16px', borderRadius: 20, cursor: 'pointer', transition: 'all 0.15s', fontSize: 13, fontWeight: 500,
                    border: `1px solid ${selectedSections.includes(s) ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.06)'}`,
                    background: selectedSections.includes(s) ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.02)',
                    color: selectedSections.includes(s) ? '#a78bfa' : '#475569',
                  }}>
                    {selectedSections.includes(s) ? '✓ ' : ''}{s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Confirm */}
          {step === 'confirm' && (
            <div>
              <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600, color: '#f1f5f9' }}>Ready to generate</h2>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: '#475569' }}>Here's what Corefront will build</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Project', value: `${businessName} — ${PROJECT_TYPES.find(t => t.id === projectType)?.label}` },
                  { label: 'Framework', value: FRAMEWORKS.find(f => f.id === framework)?.label },
                  { label: 'Style', value: DESIGN_STYLES.find(s => s.id === designStyle)?.label },
                  { label: 'Sections', value: selectedSections.join(', ') },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 13, color: '#475569', minWidth: 80 }}>{item.label}</span>
                    <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
              {businessDesc && (
                <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 13, color: '#475569', display: 'block', marginBottom: 4 }}>Description</span>
                  <span style={{ fontSize: 13, color: '#e2e8f0' }}>{businessDesc}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div style={{ fontSize: 13, color: '#ef4444', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={prevStep} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: '11px 24px',
            color: step === 'type' ? '#334155' : '#64748b', fontSize: 14, cursor: step === 'type' ? 'not-allowed' : 'pointer',
          }} disabled={step === 'type'}>
            ← Back
          </button>

          {step !== 'confirm' ? (
            <button onClick={nextStep} disabled={!canProceed()} style={{
              background: canProceed() ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : 'rgba(255,255,255,0.06)',
              color: canProceed() ? '#fff' : '#334155',
              border: 'none', borderRadius: 9, padding: '11px 32px', fontSize: 14, fontWeight: 600,
              cursor: canProceed() ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
            }}>
              Continue →
            </button>
          ) : (
            <button onClick={handleCreate} disabled={loading} style={{
              background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff',
              border: 'none', borderRadius: 9, padding: '11px 32px', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {loading ? (
                <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Generating...</>
              ) : '✦ Generate project'}
            </button>
          )}
        </div>

      </div>
    </>
  )
}
