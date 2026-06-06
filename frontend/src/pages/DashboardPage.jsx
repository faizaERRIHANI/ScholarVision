import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { KPICard, Card, Badge, Alert } from '../components/ui'

const ATT = [
  {month:'Sep',present:92,absent:8},{month:'Oct',present:88,absent:12},
  {month:'Nov',present:85,absent:15},{month:'Déc',present:90,absent:10},
  {month:'Jan',present:87,absent:13},{month:'Fév',present:91,absent:9},
]
const LEVELS = [
  {name:'Primaire',value:145,color:'#1a56db'},
  {name:'Collège', value:98, color:'#7c3aed'},
  {name:'Lycée',   value:74, color:'#f59e0b'},
]
const ACTIVITY = [
  {id:1,icon:'✅',text:'Présences 3ème B enregistrées (28/28)',time:'Il y a 12 min',color:'#10b981'},
  {id:2,icon:'💳',text:'Paiement reçu — Famille Mansouri (2 500 DH)',time:'Il y a 28 min',color:'#1a56db'},
  {id:3,icon:'🤖',text:"IA : 1 personne inconnue détectée à l'entrée",time:'Il y a 45 min',color:'#f43f5e'},
  {id:4,icon:'📝',text:'Notes T2 saisies — Maths 3ème B',time:'Il y a 1h',color:'#7c3aed'},
  {id:5,icon:'🎓',text:'Nouvel élève inscrit : Sara Khalidi — CE2 A',time:'Il y a 2h',color:'#f59e0b'},
]

const Tip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:12.5 }}>
      <p style={{ fontWeight:600, marginBottom:6 }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:p.fill }}/>
          <span style={{ color:'#64748b' }}>{p.name} :</span>
          <span style={{ fontWeight:600 }}>{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [time, setTime] = useState(new Date())
  const [alerts, setAlerts] = useState([
    {id:1,type:'warning',msg:'12 familles ont des paiements en retard (>30 jours)'},
    {id:2,type:'info',   msg:'3 professeurs ont soumis des demandes de congé'},
  ])
  useEffect(() => { const t = setInterval(()=>setTime(new Date()),1000); return ()=>clearInterval(t) },[])
  const h = time.getHours()
  const greeting = h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir'

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      {/* Hero */}
      <div style={{ borderRadius:20, padding:'24px 32px', background:'linear-gradient(135deg,#0b1437 0%,#112060 60%,#1a56db 100%)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle,rgba(245,158,11,0.2),transparent)' }}/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1 }}>
          <div>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:13, marginBottom:6 }}>
              {time.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
            </p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:'#fff', marginBottom:6 }}>
              {greeting}, <span style={{ color:'#f59e0b' }}>Faiza</span> 👋
            </h2>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14 }}>Résumé de votre établissement aujourd'hui</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:38, fontWeight:700, color:'#fff' }}>
              {time.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end', marginTop:4 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:'#10b981', animation:'pulse 1.2s infinite' }}/>
              <span style={{ color:'rgba(255,255,255,0.38)', fontSize:12 }}>Système actif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {alerts.map(a => <Alert key={a.id} type={a.type} onClose={() => setAlerts(p=>p.filter(x=>x.id!==a.id))}>{a.msg}</Alert>)}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        <KPICard icon="🎓" value="317"       label="Élèves inscrits"      color="blue"    trend={2.1}  progress={78} />
        <KPICard icon="✅" value="291"       label="Présents aujourd'hui" color="emerald" trend={-1.2} progress={91.8} />
        <KPICard icon="📊" value="13.8/20"   label="Moyenne générale"     color="violet" />
        <KPICard icon="💳" value="284k DH"   label="Encaissé ce mois"     color="gold"    trend={5.8} />
      </div>

      {/* Graphiques */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>
        <Card>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700 }}>Présences mensuelles</h3>
            <Badge color="blue">6 mois</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ATT} barGap={4} margin={{ left:-20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} domain={[0,100]}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="present" name="Présents" fill="#1a56db" radius={[4,4,0,0]} maxBarSize={28}/>
              <Bar dataKey="absent"  name="Absents"  fill="#f43f5e" radius={[4,4,0,0]} maxBarSize={28}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, marginBottom:16 }}>Répartition niveaux</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={LEVELS} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {LEVELS.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize:11, color:'#64748b' }}>{v}</span>}/>
              <Tooltip formatter={(v,n) => [`${v} élèves`,n]}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginTop:8 }}>
            {LEVELS.map(l => (
              <div key={l.name} style={{ textAlign:'center', padding:'8px 4px', borderRadius:12, backgroundColor:l.color+'18' }}>
                <div style={{ fontWeight:700, fontSize:16, color:l.color }}>{l.value}</div>
                <div style={{ fontSize:10.5, color:'#64748b', marginTop:2 }}>{l.name}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activité */}
      <Card>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, marginBottom:16 }}>Activité récente</h3>
        {ACTIVITY.map((a,i) => (
          <div key={a.id} style={{ display:'flex', alignItems:'flex-start', gap:14, paddingTop:12, paddingBottom:12, borderBottom: i<ACTIVITY.length-1?'1px solid #f8fafc':'' }}>
            <div style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, backgroundColor:a.color+'18' }}>
              {a.icon}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, color:'#334155' }}>{a.text}</p>
              <p style={{ fontSize:11.5, color:'#94a3b8', marginTop:2 }}>{a.time}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
