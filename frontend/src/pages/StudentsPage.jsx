import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { KPICard, Card, Badge, Avatar, Tabs } from '../components/ui'

const ALL_STUDENTS = Array.from({ length: 40 }, (_, i) => {
  const firstNames = ['Karim','Sara','Youssef','Fatima','Ahmed','Leila','Omar','Nadia','Hassan','Meryem','Amine','Zineb','Khalid','Rim','Hamza','Hajar','Bilal','Soumia','Tarik','Amina','Mehdi','Loubna','Rachid','Salma','Driss','Houda','Mourad','Khadija','Saad','Nawal','Ayoub','Chaimae','Reda','Hafsa','Nabil','Asma','Hicham','Sanae','Othmane','Malak']
  const lastNames  = ['Mansouri','Khalidi','Alaoui','Benali','El Fassi','Tahiri','Cherkaoui','Benmoussa','Idrissi','Lahlou','Zouiten','Amrani','Berrada','Kettani','El Ouali','Benjelloun','Tazi','Chraibi','Sebti','Fassi Fihri','El Mrini','Bensouda','Chaoui','Ghali','Senhaji','El Alami','Ouazzani','Bouhout','El Harti','Lamrani']
  const classes    = ['3ème B','2ème A','Term. S','CE2 A','5ème A','1ère Tech','CM2 B','4ème A','Term. L','6ème C','3ème A','2nde','CM1 A','4ème B','1ère S','CE1 B','3ème C','Term. ES','5ème B','6ème A']
  const levels     = ['collège','lycée','lycée','primaire','collège','lycée','primaire','collège','lycée','collège','collège','lycée','primaire','collège','lycée','primaire','collège','lycée','collège','collège']
  const ci         = i % classes.length
  return {
    id: `s${i+1}`,
    student_number: `EL-2024-${String(i+1).padStart(4,'0')}`,
    first_name:  firstNames[i % firstNames.length],
    last_name:   lastNames[i % lastNames.length],
    class_name:  classes[ci],
    level:       levels[ci],
    average:     Math.round((9 + Math.random()*9) * 10) / 10,
    attendance:  Math.floor(70 + Math.random()*30),
    rank:        Math.floor(1 + Math.random()*28),
    status:      'active',
  }
})

const TABS = [
  { value:'all',      label:'Tous',     count: ALL_STUDENTS.length },
  { value:'primaire', label:'Primaire', count: ALL_STUDENTS.filter(s=>s.level==='primaire').length },
  { value:'collège',  label:'Collège',  count: ALL_STUDENTS.filter(s=>s.level==='collège').length },
  { value:'lycée',    label:'Lycée',    count: ALL_STUDENTS.filter(s=>s.level==='lycée').length },
]

const avgColor = v => v>=16?'#10b981':v>=12?'#1a56db':v>=10?'#f59e0b':'#f43f5e'
const PER_PAGE = 12

