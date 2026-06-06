import { useEffect } from 'react'

export function Button({ children, variant='primary', size='md', loading, disabled, onClick, style={} }) {
  const bg = variant==='primary'?'#1a56db':variant==='danger'?'#f43f5e':variant==='secondary'?'#fff':undefined
  const color = variant==='secondary'?'#475569':'#fff'
  const border = variant==='secondary'?'1px solid #e2e8f0':'none'
  const pad = size==='sm'?'6px 14px':size==='lg'?'12px 24px':'8px 18px'
  return (
    <button onClick={onClick} disabled={disabled||loading}
      style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, padding:pad, fontSize:13.5, fontWeight:600, borderRadius:12, border, backgroundColor:bg, color, cursor:disabled||loading?'not-allowed':'pointer', opacity:disabled||loading?0.5:1, transition:'all 0.15s', ...style }}>
      {loading && <span style={{ width:14, height:14, borderRadius:'50%', border:'2px solid currentColor', borderTopColor:'transparent', display:'inline-block', animation:'spin 0.7s linear infinite' }}/>}
      {children}
    </button>
  )
}

export function Card({ children, padding=true, hover, onClick, style={} }) {
  return (
    <div onClick={onClick}
      style={{ backgroundColor:'#fff', border:'1px solid #e2e8f0', borderRadius:20, boxShadow:'0 1px 3px rgba(0,0,0,0.06)', ...(padding?{padding:20}:{}), ...(hover?{cursor:'pointer',transition:'all 0.2s'}:{}), ...style }}>
      {children}
    </div>
  )
}

export function KPICard({ icon, value, label, trend, progress, color='blue', loading }) {
  const C = { blue:'#1a56db', emerald:'#10b981', gold:'#f59e0b', rose:'#f43f5e', violet:'#7c3aed' }
  const c = C[color]||C.blue
  if (loading) return <div style={{ backgroundColor:'#fff', border:'1px solid #e2e8f0', borderRadius:20, padding:20, height:110 }}/>
  return (
    <Card>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ width:40, height:40, borderRadius:12, backgroundColor:c+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{icon}</div>
        {trend!==undefined && <span style={{ fontSize:12, fontWeight:600, color:trend>=0?'#10b981':'#f43f5e' }}>{trend>=0?'↑':'↓'}{Math.abs(trend)}%</span>}
      </div>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:c }}>{value}</div>
      <div style={{ fontSize:12.5, color:'#64748b', marginTop:4 }}>{label}</div>
      {progress!==undefined && (
        <div style={{ height:5, backgroundColor:'#f1f5f9', borderRadius:99, overflow:'hidden', marginTop:10 }}>
          <div style={{ height:'100%', width:`${progress}%`, backgroundColor:c, borderRadius:99 }}/>
        </div>
      )}
    </Card>
  )
}

export function Badge({ children, color='blue', dot, style={} }) {
  const C = { blue:{bg:'rgba(26,86,219,0.1)',t:'#1a56db'}, emerald:{bg:'rgba(16,185,129,0.1)',t:'#10b981'}, rose:{bg:'rgba(244,63,94,0.1)',t:'#f43f5e'}, gold:{bg:'rgba(245,158,11,0.1)',t:'#b45309'}, violet:{bg:'rgba(124,58,237,0.1)',t:'#7c3aed'}, gray:{bg:'#f1f5f9',t:'#64748b'} }
  const c = C[color]||C.gray
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 10px', borderRadius:99, fontSize:11.5, fontWeight:600, backgroundColor:c.bg, color:c.t, ...style }}>
      {dot && <span style={{ width:6, height:6, borderRadius:'50%', backgroundColor:'currentColor', opacity:0.7 }}/>}
      {children}
    </span>
  )
}

export function Alert({ type='info', children, onClose }) {
  const C = { info:{bg:'rgba(26,86,219,0.06)',b:'rgba(26,86,219,0.2)',c:'#1a56db'}, success:{bg:'rgba(16,185,129,0.06)',b:'rgba(16,185,129,0.2)',c:'#10b981'}, warning:{bg:'rgba(245,158,11,0.08)',b:'rgba(245,158,11,0.25)',c:'#b45309'}, danger:{bg:'rgba(244,63,94,0.06)',b:'rgba(244,63,94,0.2)',c:'#f43f5e'} }
  const s = C[type]||C.info
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:14, border:`1px solid ${s.b}`, backgroundColor:s.bg, color:s.c, fontSize:13 }}>
      <span style={{ flex:1 }}>{children}</span>
      {onClose && <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'inherit', opacity:0.6, fontSize:14 }}>✕</button>}
    </div>
  )
}

export function Modal({ isOpen, onClose, title, children, size='md' }) {
  const W = { sm:400, md:500, lg:640, xl:768 }
  useEffect(() => { document.body.style.overflow = isOpen?'hidden':''; return ()=>{document.body.style.overflow=''} }, [isOpen])
  if (!isOpen) return null
  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ position:'absolute', inset:0, backgroundColor:'rgba(15,23,42,0.5)' }} onClick={onClose}/>
      <div style={{ position:'relative', width:'100%', maxWidth:W[size]||500, backgroundColor:'#fff', borderRadius:20, boxShadow:'0 20px 60px rgba(0,0,0,0.15)', overflow:'hidden' }}>
        {title && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderBottom:'1px solid #f1f5f9' }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, margin:0 }}>{title}</h3>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#94a3b8' }}>✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function Input({ label, hint, error, type='text', disabled, style={}, ...p }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      {label && <label style={{ fontSize:13, fontWeight:600, color:'#334155' }}>{label}</label>}
      <input type={type} disabled={disabled}
        style={{ width:'100%', border:`1px solid ${error?'#f87171':'#e2e8f0'}`, borderRadius:12, padding:'10px 14px', fontSize:13.5, outline:'none', backgroundColor:disabled?'#f8fafc':'#fff', boxSizing:'border-box', ...style }} {...p}/>
      {hint&&!error && <p style={{ fontSize:11.5, color:'#94a3b8', margin:0 }}>{hint}</p>}
      {error && <p style={{ fontSize:11.5, color:'#f43f5e', margin:0 }}>{error}</p>}
    </div>
  )
}

