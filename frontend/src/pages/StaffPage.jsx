import { useState } from 'react'
import { Card, KPICard, Badge, Avatar, Tabs, Modal } from '../components/ui'

const STAFF = [
  { id:'p1', first_name:'Khalid',  last_name:'El Amrani',   role:'enseignant',  specialization:'Mathématiques', contract:'CDI', phone:'06 11 22 33 44', email:'k.elamrani@ecole.ma',  classes:['3ème B','4ème A'], experience:8,  salary:6500 },
  { id:'p2', first_name:'Leila',   last_name:'Fassi',       role:'enseignante', specialization:'Français',      contract:'CDI', phone:'06 22 33 44 55', email:'l.fassi@ecole.ma',     classes:['3ème B','2ème A'], experience:12, salary:7000 },
  { id:'p3', first_name:'Hassan',  last_name:'Tahiri',      role:'enseignant',  specialization:'Sciences',      contract:'CDD', phone:'06 33 44 55 66', email:'h.tahiri@ecole.ma',    classes:['Term. S'],         experience:4,  salary:5500 },
  { id:'p4', first_name:'Amal',    last_name:'Sefrioui',    role:'secretaire',  specialization:'Secrétariat',   contract:'CDI', phone:'06 44 55 66 77', email:'a.sefrioui@ecole.ma',  classes:[],                  experience:6,  salary:5000 },
  { id:'p5', first_name:'Nabil',   last_name:'Cherkaoui',   role:'enseignant',  specialization:'Anglais',       contract:'CDI', phone:'06 55 66 77 88', email:'n.cherkaoui@ecole.ma', classes:['1ère Tech','2nde'],experience:9,  salary:6200 },
  { id:'p6', first_name:'Fatima',  last_name:'Benali',      role:'enseignante', specialization:'Histoire-Géo',  contract:'CDI', phone:'06 66 77 88 99', email:'f.benali@ecole.ma',    classes:['3ème A','4ème B'], experience:15, salary:7500 },
  { id:'p7', first_name:'Youssef', last_name:'Alaoui',      role:'enseignant',  specialization:'Physique-Chimie',contract:'CDD',phone:'06 77 88 99 00', email:'y.alaoui@ecole.ma',    classes:['Term. S'],         experience:3,  salary:5200 },
  { id:'p8', first_name:'Meryem',  last_name:'Lahlou',      role:'enseignante', specialization:'SVT',           contract:'CDI', phone:'06 88 99 00 11', email:'m.lahlou@ecole.ma',    classes:['5ème A','5ème B'], experience:7,  salary:6000 },
]

const ROLE_CONFIG = {
  enseignant:  { label:'Enseignant',  color:'blue'   },
  enseignante: { label:'Enseignante', color:'blue'   },
  secretaire:  { label:'Secrétaire',  color:'violet' },
  direction:   { label:'Direction',   color:'gold'   },
}

const TABS = [
  { value:'all',        label:'Tous',         count: STAFF.length },
  { value:'enseignant', label:'Enseignants',  count: STAFF.filter(s=>s.role.startsWith('enseign')).length },
  { value:'secretaire', label:'Administration',count: STAFF.filter(s=>s.role==='secretaire').length },
]

export default function StaffPage() {
  const [tab, setTab]     = useState('all')
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const filtered = STAFF.filter(s =>
    tab==='all' || s.role.startsWith(tab)
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        <KPICard icon="👨‍🏫" value={STAFF.length}  label="Total personnel"    color="blue"    />
        <KPICard icon="✅"   value={STAFF.filter(s=>s.role.startsWith('enseign')).length} label="Enseignants" color="emerald" />
        <KPICard icon="📅"   value="2"              label="En congé"           color="gold"    />
        <KPICard icon="💼"   value={STAFF.filter(s=>s.contract==='CDI').length} label="CDI" color="violet" />
      </div>

      <Card padding={false}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Tabs tabs={TABS} activeTab={tab} onChange={setTab} />
          <button style={{ padding:'8px 16px', borderRadius:12, border:'none', background:'#1a56db', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            ➕ Ajouter membre
          </button>
        </div>

        <div style={{ padding:20, display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {filtered.map(s => (
            <div key={s.id}
              style={{ border:'1px solid #e2e8f0', borderRadius:18, padding:20, backgroundColor:'#fff', cursor:'pointer', transition:'all 0.2s' }}
              onClick={() => { setSelected(s); setShowModal(true) }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.10)'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow=''; e.currentTarget.style.transform='' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
                <Avatar name={`${s.first_name} ${s.last_name}`} size={48} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14.5, fontWeight:700, color:'#0f172a' }}>{s.first_name} {s.last_name}</div>
                  <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{s.specialization}</div>
                  <Badge color={ROLE_CONFIG[s.role]?.color||'gray'} style={{ fontSize:10.5, marginTop:4 }}>
                    {ROLE_CONFIG[s.role]?.label||s.role}
                  </Badge>
                </div>
              </div>

              {/* Classes */}
              {s.classes.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:12 }}>
                  {s.classes.map(c => (
                    <span key={c} style={{ padding:'2px 8px', borderRadius:6, fontSize:11, backgroundColor:'rgba(26,86,219,0.08)', color:'#1a56db', fontWeight:500 }}>{c}</span>
                  ))}
                </div>
              )}

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, paddingTop:12, borderTop:'1px solid #f8fafc' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:15, fontWeight:700, color:'#0f172a' }}>{s.experience}</div>
                  <div style={{ fontSize:9.5, color:'#94a3b8', marginTop:1 }}>Ans exp.</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#10b981' }}>{s.contract}</div>
                  <div style={{ fontSize:9.5, color:'#94a3b8', marginTop:1 }}>Contrat</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#7c3aed' }}>{s.classes.length}</div>
                  <div style={{ fontSize:9.5, color:'#94a3b8', marginTop:1 }}>Classes</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal détail */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Fiche Personnel" size="md">
        {selected && (
          <div style={{ padding:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, padding:20, borderRadius:16, background:'linear-gradient(135deg,#0b1437,#1a56db)' }}>
              <Avatar name={`${selected.first_name} ${selected.last_name}`} size={56} />
              <div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'#fff' }}>{selected.first_name} {selected.last_name}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginTop:4 }}>{selected.specialization}</div>
                <Badge color={ROLE_CONFIG[selected.role]?.color||'gray'} style={{ marginTop:8 }}>
                  {ROLE_CONFIG[selected.role]?.label}
                </Badge>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16, marginBottom:20 }}>
              {[
                { label:'Email',    value: selected.email,    icon:'📧' },
                { label:'Téléphone',value: selected.phone,    icon:'📱' },
                { label:'Contrat',  value: selected.contract, icon:'📄' },
                { label:'Expérience',value:`${selected.experience} ans`, icon:'⭐' },
                { label:'Salaire',  value:`${selected.salary.toLocaleString()} DH/mois`, icon:'💰' },
                { label:'Classes',  value: selected.classes.join(', ')||'—', icon:'🎓' },
              ].map(item => (
                <div key={item.label} style={{ padding:'12px 14px', borderRadius:12, backgroundColor:'#f8fafc' }}>
                  <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>{item.icon} {item.label}</div>
                  <div style={{ fontSize:13.5, fontWeight:600, color:'#0f172a' }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding:'9px 20px', borderRadius:12, border:'1px solid #e2e8f0', background:'#fff', color:'#475569', fontSize:13, cursor:'pointer' }}>
                Fermer
              </button>
              <button style={{ padding:'9px 20px', borderRadius:12, border:'none', background:'#1a56db', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                ✏️ Modifier
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