export default function StudentsPage() {
  const navigate = useNavigate()
  const [tab, setTab]     = useState('all')
  const [search, setSearch] = useState('')
  const [view, setView]   = useState('grid')
  const [page, setPage]   = useState(1)

  // Reset page quand tab ou search change
  const handleTab = v => { setTab(v); setPage(1) }
  const handleSearch = e => { setSearch(e.target.value); setPage(1) }

  const filtered = useMemo(() => ALL_STUDENTS.filter(s =>
    (tab==='all' || s.level===tab) &&
    (!search || `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()))
  ), [tab, search])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        <KPICard icon="🎓" value={ALL_STUDENTS.length} label="Total élèves"     color="blue"    progress={78}   />
        <KPICard icon="✅" value="291"                  label="Présents"          color="emerald" progress={91.8} />
        <KPICard icon="📊" value="13.8"                 label="Moyenne générale"  color="violet"  />
        <KPICard icon="⚠️" value="12"                   label="Paiements retard"  color="rose"    />
      </div>

      <Card padding={false}>
        {/* Toolbar */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <Tabs tabs={TABS} activeTab={tab} onChange={handleTab} />
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}>🔍</span>
              <input value={search} onChange={handleSearch} placeholder="Rechercher…"
                style={{ border:'1px solid #e2e8f0', borderRadius:12, padding:'8px 14px 8px 34px', fontSize:13, outline:'none', width:200 }}
                onFocus={e=>e.target.style.borderColor='#1a56db'}
                onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
            </div>
            <div style={{ display:'flex', border:'1px solid #e2e8f0', borderRadius:10, overflow:'hidden' }}>
              {[{v:'grid',i:'⊞'},{v:'table',i:'☰'}].map(b=>(
                <button key={b.v} onClick={()=>{setView(b.v);setPage(1)}}
                  style={{ padding:'7px 12px', border:'none', cursor:'pointer', fontSize:16, backgroundColor:view===b.v?'#1a56db':'#fff', color:view===b.v?'#fff':'#94a3b8' }}>
                  {b.i}
                </button>
              ))}
            </div>
            <button onClick={()=>navigate('/students/new')}
              style={{ padding:'8px 16px', borderRadius:12, border:'none', background:'#1a56db', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              ➕ Ajouter
            </button>
            <button style={{ padding:'8px 14px', borderRadius:12, border:'1px solid #e2e8f0', background:'#fff', color:'#475569', fontSize:13, cursor:'pointer' }}>
              📤 Export
            </button>
          </div>
        </div>

        {/* Vue grille */}
        {view==='grid' && (
          <div style={{ padding:20, display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(195px,1fr))', gap:14 }}>
            {paginated.map(s => (
              <div key={s.id} onClick={()=>navigate(`/students/${s.id}`)}
                style={{ border:'1px solid #e2e8f0', borderRadius:16, padding:16, cursor:'pointer', backgroundColor:'#fff', transition:'all 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.10)';e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow='';e.currentTarget.style.transform=''}}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <Avatar name={`${s.first_name} ${s.last_name}`} size={38}/>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.first_name} {s.last_name}</div>
                    <div style={{ fontSize:10, color:'#94a3b8', fontFamily:"'JetBrains Mono',monospace" }}>{s.student_number}</div>
                  </div>
                </div>
                <Badge color="blue" style={{ fontSize:10.5 }}>{s.class_name}</Badge>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4, marginTop:10, paddingTop:10, borderTop:'1px solid #f8fafc', textAlign:'center' }}>
                  <div><div style={{ fontSize:13, fontWeight:700, color:avgColor(s.average) }}>{s.average}</div><div style={{ fontSize:9, color:'#94a3b8' }}>Moy.</div></div>
                  <div><div style={{ fontSize:13, fontWeight:700, color:'#10b981' }}>{s.attendance}%</div><div style={{ fontSize:9, color:'#94a3b8' }}>Prés.</div></div>
                  <div><div style={{ fontSize:13, fontWeight:700, color:'#475569' }}>#{s.rank}</div><div style={{ fontSize:9, color:'#94a3b8' }}>Rang</div></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vue tableau */}
        {view==='table' && (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #f1f5f9' }}>
                {['Élève','N° Étudiant','Classe','Moyenne','Présence','Rang','Statut'].map(h=>(
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11.5, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(s=>(
                <tr key={s.id} onClick={()=>navigate(`/students/${s.id}`)}
                  style={{ borderBottom:'1px solid #f8fafc', cursor:'pointer' }}
                  onMouseEnter={e=>e.currentTarget.style.backgroundColor='#f8fafc'}
                  onMouseLeave={e=>e.currentTarget.style.backgroundColor=''}>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <Avatar name={`${s.first_name} ${s.last_name}`} size={32}/>
                      <span style={{ fontSize:13, fontWeight:500 }}>{s.first_name} {s.last_name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:11.5, color:'#94a3b8', fontFamily:"'JetBrains Mono',monospace" }}>{s.student_number}</td>
                  <td style={{ padding:'12px 16px' }}><Badge color="blue" style={{ fontSize:11 }}>{s.class_name}</Badge></td>
                  <td style={{ padding:'12px 16px', fontSize:13, fontWeight:700, color:avgColor(s.average) }}>{s.average}/20</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, height:5, backgroundColor:'#f1f5f9', borderRadius:99, overflow:'hidden', maxWidth:60 }}>
                        <div style={{ height:'100%', width:`${s.attendance}%`, backgroundColor:'#10b981', borderRadius:99 }}/>
                      </div>
                      <span style={{ fontSize:12 }}>{s.attendance}%</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:'#475569' }}>#{s.rank}</td>
                  <td style={{ padding:'12px 16px' }}><Badge color="emerald" dot>Actif</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div style={{ padding:'14px 20px', borderTop:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:12.5, color:'#94a3b8' }}>
            {filtered.length} élève(s) · page {page}/{totalPages}
          </span>
          <div style={{ display:'flex', gap:4, alignItems:'center' }}>
            {/* Précédent */}
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{ width:32, height:32, borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', cursor:page===1?'not-allowed':'pointer', opacity:page===1?0.4:1, fontSize:14, color:'#475569' }}>‹</button>
            {/* Pages */}
            {Array.from({length:totalPages},(_,i)=>i+1)
              .filter(p => p===1 || p===totalPages || Math.abs(p-page)<=1)
              .reduce((acc,p,i,arr)=>{
                if(i>0 && p-arr[i-1]>1) acc.push('...')
                acc.push(p)
                return acc
              },[])
              .map((p,i)=>(
                typeof p==='string'
                  ? <span key={i} style={{ width:32, textAlign:'center', color:'#94a3b8', fontSize:13 }}>…</span>
                  : <button key={p} onClick={()=>setPage(p)}
                      style={{ width:32, height:32, borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:500,
                        backgroundColor:page===p?'#1a56db':'transparent',
                        color:page===p?'#fff':'#475569' }}
                      onMouseEnter={e=>{if(page!==p)e.currentTarget.style.backgroundColor='#f1f5f9'}}
                      onMouseLeave={e=>{if(page!==p)e.currentTarget.style.backgroundColor='transparent'}}>
                      {p}
                    </button>
              ))
            }
            {/* Suivant */}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ width:32, height:32, borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', cursor:page===totalPages?'not-allowed':'pointer', opacity:page===totalPages?0.4:1, fontSize:14, color:'#475569' }}>›</button>
          </div>
        </div>
      </Card>
    </div>
  )
}