export function Select({ label, options=[], error, style={}, ...p }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      {label && <label style={{ fontSize:13, fontWeight:600, color:'#334155' }}>{label}</label>}
      <select style={{ width:'100%', border:`1px solid ${error?'#f87171':'#e2e8f0'}`, borderRadius:12, padding:'10px 14px', fontSize:13.5, outline:'none', backgroundColor:'#fff', boxSizing:'border-box', ...style }} {...p}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div style={{ display:'flex', gap:4 }}>
      {tabs.map(t => (
        <button key={t.value} onClick={() => onChange(t.value)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', fontSize:13, fontWeight:500, borderRadius:12, border:'none', cursor:'pointer', backgroundColor:activeTab===t.value?'#1a56db':'transparent', color:activeTab===t.value?'#fff':'#64748b', transition:'all 0.15s' }}
          onMouseEnter={e => { if(activeTab!==t.value) e.currentTarget.style.backgroundColor='#f1f5f9' }}
          onMouseLeave={e => { if(activeTab!==t.value) e.currentTarget.style.backgroundColor='transparent' }}>
          {t.icon && <span>{t.icon}</span>}
          {t.label}
          {t.count!==undefined && (
            <span style={{ fontSize:10, padding:'1px 6px', borderRadius:99, fontWeight:700, backgroundColor:activeTab===t.value?'rgba(255,255,255,0.25)':'#e2e8f0', color:activeTab===t.value?'#fff':'#64748b' }}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', gap:12 }}>
      {label && <span style={{ fontSize:13.5, color:'#334155' }}>{label}</span>}
      <div onClick={() => onChange(!checked)}
        style={{ position:'relative', width:44, height:24, borderRadius:99, backgroundColor:checked?'#1a56db':'#cbd5e1', transition:'background-color 0.2s', flexShrink:0 }}>
        <span style={{ position:'absolute', top:2, left:checked?22:2, width:20, height:20, borderRadius:'50%', backgroundColor:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'left 0.2s' }}/>
      </div>
    </label>
  )
}

export function Avatar({ name='', src, size=40 }) {
  const colors = ['#1a56db','#7c3aed','#10b981','#f59e0b','#f43f5e']
  const bg = colors[(name.charCodeAt(0)||0)%colors.length]
  const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  return src
    ? <img src={src} alt={name} style={{ width:size, height:size, borderRadius:12, objectFit:'cover', flexShrink:0 }}/>
    : <div style={{ width:size, height:size, borderRadius:12, backgroundColor:bg, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:size*0.35, flexShrink:0 }}>{initials||'?'}</div>
}

export function Table({ columns, data, loading, emptyMessage='Aucune donnée', onRowClick }) {
  if (loading) return <div style={{ padding:16 }}>{[...Array(4)].map((_,i)=><div key={i} style={{ height:48, backgroundColor:'#f1f5f9', borderRadius:12, marginBottom:8 }}/>)}</div>
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ borderBottom:'1px solid #f1f5f9' }}>
            {columns.map(c => <th key={c.key} style={{ padding:'12px 16px', textAlign:'left', fontSize:11.5, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em' }}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.length===0
            ? <tr><td colSpan={columns.length} style={{ padding:'48px 16px', textAlign:'center', color:'#94a3b8' }}>{emptyMessage}</td></tr>
            : data.map((row,i) => (
              <tr key={row.id??i} onClick={() => onRowClick?.(row)}
                style={{ borderBottom:'1px solid #f8fafc', cursor:onRowClick?'pointer':'default' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor='#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor=''}>
                {columns.map(c => <td key={c.key} style={{ padding:'12px 16px', fontSize:13, color:'#334155' }}>{c.render?c.render(row[c.key],row):row[c.key]}</td>)}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages<=1) return null
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, padding:'12px 0' }}>
      <button onClick={()=>onChange(page-1)} disabled={page===1} style={{ width:32, height:32, borderRadius:10, border:'none', background:'none', cursor:'pointer', color:'#64748b', opacity:page===1?0.3:1 }}>‹</button>
      {[...Array(Math.min(totalPages,7))].map((_,i) => (
        <button key={i} onClick={()=>onChange(i+1)}
          style={{ width:32, height:32, borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, backgroundColor:page===i+1?'#1a56db':'transparent', color:page===i+1?'#fff':'#475569' }}>
          {i+1}
        </button>
      ))}
      <button onClick={()=>onChange(page+1)} disabled={page===totalPages} style={{ width:32, height:32, borderRadius:10, border:'none', background:'none', cursor:'pointer', color:'#64748b', opacity:page===totalPages?0.3:1 }}>›</button>
    </div>
  )
}
