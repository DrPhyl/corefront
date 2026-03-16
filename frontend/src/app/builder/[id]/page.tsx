'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

interface Project {
  id: number
  name: string
  prompt: string
  framework: string
  status: string
  generated_code: string | null
}

interface Message {
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface FileNode {
  name: string
  content: string
  language: string
}

function parseFiles(raw: string): FileNode[] {
  if (!raw) return []
  const files: FileNode[] = []
  const regex = /```(\w+)?\s*\/\/\s*([^\n]+)\n([\s\S]*?)```/g
  let match
  while ((match = regex.exec(raw)) !== null) {
    files.push({ language: match[1] || 'text', name: match[2].trim(), content: match[3].trim() })
  }
  if (files.length === 0 && raw.length > 0) {
    files.push({ name: 'output.txt', content: raw, language: 'text' })
  }
  return files
}

function getLangColor(lang: string): string {
  const c: Record<string, string> = { tsx: '#61dafb', ts: '#3178c6', jsx: '#61dafb', js: '#f7df1e', py: '#3572A5', python: '#3572A5', css: '#563d7c', html: '#e34c26' }
  return c[lang] || '#94a3b8'
}

export default function BuilderPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [files, setFiles] = useState<FileNode[]>([])
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code')
  const [previewHtml, setPreviewHtml] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const buildPreview = () => {
    if (!files.length) return

    // Find HTML file by extension or by content starting with <!DOCTYPE or <html
    const htmlFile = files.find(f =>
      f.name.endsWith('.html') ||
      f.content.trimStart().startsWith('<!DOCTYPE') ||
      f.content.trimStart().startsWith('<html')
    )

    if (htmlFile) {
      setPreviewHtml(htmlFile.content)
      return
    }

    // Check if any file content looks like HTML
    const anyHtml = files.find(f => f.content.includes('<body') || f.content.includes('<div'))
    if (anyHtml) {
      setPreviewHtml(anyHtml.content)
      return
    }

    // Fall back to wrapping JSX/TSX in a React app
    const tsxFile = files.find(f => ['tsx','jsx','ts','js'].includes(f.language) || f.name.match(/\.(tsx|jsx|ts|js)$/))
    if (tsxFile) {
      setPreviewHtml(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel">
    ${tsxFile.content}
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App || (() => <div>No default export found</div>)));
  </script>
</body>
</html>`)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/login'); return }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then((p: Project) => {
        setProject(p)
        if (p.generated_code) {
          const parsed = parseFiles(p.generated_code)
          setFiles(parsed)
          if (parsed.length > 0) setSelectedFile(parsed[0])
          setTimeout(() => buildPreview(), 0)
          setMessages([
            { role: 'user', content: p.prompt, timestamp: new Date() },
            { role: 'ai', content: p.generated_code, timestamp: new Date() },
          ])
        } else {
          setMessages([{ role: 'user', content: p.prompt, timestamp: new Date() }])
        }
      })
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return
    const token = localStorage.getItem('access_token')
    setMessages(prev => [...prev, { role: 'user', content: prompt, timestamp: new Date() }])
    setPrompt('')
    setGenerating(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/generate/regenerate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ project_id: Number(id), prompt }),
      })
      if (res.status === 402) {
        setMessages(prev => [...prev, { role: 'ai', content: '⚠ Free plan limit reached. Upgrade to Pro to continue.', timestamp: new Date() }])
        return
      }
      const data = await res.json()
      const code = data.generated_code || data.code || JSON.stringify(data)
      const parsed = parseFiles(code)
      setFiles(parsed)
      if (parsed.length > 0) setSelectedFile(parsed[0])
      setMessages(prev => [...prev, { role: 'ai', content: code, timestamp: new Date() }])
      setTimeout(() => buildPreview(), 0)
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: '⚠ Generation failed. Please try again.', timestamp: new Date() }])
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!selectedFile) return
    navigator.clipboard.writeText(selectedFile.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const content = files.map(f => `// ${f.name}\n${f.content}`).join('\n\n---\n\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project?.name || 'project'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#070b14', color: '#475569', fontSize: 14 }}>
      Loading...
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070b14; overflow: hidden; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        pre { margin:0; white-space:pre-wrap; word-break:break-word; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:99px; }
      `}</style>

      <div style={{ display:'flex', height:'100vh', background:'#070b14', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>

        {/* LEFT: Chat */}
        <div style={{ width:380, minWidth:380, height:'100vh', background:'#0a0f1e', borderRight:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column' }}>

          {/* Header */}
          <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:12 }}>
            <Link href="/dashboard" style={{ color:'#475569', textDecoration:'none', fontSize:18, lineHeight:1 }}>←</Link>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'#f1f5f9', fontFamily:'"Instrument Serif",Georgia,serif', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {project?.name || 'Builder'}
              </div>
              <div style={{ fontSize:11, color:'#334155', marginTop:2 }}>
                {project?.framework} · {files.length} file{files.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth:'85%', padding:'10px 14px',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: msg.role === 'user' ? 'rgba(37,99,235,0.2)' : '#0d1427',
                  border:`1px solid ${msg.role === 'user' ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  fontSize:13, color:'#cbd5e1', lineHeight:1.55, wordBreak:'break-word',
                }}>
                  {msg.role === 'ai' && msg.content.includes('```')
                    ? <span style={{ color:'#64748b', fontStyle:'italic' }}>✓ Generated {files.length} file{files.length !== 1 ? 's' : ''} — see code panel →</span>
                    : msg.content.slice(0, 300) + (msg.content.length > 300 ? '...' : '')}
                </div>
              </div>
            ))}
            {generating && (
              <div style={{ display:'flex' }}>
                <div style={{ padding:'10px 14px', borderRadius:'12px 12px 12px 4px', background:'#0d1427', border:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:4, alignItems:'center' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#2563eb', animation:`blink 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ background:'#0d1427', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate() }}
                placeholder="Describe what to build or change..."
                rows={3}
                style={{ background:'transparent', border:'none', outline:'none', color:'#e2e8f0', fontSize:13, lineHeight:1.55, resize:'none', fontFamily:'inherit', width:'100%' }}
              />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:11, color:'#334155' }}>⌘↵ to generate</span>
                <button onClick={handleGenerate} disabled={!prompt.trim() || generating} style={{
                  background: prompt.trim() && !generating ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : 'rgba(255,255,255,0.06)',
                  color: prompt.trim() && !generating ? '#fff' : '#334155',
                  border:'none', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:600,
                  cursor: prompt.trim() && !generating ? 'pointer' : 'not-allowed',
                  display:'flex', alignItems:'center', gap:6,
                }}>
                  {generating
                    ? <><div style={{ width:12, height:12, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Generating...</>
                    : 'Generate →'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Code */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>

          {/* Top bar */}
          <div style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:12, background:'#0a0f1e', flexShrink:0 }}>
            <div style={{ display:'flex', gap:6 }}>
              {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width:12, height:12, borderRadius:'50%', background:c, opacity:0.7 }} />)}
            </div>
            <div style={{ display:'flex', gap:2, background:'rgba(255,255,255,0.04)', borderRadius:8, padding:3 }}>
              {(['code','preview'] as const).map(mode => (
                <button key={mode} onClick={() => { setViewMode(mode); if(mode==='preview') buildPreview() }} style={{
                  padding:'5px 14px', borderRadius:6, border:'none', cursor:'pointer', fontSize:12, fontWeight:500,
                  background: viewMode === mode ? '#1e2d4a' : 'transparent',
                  color: viewMode === mode ? '#e2e8f0' : '#475569',
                  transition:'all 0.15s',
                  textTransform:'capitalize',
                }}>{mode}</button>
              ))}
            </div>
            <span style={{ fontSize:13, color:'#475569', flex:1, fontFamily:'monospace' }}>{selectedFile?.name || 'No file selected'}</span>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={handleCopy} disabled={!selectedFile} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:7, padding:'5px 12px', color: copied ? '#22c55e' : '#64748b', fontSize:12, cursor: selectedFile ? 'pointer' : 'not-allowed' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <button onClick={handleDownload} disabled={files.length === 0} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:7, padding:'5px 12px', color:'#64748b', fontSize:12, cursor: files.length > 0 ? 'pointer' : 'not-allowed' }}>
                Download all
              </button>
            </div>
          </div>

          {viewMode === 'code' ? (
            <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

              {/* File tree */}
              {files.length > 0 && (
                <div style={{ width:200, borderRight:'1px solid rgba(255,255,255,0.05)', overflowY:'auto', padding:'12px 0', background:'#0a0f1e', flexShrink:0 }}>
                  <div style={{ padding:'4px 16px 8px', fontSize:10, fontWeight:600, color:'#334155', textTransform:'uppercase', letterSpacing:'0.08em' }}>Files</div>
                  {files.map((f, i) => (
                    <button key={i} onClick={() => setSelectedFile(f)} style={{
                      display:'flex', alignItems:'center', gap:8, width:'100%', padding:'7px 16px',
                      border:'none', textAlign:'left', cursor:'pointer', fontFamily:'monospace',
                      background: selectedFile?.name === f.name ? 'rgba(37,99,235,0.12)' : 'transparent',
                      borderLeft:`2px solid ${selectedFile?.name === f.name ? '#2563eb' : 'transparent'}`,
                      color: selectedFile?.name === f.name ? '#e2e8f0' : '#64748b',
                      fontSize:12, transition:'all 0.15s',
                    }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background:getLangColor(f.language), flexShrink:0 }} />
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Code viewer */}
              <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', background:'#070b14' }}>
                {selectedFile ? (
                  <pre style={{ fontSize:13, color:'#cbd5e1', lineHeight:1.7, fontFamily:'"Fira Code","Cascadia Code",monospace' }}>
                    {selectedFile.content}
                  </pre>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#334155', textAlign:'center', gap:12 }}>
                    <div style={{ fontSize:40 }}>⌨</div>
                    <div style={{ fontSize:15, fontWeight:500, color:'#475569' }}>Ready to generate</div>
                    <div style={{ fontSize:13, color:'#334155', maxWidth:280, lineHeight:1.6 }}>Type a prompt in the chat panel and click Generate.</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ flex:1, overflow:'hidden', background:'#fff' }}>
              {previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  style={{ width:'100%', height:'100%', border:'none' }}
                  sandbox="allow-scripts allow-same-origin"
                  title="Preview"
                />
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#94a3b8', gap:8, background:'#070b14' }}>
                  <div style={{ fontSize:32 }}>👁</div>
                  <div style={{ fontSize:14 }}>Generate code first to see a preview</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
