import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const TITLES = {'/dashboard':'Tableau de bord','/students':'Élèves','/staff':'Personnel','/attendance':'Présences','/grades':'Notes & Bulletins','/schedule':'Emploi du temps','/finance':'Finances','/face-recognition':'IA Faciale','/notifications':'Notifications','/settings':'Paramètres','/profile':'Mon profil'}
const ICONS  = {'/dashboard':'📊','/students':'🎓','/staff':'👨‍🏫','/attendance':'✅','/grades':'📝','/schedule':'📅','/finance':'💳','/face-recognition':'🤖','/notifications':'🔔','/settings':'⚙️','/profile':'👤'}

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [time, setTime] = useState(new Date())
  const [menu, setMenu] = useState(false)
  useEffect(() => { const t = setInterval(()=>setTime(new Date()),1000); return ()=>clearInterval(t) },[])
  const base = '/'+pathname.split('/')[1]
  return (
    <header style={{ position:'fixed', top:0, right:0, left:'var(--sidebar-w)', height:'var(--header-h)', zIndex:40, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', background:'rgba(248,250,252,0.97)', borderBottom:'1px solid #e2e8f0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:20 }}>{ICONS[base]??'🏫'}</span>
        <div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:'#0f172a', margin:0 }}>{TITLES[base]??'ScholarVision'}</h1>
          <p style={{ fontSize:11, color:'#94a3b8', margin:0, textTransform:'capitalize' }}>{time.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</p>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', backgroundColor:'#f1f5f9', borderRadius:12 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', backgroundColor:'#10b981' }}/>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12.5, color:'#475569' }}>{time.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
        </div>
        <button onClick={()=>navigate('/notifications')} style={{ position:'relative', width:36, height:36, borderRadius:12, border:'none', background:'none', cursor:'pointer', fontSize:18 }}>
          🔔<span style={{ position:'absolute', top:-2, right:-2, width:16, height:16, borderRadius:'50%', backgroundColor:'#f43f5e', color:'#fff', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>3</span>
        </button>
        <div style={{ position:'relative' }}>
          <button onClick={()=>setMenu(p=>!p)} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:12, border:'none', background:'none', cursor:'pointer' }}>
            <div style={{ width:28, height:28, borderRadius:10, background:'linear-gradient(135deg,#1a56db,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff' }}>{(user?.first_name?.[0]??'F')}{(user?.last_name?.[0]??'E')}</div>
            <span style={{ fontSize:12.5, color:'#475569' }}>{user?.first_name??'Faiza'}</span>
            <span style={{ color:'#94a3b8', fontSize:10 }}>▾</span>
          </button>
          {menu && (
            <>
              <div style={{ position:'fixed', inset:0, zIndex:10 }} onClick={()=>setMenu(false)}/>
              <div style={{ position:'absolute', right:0, top:'calc(100% + 8px)', width:200, background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', zIndex:20, overflow:'hidden' }}>
                <div style={{ padding:'12px 16px', borderBottom:'1px solid #f8fafc' }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{user?.first_name} {user?.last_name}</div>
                  <div style={{ fontSize:11.5, color:'#94a3b8' }}>{user?.role??'directeur'}</div>
                </div>
                {[{icon:'👤',label:'Mon profil',p:'/profile'},{icon:'⚙️',label:'Paramètres',p:'/settings'}].map(it=>(
                  <button key={it.p} onClick={()=>{navigate(it.p);setMenu(false)}} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 16px', border:'none', background:'none', cursor:'pointer', fontSize:13, color:'#475569', textAlign:'left' }} onMouseEnter={e=>e.currentTarget.style.backgroundColor='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.backgroundColor=''}>{it.icon} {it.label}</button>
                ))}
                <div style={{ borderTop:'1px solid #f8fafc' }}>
                  <button onClick={logout} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 16px', border:'none', background:'none', cursor:'pointer', fontSize:13, color:'#f43f5e', textAlign:'left' }} onMouseEnter={e=>e.currentTarget.style.backgroundColor='#fff5f5'} onMouseLeave={e=>e.currentTarget.style.backgroundColor=''}>⏻ Déconnexion</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
