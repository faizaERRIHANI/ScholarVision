import { useState } from 'react'
import { KPICard, Card, Badge, Avatar, Modal } from '../components/ui'

const CLASSES = ['Toutes','3ème B','CE2 A','Term. S','5ème A','CM2 B']
const TODAY = new Date().toISOString().split('T')[0]

const MOCK_ATTENDANCE = [
  { id:'a1', name:'Karim Mansouri',    class:'3ème B', time:'07:28', status:'present',  method:'facial',  confidence:98.4 },
  { id:'a2', name:'Sara Khalidi',      class:'3ème B', time:'07:31', status:'present',  method:'facial',  confidence:96.1 },
  { id:'a3', name:'Youssef Alaoui',    class:'3ème B', time:'—',     status:'absent',   method:'—',       confidence:null },
  { id:'a4', name:'Fatima Benali',     class:'CE2 A',  time:'07:45', status:'present',  method:'manuel',  confidence:null },
  { id:'a5', name:'Ahmed El Fassi',    class:'5ème A', time:'08:12', status:'retard',   method:'facial',  confidence:94.2 },
  { id:'a6', name:'Leila Tahiri',      class:'Term. S',time:'07:29', status:'present',  method:'facial',  confidence:99.1 },
  { id:'a7', name:'Omar Cherkaoui',    class:'CM2 B',  time:'—',     status:'absent',   method:'—',       confidence:null },
  { id:'a8', name:'Nadia Benmoussa',   class:'4ème A', time:'07:55', status:'present',  method:'facial',  confidence:97.3 },
  { id:'a9', name:'Hassan Idrissi',    class:'3ème B', time:'07:33', status:'present',  method:'facial',  confidence:95.8 },
  { id:'a10',name:'Meryem Lahlou',     class:'6ème C', time:'—',     status:'justifié', method:'—',       confidence:null },
]

