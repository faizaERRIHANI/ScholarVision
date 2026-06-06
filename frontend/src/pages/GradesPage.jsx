import { useState } from 'react'
import { KPICard, Card, Badge, Avatar, Tabs, Modal } from '../components/ui'

const SUBJECTS = [
  { name:'Mathématiques', coeff:4, color:'#1a56db' },
  { name:'Français',      coeff:3, color:'#7c3aed' },
  { name:'Sciences',      coeff:3, color:'#10b981' },
  { name:'Histoire-Géo',  coeff:2, color:'#f59e0b' },
  { name:'Anglais',       coeff:2, color:'#f97316' },
  { name:'EPS',           coeff:1, color:'#f43f5e' },
]

const STUDENTS_GRADES = [
  { id:'s1', name:'Karim Mansouri',   grades: [18,15,16,14,17,19], rank:1 },
  { id:'s2', name:'Sara Khalidi',     grades: [16,18,15,17,16,18], rank:2 },
  { id:'s3', name:'Youssef Alaoui',   grades: [12,13,11,14,12,15], rank:6 },
  { id:'s4', name:'Fatima Benali',    grades: [14,16,15,13,15,17], rank:4 },
  { id:'s5', name:'Ahmed El Fassi',   grades: [10,11,12,10,13,14], rank:8 },
  { id:'s6', name:'Leila Tahiri',     grades: [17,16,18,15,16,19], rank:3 },
]

const calcAvg = (grades) => {
  const total = SUBJECTS.reduce((s,sub,i) => s + (grades[i]||0)*sub.coeff, 0)
  const coeffSum = SUBJECTS.reduce((s,sub) => s+sub.coeff, 0)
  return (total/coeffSum).toFixed(2)
}

const gradeColor = v => v>=16?'#10b981':v>=12?'#1a56db':v>=10?'#f59e0b':'#f43f5e'

const getMention = avg => {
  if(avg>=16) return {label:'Très Bien', color:'#10b981'}
  if(avg>=14) return {label:'Bien',      color:'#1a56db'}
  if(avg>=12) return {label:'Assez Bien',color:'#7c3aed'}
  if(avg>=10) return {label:'Passable',  color:'#f59e0b'}
  return {label:'Insuffisant',           color:'#f43f5e'}
}

const SEMS = [
  {value:'1',label:'Trimestre 1'},
  {value:'2',label:'Trimestre 2'},
  {value:'3',label:'Trimestre 3'},
]

