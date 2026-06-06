import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const NAV = [
  { section:'Principal', items:[
    { path:'/dashboard',     icon:'📊', label:'Tableau de bord' },
    { path:'/notifications', icon:'🔔', label:'Notifications', badge:3 },
  ]},
  { section:'Académique', items:[
    { path:'/students',   icon:'🎓', label:'Élèves', badge:317 },
    { path:'/staff',      icon:'👨‍🏫', label:'Personnel' },
    { path:'/grades',     icon:'📝', label:'Notes & Bulletins' },
    { path:'/attendance', icon:'✅', label:'Présences' },
    { path:'/schedule',   icon:'📅', label:'Emploi du temps' },
  ]},
  { section:'Administration', items:[
    { path:'/finance',          icon:'💳', label:'Finances' },
    { path:'/face-recognition', icon:'🤖', label:'IA Faciale' },
  ]},
  { section:'Système', items:[
    { path:'/settings', icon:'⚙️', label:'Paramètres' },
    { path:'/profile',  icon:'👤', label:'Mon profil' },
  ]},
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <aside style={{ position:'fixed', top:0, left:0, height:'100%', width:'var(--sidebar-w)', backgroundColor:'#0b1437', display:'flex', flexDirection:'column', zIndex:50 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:20, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width:36, height:36, borderRadius:12, background:'linear-gradient(135deg,#1a56db,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:18 }}>E</div>
        <div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, color:'#fff' }}>ScholarVision</div>
          <div style={{ fontSize:9.5, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>Gestion Scolaire</div>
        </div>
      </div>
      <div style={{ margin:'12px', padding:'8px 12px', borderRadius:12, background:'rgba(26,86,219,0.15)', border:'1px solid rgba(26,86,219,0.25)', textAlign:'center' }}>
        <span style={{ fontSize:11, fontWeight:600, color:'#93c5fd' }}>📅 Année 2024–2025</span>
      </div>
      <nav style={{ flex:1, overflowY:'auto', padding:'12px' }}>
        {NAV.map(({ section, items }) => (
          <div key={section} style={{ marginBottom:16 }}>
            <p style={{ fontSize:9.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(255,255,255,0.28)', padding:'0 12px', marginBottom:4 }}>{section}</p>
            {items.map(({ path, icon, label, badge }) => (
              <NavLink key={path} to={path}
                style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap:12, padding:'10px 12px',
                  borderRadius:12, marginBottom:2, textDecoration:'none', fontSize:13, fontWeight:500,
                  ...(isActive
                    ? { background:'linear-gradient(90deg,rgba(26,86,219,0.4),rgba(26,86,219,0.15))', borderLeft:'3px solid #3b82f6', color:'#fff' }
                    : { color:'rgba(255,255,255,0.5)' })
                })}>
                <span style={{ fontSize:15, width:20, textAlign:'center' }}>{icon}</span>
                <span style={{ flex:1 }}>{label}</span>
                {badge && <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:99, backgroundColor:'#1a56db', color:'#fff' }}>{badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div style={{ padding:12, borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12, cursor:'pointer' }}
          onClick={() => navigate('/profile')}
          onMouseEnter={e => e.currentTarget.style.backgroundColor='rgba(255,255,255,0.07)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor=''}>
          <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#1a56db,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
            {(user?.first_name?.[0]??'F')}{(user?.last_name?.[0]??'E')}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12.5, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.first_name??'Faiza'} {user?.last_name??'ERRIHANI'}
            </div>
            <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.38)', textTransform:'capitalize' }}>{user?.role??'directeur'}</div>
          </div>
          <button onClick={e => { e.stopPropagation(); logout() }}
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color:'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.color='#f43f5e'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>⏻</button>
        </div>
      </div>
    </aside>
  )
}