const STATUS_CONFIG = {
  present:  { label:'Présent',  color:'emerald', bg:'rgba(16,185,129,0.1)',  text:'#10b981' },
  absent:   { label:'Absent',   color:'rose',    bg:'rgba(244,63,94,0.1)',   text:'#f43f5e' },
  retard:   { label:'Retard',   color:'gold',    bg:'rgba(245,158,11,0.1)',  text:'#b45309' },
  justifié: { label:'Justifié', color:'blue',    bg:'rgba(26,86,219,0.1)',   text:'#1a56db' },
}

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState('Toutes')
  const [date, setDate]         = useState(TODAY)
  const [showJustify, setShowJustify] = useState(false)
  const [selected, setSelected] = useState(null)
  const [justifyText, setJustifyText] = useState('')

  const filtered = MOCK_ATTENDANCE.filter(a =>
    selectedClass==='Toutes' || a.class===selectedClass
  )

  const stats = {
    present:  filtered.filter(a=>a.status==='present').length,
    absent:   filtered.filter(a=>a.status==='absent').length,
    retard:   filtered.filter(a=>a.status==='retard').length,
    justifié: filtered.filter(a=>a.status==='justifié').length,
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        <KPICard icon="✅" value={stats.present}  label="Présents"   color="emerald" progress={Math.round(stats.present/filtered.length*100)}/>
        <KPICard icon="❌" value={stats.absent}   label="Absents"    color="rose"    />
        <KPICard icon="⏰" value={stats.retard}   label="Retards"    color="gold"    />
        <KPICard icon="📋" value={stats.justifié} label="Justifiés"  color="blue"    />
      </div>

      {/* Filtres */}
      <Card>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#64748b', display:'block', marginBottom:4 }}>DATE</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              style={{ border:'1px solid #e2e8f0', borderRadius:10, padding:'7px 12px', fontSize:13, outline:'none' }}/>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#64748b', display:'block', marginBottom:4 }}>CLASSE</label>
            <select value={selectedClass} onChange={e=>setSelectedClass(e.target.value)}
              style={{ border:'1px solid #e2e8f0', borderRadius:10, padding:'7px 12px', fontSize:13, outline:'none', backgroundColor:'#fff' }}>
              {CLASSES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            <button style={{ padding:'8px 16px', borderRadius:12, border:'1px solid #e2e8f0', background:'#fff', color:'#475569', fontSize:13, cursor:'pointer' }}>
              📤 Exporter CSV
            </button>
            <button style={{ padding:'8px 16px', borderRadius:12, border:'none', background:'#1a56db', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              ✏️ Saisie manuelle
            </button>
          </div>
        </div>
      </Card>

      {/* Tableau */}
      <Card padding={false}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, margin:0 }}>
            Registre du {new Date(date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
          </h3>
          <span style={{ fontSize:12.5, color:'#94a3b8' }}>{filtered.length} élèves</span>
        </div>

        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #f1f5f9' }}>
              {['Élève','Classe','Heure','Statut','Méthode','Action'].map(h=>(
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11.5, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const sc = STATUS_CONFIG[a.status]
              return (
                <tr key={a.id} style={{ borderBottom:'1px solid #f8fafc' }}
                  onMouseEnter={e=>e.currentTarget.style.backgroundColor='#f8fafc'}
                  onMouseLeave={e=>e.currentTarget.style.backgroundColor=''}>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <Avatar name={a.name} size={34}/>
                      <span style={{ fontSize:13, fontWeight:500 }}>{a.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px' }}><Badge color="blue" style={{ fontSize:11 }}>{a.class}</Badge></td>
                  <td style={{ padding:'12px 16px', fontSize:13, fontFamily:"'JetBrains Mono',monospace", color:a.time==='—'?'#cbd5e1':'#0f172a', fontWeight:500 }}>{a.time}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:99, fontSize:12, fontWeight:600, backgroundColor:sc.bg, color:sc.text }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:12, color:'#64748b' }}>
                    {a.method==='facial' ? (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                        🤖 IA <span style={{ fontSize:11, color:'#10b981' }}>({a.confidence}%)</span>
                      </span>
                    ) : a.method==='manuel' ? '✏️ Manuel' : '—'}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    {a.status==='absent' && (
                      <button onClick={()=>{setSelected(a);setShowJustify(true)}}
                        style={{ padding:'5px 12px', borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', fontSize:12, cursor:'pointer', color:'#475569' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='#1a56db';e.currentTarget.style.color='#1a56db'}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.color='#475569'}}>
                        Justifier
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Résumé bas */}
        <div style={{ padding:'14px 20px', borderTop:'1px solid #f1f5f9', display:'flex', gap:20 }}>
          {Object.entries(stats).map(([k,v])=>(
            <div key={k} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:STATUS_CONFIG[k]?.text }}/>
              <span style={{ fontSize:12.5, color:'#64748b' }}>{STATUS_CONFIG[k]?.label} : <strong>{v}</strong></span>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal justification */}
      <Modal isOpen={showJustify} onClose={()=>setShowJustify(false)} title="Justifier une absence" size="sm">
        <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
          {selected && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:12, backgroundColor:'#f8fafc' }}>
              <Avatar name={selected.name} size={36}/>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{selected.name}</div>
                <div style={{ fontSize:12, color:'#94a3b8' }}>{selected.class} · {date}</div>
              </div>
            </div>
          )}
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:'#334155', display:'block', marginBottom:6 }}>Motif de justification</label>
            <textarea value={justifyText} onChange={e=>setJustifyText(e.target.value)}
              placeholder="Maladie, rendez-vous médical, raison familiale…" rows={3}
              style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13, outline:'none', resize:'none', boxSizing:'border-box' }}/>
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:'#334155', display:'block', marginBottom:6 }}>Document justificatif (optionnel)</label>
            <div style={{ border:'2px dashed #e2e8f0', borderRadius:12, padding:'20px', textAlign:'center', cursor:'pointer' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#1a56db'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#e2e8f0'}>
              <div style={{ fontSize:24, marginBottom:6 }}>📎</div>
              <p style={{ fontSize:12.5, color:'#94a3b8', margin:0 }}>Glissez un fichier ou cliquez pour choisir</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button onClick={()=>setShowJustify(false)}
              style={{ padding:'8px 18px', borderRadius:12, border:'1px solid #e2e8f0', background:'#fff', color:'#475569', fontSize:13, cursor:'pointer' }}>
              Annuler
            </button>
            <button onClick={()=>setShowJustify(false)}
              style={{ padding:'8px 18px', borderRadius:12, border:'none', background:'#1a56db', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              ✅ Valider
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