export default function GradesPage() {
  const [sem, setSem]         = useState('2')
  const [editCell, setEdit]   = useState(null)
  const [grades, setGrades]   = useState(STUDENTS_GRADES)
  const [showBulletin, setShowBulletin] = useState(false)
  const [selStudent, setSelStudent] = useState(null)

  const handleGradeChange = (sid, subIdx, val) => {
    setGrades(prev => prev.map(s =>
      s.id===sid ? { ...s, grades: s.grades.map((g,i)=>i===subIdx?Number(val):g) } : s
    ))
  }

  const classAvg = () => {
    const avgs = grades.map(s=>parseFloat(calcAvg(s.grades)))
    return (avgs.reduce((a,b)=>a+b,0)/avgs.length).toFixed(2)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        <KPICard icon="📊" value={classAvg()} label="Moyenne classe"   color="blue"   />
        <KPICard icon="🏆" value={grades[0]?.name.split(' ')[0]} label="1er de classe" color="gold" />
        <KPICard icon="📝" value={SUBJECTS.length} label="Matières"     color="violet" />
        <KPICard icon="📄" value="28"              label="Bulletins à générer" color="emerald" />
      </div>

      {/* Toolbar */}
      <Card>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', gap:8 }}>
            {SEMS.map(s=>(
              <button key={s.value} onClick={()=>setSem(s.value)}
                style={{ padding:'8px 18px', borderRadius:12, border:'none', fontSize:13, fontWeight:500, cursor:'pointer', backgroundColor:sem===s.value?'#1a56db':'#f1f5f9', color:sem===s.value?'#fff':'#64748b', transition:'all 0.15s' }}>
                {s.label}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <select style={{ border:'1px solid #e2e8f0', borderRadius:12, padding:'8px 14px', fontSize:13, outline:'none', backgroundColor:'#fff' }}>
              <option>3ème B</option><option>CE2 A</option><option>Term. S</option>
            </select>
            <button style={{ padding:'8px 16px', borderRadius:12, border:'none', background:'#7c3aed', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              📄 Générer bulletins PDF
            </button>
            <button style={{ padding:'8px 14px', borderRadius:12, border:'1px solid #e2e8f0', background:'#fff', color:'#475569', fontSize:13, cursor:'pointer' }}>
              📤 Export Excel
            </button>
          </div>
        </div>
      </Card>

      {/* Tableau de saisie */}
      <Card padding={false}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9' }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, margin:0 }}>
            Notes — Trimestre {sem} · 3ème B
          </h3>
          <p style={{ fontSize:12, color:'#94a3b8', margin:'4px 0 0' }}>Cliquez sur une note pour la modifier</p>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:800 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #f1f5f9' }}>
                <th style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', minWidth:160 }}>Élève</th>
                {SUBJECTS.map(sub=>(
                  <th key={sub.name} style={{ padding:'12px 8px', textAlign:'center', fontSize:11, fontWeight:600, color:'#94a3b8', textTransform:'uppercase' }}>
                    <div style={{ color:sub.color, fontWeight:700 }}>{sub.name.split(' ')[0]}</div>
                    <div style={{ fontSize:9.5, color:'#cbd5e1', marginTop:1 }}>Coeff. {sub.coeff}</div>
                  </th>
                ))}
                <th style={{ padding:'12px 16px', textAlign:'center', fontSize:12, fontWeight:600, color:'#94a3b8', textTransform:'uppercase' }}>Moyenne</th>
                <th style={{ padding:'12px 16px', textAlign:'center', fontSize:12, fontWeight:600, color:'#94a3b8', textTransform:'uppercase' }}>Mention</th>
                <th style={{ padding:'12px 16px', textAlign:'center', fontSize:12, fontWeight:600, color:'#94a3b8', textTransform:'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(s=>{
                const avg = parseFloat(calcAvg(s.grades))
                const mention = getMention(avg)
                return (
                  <tr key={s.id} style={{ borderBottom:'1px solid #f8fafc' }}
                    onMouseEnter={e=>e.currentTarget.style.backgroundColor='#fafbff'}
                    onMouseLeave={e=>e.currentTarget.style.backgroundColor=''}>
                    <td style={{ padding:'10px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <Avatar name={s.name} size={30}/>
                        <span style={{ fontSize:12.5, fontWeight:500 }}>{s.name}</span>
                      </div>
                    </td>
                    {s.grades.map((g,i)=>{
                      const isEditing = editCell===`${s.id}-${i}`
                      return (
                        <td key={i} style={{ padding:'10px 8px', textAlign:'center' }}>
                          {isEditing ? (
                            <input type="number" min="0" max="20" step="0.5" defaultValue={g}
                              autoFocus
                              onBlur={e=>{handleGradeChange(s.id,i,e.target.value);setEdit(null)}}
                              onKeyDown={e=>{if(e.key==='Enter'){handleGradeChange(s.id,i,e.target.value);setEdit(null)}}}
                              style={{ width:52, border:`2px solid ${SUBJECTS[i].color}`, borderRadius:8, padding:'4px 6px', fontSize:13, fontWeight:700, textAlign:'center', outline:'none', color:SUBJECTS[i].color }}/>
                          ) : (
                            <div onClick={()=>setEdit(`${s.id}-${i}`)}
                              style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:44, height:28, borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', backgroundColor:gradeColor(g)+'15', color:gradeColor(g), transition:'all 0.15s' }}
                              onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.1)'}}
                              onMouseLeave={e=>{e.currentTarget.style.transform=''}}>
                              {g}
                            </div>
                          )}
                        </td>
                      )
                    })}
                    <td style={{ padding:'10px 16px', textAlign:'center' }}>
                      <span style={{ fontSize:15, fontWeight:800, color:gradeColor(avg) }}>{avg}</span>
                      <span style={{ fontSize:11, color:'#94a3b8' }}>/20</span>
                    </td>
                    <td style={{ padding:'10px 16px', textAlign:'center' }}>
                      <span style={{ fontSize:11.5, fontWeight:700, padding:'3px 10px', borderRadius:99, backgroundColor:mention.color+'18', color:mention.color }}>
                        {mention.label}
                      </span>
                    </td>
                    <td style={{ padding:'10px 16px', textAlign:'center' }}>
                      <button onClick={()=>{setSelStudent(s);setShowBulletin(true)}}
                        style={{ padding:'5px 12px', borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', fontSize:12, cursor:'pointer', color:'#475569' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='#7c3aed';e.currentTarget.style.color='#7c3aed'}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.color='#475569'}}>
                        📄 Bulletin
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop:'2px solid #f1f5f9', backgroundColor:'#fafbff' }}>
                <td style={{ padding:'12px 16px', fontSize:12, fontWeight:700, color:'#475569' }}>MOYENNE CLASSE</td>
                {SUBJECTS.map((_,i)=>{
                  const subAvg = (grades.reduce((s,st)=>s+st.grades[i],0)/grades.length).toFixed(1)
                  return <td key={i} style={{ padding:'12px 8px', textAlign:'center', fontSize:13, fontWeight:700, color:gradeColor(parseFloat(subAvg)) }}>{subAvg}</td>
                })}
                <td style={{ padding:'12px 16px', textAlign:'center', fontSize:15, fontWeight:800, color:'#1a56db' }}>{classAvg()}</td>
                <td colSpan={2}/>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Modal bulletin */}
      <Modal isOpen={showBulletin} onClose={()=>setShowBulletin(false)} title="Aperçu Bulletin" size="md">
        {selStudent && (
          <div style={{ padding:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, padding:'16px', borderRadius:14, background:'linear-gradient(135deg,#0b1437,#1a56db)' }}>
              <Avatar name={selStudent.name} size={48}/>
              <div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:'#fff' }}>{selStudent.name}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>3ème B · Trimestre {sem} · 2024–2025</div>
              </div>
              <div style={{ marginLeft:'auto', textAlign:'right' }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:'#f59e0b' }}>{calcAvg(selStudent.grades)}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>Moyenne / 20</div>
              </div>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:16 }}>
              <thead>
                <tr style={{ borderBottom:'2px solid #f1f5f9' }}>
                  {['Matière','Coeff.','Note','/ 20','Appréciation'].map(h=>(
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11.5, fontWeight:600, color:'#94a3b8', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SUBJECTS.map((sub,i)=>{
                  const g = selStudent.grades[i]
                  const apprs = ['Excellent travail','Bon travail, continuez','Peut mieux faire','Efforts insuffisants']
                  const appr = g>=16?apprs[0]:g>=13?apprs[1]:g>=10?apprs[2]:apprs[3]
                  return (
                    <tr key={sub.name} style={{ borderBottom:'1px solid #f8fafc', backgroundColor:i%2===0?'#fafbff':'#fff' }}>
                      <td style={{ padding:'10px 12px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:sub.color }}/>
                          <span style={{ fontSize:13, fontWeight:500 }}>{sub.name}</span>
                        </div>
                      </td>
                      <td style={{ padding:'10px 12px', fontSize:13, color:'#64748b', textAlign:'center' }}>{sub.coeff}</td>
                      <td style={{ padding:'10px 12px', textAlign:'center' }}>
                        <span style={{ fontSize:15, fontWeight:800, color:gradeColor(g) }}>{g}</span>
                      </td>
                      <td style={{ padding:'10px 12px', fontSize:11, color:'#94a3b8', textAlign:'center' }}>/ 20</td>
                      <td style={{ padding:'10px 12px', fontSize:12, color:'#64748b', fontStyle:'italic' }}>{appr}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderRadius:14, backgroundColor:'#f8fafc' }}>
              <div>
                <span style={{ fontSize:12, color:'#64748b' }}>Rang : </span>
                <strong style={{ fontSize:14, color:'#1a56db' }}>#{selStudent.rank}</strong>
                <span style={{ fontSize:12, color:'#94a3b8' }}> / {grades.length} élèves</span>
              </div>
              <div style={{ fontSize:13, fontWeight:700, padding:'6px 16px', borderRadius:99, backgroundColor:getMention(parseFloat(calcAvg(selStudent.grades))).color+'18', color:getMention(parseFloat(calcAvg(selStudent.grades))).color }}>
                {getMention(parseFloat(calcAvg(selStudent.grades))).label}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
              <button onClick={()=>setShowBulletin(false)}
                style={{ padding:'9px 20px', borderRadius:12, border:'1px solid #e2e8f0', background:'#fff', color:'#475569', fontSize:13, cursor:'pointer' }}>
                Fermer
              </button>
              <button style={{ padding:'9px 20px', borderRadius:12, border:'none', background:'#7c3aed', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                📥 Télécharger PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
