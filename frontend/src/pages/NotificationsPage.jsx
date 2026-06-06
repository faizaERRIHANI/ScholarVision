import { useState } from 'react'
import { Card, Badge } from '../components/ui'

const MOCK_NOTIFS = [
  { id:'n1', title:'Absence répétée — Youssef Alaoui',      message:'4 absences cette semaine en 3ème B. Contacter la famille urgement.', type:'absence',  priority:'high',   is_read:false, time:'Il y a 2h',  icon:'❌' },
  { id:'n2', title:'Paiement reçu — Famille Mansouri',       message:'2 500 DH reçus pour la scolarité T2 2024–2025. Reçu #RC-2025-0892.', type:'payment',  priority:'low',    is_read:false, time:'Il y a 3h',  icon:'💳' },
  { id:'n3', title:'Personne inconnue détectée',             message:"Détectée à 08h52 à l'entrée principale. Image enregistrée.", type:'face',     priority:'urgent', is_read:false, time:'Il y a 5h',  icon:'🤖' },
  { id:'n4', title:'Bulletins générés — 3ème B',            message:'28 bulletins du Trimestre 2 ont été générés avec succès.', type:'grade',    priority:'medium', is_read:true,  time:'Hier',       icon:'📊' },
  { id:'n5', title:'Nouvel élève inscrit',                   message:'Sara Khalidi inscrite en CE2 A. Documents à compléter.', type:'student',  priority:'low',    is_read:true,  time:'Il y a 2j',  icon:'🎓' },
  { id:'n6', title:'Rappel — Conseil de classe',             message:'Conseil de classe 3ème B le 20/05 à 17h00 en salle A204.', type:'event',    priority:'medium', is_read:true,  time:'Il y a 3j',  icon:'📅' },
  { id:'n7', title:'Maintenance système prévue',             message:'Maintenance le 18/05 de 22h à 23h. Indisponibilité brève.', type:'system',   priority:'low',    is_read:true,  time:'Il y a 4j',  icon:'⚙️' },
]

const PRIORITY_STYLE = {
  urgent: { bg:'rgba(244,63,94,0.1)',  color:'#f43f5e', label:'Urgent'  },
  high:   { bg:'rgba(245,158,11,0.1)', color:'#b45309', label:'Élevé'   },
  medium: { bg:'rgba(26,86,219,0.1)',  color:'#1a56db', label:'Moyen'   },
  low:    { bg:'rgba(100,116,139,0.1)',color:'#64748b', label:'Faible'  },
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS)
  const [filter, setFilter] = useState('all')

  const filtered = notifs.filter(n =>
    filter==='all' || (filter==='unread' && !n.is_read) || (filter==='urgent' && n.priority==='urgent')
  )
  const unreadCount = notifs.filter(n => !n.is_read).length

  const markRead = (id) => setNotifs(prev => prev.map(n => n.id===id ? {...n, is_read:true} : n))
  const markAllRead = () => setNotifs(prev => prev.map(n => ({...n, is_read:true})))
  const deleteNotif = (id) => setNotifs(prev => prev.filter(n => n.id!==id))

  const TABS = [
    { value:'all',    label:'Toutes',   count: notifs.length },
    { value:'unread', label:'Non lues', count: unreadCount },
    { value:'urgent', label:'Urgentes', count: notifs.filter(n=>n.priority==='urgent').length },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      <Card padding={false}>
        {/* Header */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', gap:4 }}>
            {TABS.map(t => (
              <button key={t.value} onClick={() => setFilter(t.value)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:12, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, transition:'all 0.15s',
                  backgroundColor: filter===t.value ? '#1a56db' : 'transparent',
                  color: filter===t.value ? '#fff' : '#64748b' }}>
                {t.label}
                {t.count > 0 && (
                  <span style={{ fontSize:10.5, padding:'1px 6px', borderRadius:99, fontWeight:700,
                    backgroundColor: filter===t.value ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                    color: filter===t.value ? '#fff' : '#64748b' }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              style={{ padding:'7px 14px', borderRadius:10, border:'1px solid #e2e8f0', background:'#fff', color:'#475569', fontSize:12.5, cursor:'pointer' }}>
              ✓ Tout marquer lu
            </button>
          )}
        </div>

        {/* Liste */}
        <div style={{ divide:'1px solid #f8fafc' }}>
          {filtered.length === 0 ? (
            <div style={{ padding:'60px 20px', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🔔</div>
              <p style={{ color:'#94a3b8', fontSize:14 }}>Aucune notification</p>
            </div>
          ) : filtered.map((n, i) => {
            const ps = PRIORITY_STYLE[n.priority]
            return (
              <div key={n.id}
                style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'16px 20px', borderBottom: i<filtered.length-1 ? '1px solid #f8fafc' : 'none',
                  backgroundColor: !n.is_read ? 'rgba(26,86,219,0.025)' : '#fff',
                  transition:'background-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor='#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = !n.is_read ? 'rgba(26,86,219,0.025)' : '#fff'}>

                {/* Icône */}
                <div style={{ width:42, height:42, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0,
                  backgroundColor: !n.is_read ? 'rgba(26,86,219,0.08)' : '#f8fafc' }}>
                  {n.icon}
                </div>

                {/* Contenu */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                    <div style={{ fontWeight: !n.is_read ? 700 : 600, fontSize:13.5, color: !n.is_read ? '#0f172a' : '#334155' }}>
                      {n.title}
                    </div>
                    <span style={{ display:'inline-flex', padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:600, flexShrink:0,
                      backgroundColor: ps.bg, color: ps.color }}>
                      {ps.label}
                    </span>
                  </div>
                  <div style={{ fontSize:12.5, color:'#64748b', marginTop:3, lineHeight:1.5 }}>{n.message}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:8 }}>
                    <span style={{ fontSize:11.5, color:'#94a3b8' }}>{n.time}</span>
                    {!n.is_read && (
                      <button onClick={() => markRead(n.id)}
                        style={{ fontSize:11.5, color:'#1a56db', background:'none', border:'none', cursor:'pointer', fontWeight:500 }}>
                        Marquer lu
                      </button>
                    )}
                    <button onClick={() => deleteNotif(n.id)}
                      style={{ fontSize:11.5, color:'#f43f5e', background:'none', border:'none', cursor:'pointer' }}>
                      Supprimer
                    </button>
                  </div>
                </div>

                {/* Point non lu */}
                {!n.is_read && (
                  <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:'#1a56db', flexShrink:0, marginTop:4 }}/>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
