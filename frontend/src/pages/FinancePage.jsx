import { useState } from 'react'
import { KPICard, Card, Badge, Avatar, Modal } from '../components/ui'

const FEES = [
  { id:'f1', student:'Karim Mansouri',   class:'3ème B', total:8500, paid:8500, remaining:0,    status:'paid',    last_payment:'15/01/2025', method:'Virement' },
  { id:'f2', student:'Sara Khalidi',     class:'2ème A', total:8500, paid:5000, remaining:3500, status:'partial', last_payment:'10/02/2025', method:'Espèces' },
  { id:'f3', student:'Youssef Alaoui',   class:'Term. S',total:9500, paid:0,    remaining:9500, status:'overdue', last_payment:'—',          method:'—' },
  { id:'f4', student:'Fatima Benali',    class:'CE2 A',  total:7000, paid:7000, remaining:0,    status:'paid',    last_payment:'05/01/2025', method:'Chèque' },
  { id:'f5', student:'Ahmed El Fassi',   class:'5ème A', total:7500, paid:3000, remaining:4500, status:'partial', last_payment:'20/02/2025', method:'Espèces' },
  { id:'f6', student:'Leila Tahiri',     class:'1ère Tech',total:9000,paid:9000,remaining:0,    status:'paid',    last_payment:'02/01/2025', method:'Virement' },
  { id:'f7', student:'Omar Cherkaoui',   class:'CM2 B',  total:7000, paid:0,    remaining:7000, status:'overdue', last_payment:'—',          method:'—' },
  { id:'f8', student:'Nadia Benmoussa',  class:'4ème A', total:8000, paid:8000, remaining:0,    status:'paid',    last_payment:'12/01/2025', method:'Carte' },
]

const SC = {
  paid:    { label:'Payé',      bg:'rgba(16,185,129,0.1)',  color:'#10b981' },
  partial: { label:'Partiel',   bg:'rgba(245,158,11,0.1)',  color:'#b45309' },
  overdue: { label:'En retard', bg:'rgba(244,63,94,0.1)',   color:'#f43f5e' },
  pending: { label:'En attente',bg:'rgba(26,86,219,0.1)',   color:'#1a56db' },
}

export default function FinancePage() {
  const [filter, setFilter]   = useState('all')
  const [showPay, setShowPay] = useState(false)
  const [payForm, setPayForm] = useState({ student:'', amount:'', method:'Espèces' })

  const filtered = FEES.filter(f => filter==='all' || f.status===filter)

  const totalExpected = FEES.reduce((s,f)=>s+f.total,0)
  const totalPaid     = FEES.reduce((s,f)=>s+f.paid,0)
  const totalOverdue  = FEES.filter(f=>f.status==='overdue').reduce((s,f)=>s+f.remaining,0)
  const paidCount     = FEES.filter(f=>f.status==='paid').length
  const rate          = Math.round(totalPaid/totalExpected*100)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        <KPICard icon="💰" value={`${(totalPaid/1000).toFixed(0)}k DH`}     label="Total encaissé"   color="emerald" trend={5.8} progress={rate}/>
        <KPICard icon="⏳" value={`${(totalOverdue/1000).toFixed(0)}k DH`}  label="En retard"        color="rose"    />
        <KPICard icon="✅" value={`${paidCount}/${FEES.length}`}             label="Familles à jour"  color="blue"    progress={Math.round(paidCount/FEES.length*100)}/>
        <KPICard icon="📊" value={`${rate}%`}                               label="Taux recouvrement" color="violet"  progress={rate}/>
      </div>

      {/* Barre recouvrement */}
      <Card>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, margin:0 }}>Recouvrement global 2024–2025</h3>
          <span style={{ fontSize:13, fontWeight:700, color:'#1a56db' }}>{rate}%</span>
        </div>
        <div style={{ height:12, backgroundColor:'#f1f5f9', borderRadius:99, overflow:'hidden', marginBottom:8 }}>
          <div style={{ height:'100%', width:`${rate}%`, background:'linear-gradient(90deg,#1a56db,#10b981)', borderRadius:99, transition:'width 1s ease' }}/>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#94a3b8' }}>
          <span>Encaissé : <strong style={{ color:'#10b981' }}>{(totalPaid/1000).toFixed(0)}k DH</strong></span>
          <span>Attendu : <strong>{(totalExpected/1000).toFixed(0)}k DH</strong></span>
          <span>Reste : <strong style={{ color:'#f43f5e' }}>{((totalExpected-totalPaid)/1000).toFixed(0)}k DH</strong></span>
        </div>
      </Card>

      {/* Tableau */}
      <Card padding={false}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, margin:0 }}>Suivi des paiements</h3>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {/* Filtre statut */}
            <div style={{ display:'flex', gap:4 }}>
              {[{v:'all',l:'Tous'},{v:'paid',l:'Payés'},{v:'partial',l:'Partiels'},{v:'overdue',l:'Retard'}].map(f=>(
                <button key={f.v} onClick={()=>setFilter(f.v)}
                  style={{ padding:'6px 12px', borderRadius:10, border:'none', fontSize:12.5, fontWeight:500, cursor:'pointer', backgroundColor:filter===f.v?'#1a56db':'#f1f5f9', color:filter===f.v?'#fff':'#64748b', transition:'all 0.15s' }}>
                  {f.l}
                </button>
              ))}
            </div>
            <button onClick={()=>setShowPay(true)}
              style={{ padding:'8px 16px', borderRadius:12, border:'none', background:'#1a56db', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              💳 Paiement
            </button>
            <button style={{ padding:'8px 14px', borderRadius:12, border:'none', background:'#f43f5e', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              📧 Relances
            </button>
          </div>
        </div>

        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #f1f5f9' }}>
              {['Famille / Élève','Classe','Total','Payé','Reste','Statut','Dernier paiement'].map(h=>(
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11.5, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(f=>{
              const sc = SC[f.status]
              const pct = Math.round(f.paid/f.total*100)
              return (
                <tr key={f.id} style={{ borderBottom:'1px solid #f8fafc' }}
                  onMouseEnter={e=>e.currentTarget.style.backgroundColor='#f8fafc'}
                  onMouseLeave={e=>e.currentTarget.style.backgroundColor=''}>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <Avatar name={f.student} size={34}/>
                      <div>
                        <div style={{ fontSize:13, fontWeight:500 }}>{f.student}</div>
                        <div style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>{f.method!=='—'?`Via ${f.method}`:''}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px' }}><Badge color="blue" style={{ fontSize:11 }}>{f.class}</Badge></td>
                  <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:'#0f172a' }}>{f.total.toLocaleString()} DH</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#10b981' }}>{f.paid.toLocaleString()} DH</div>
                      <div style={{ height:4, backgroundColor:'#f1f5f9', borderRadius:99, overflow:'hidden', marginTop:4, width:80 }}>
                        <div style={{ height:'100%', width:`${pct}%`, backgroundColor:'#10b981', borderRadius:99 }}/>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:f.remaining>0?'#f43f5e':'#10b981' }}>
                    {f.remaining>0?`${f.remaining.toLocaleString()} DH`:'✓ Soldé'}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:99, fontSize:12, fontWeight:600, backgroundColor:sc.bg, color:sc.color }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:12.5, color:'#64748b' }}>{f.last_payment}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {/* Modal paiement */}
      <Modal isOpen={showPay} onClose={()=>setShowPay(false)} title="Enregistrer un paiement" size="sm">
        <div style={{ padding:24, display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:'#334155', display:'block', marginBottom:6 }}>Élève</label>
            <select value={payForm.student} onChange={e=>setPayForm(p=>({...p,student:e.target.value}))}
              style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13, outline:'none', backgroundColor:'#fff' }}>
              <option value="">Sélectionner un élève…</option>
              {FEES.map(f=><option key={f.id} value={f.student}>{f.student} — Reste : {f.remaining.toLocaleString()} DH</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:'#334155', display:'block', marginBottom:6 }}>Montant (DH)</label>
            <input type="number" value={payForm.amount} onChange={e=>setPayForm(p=>({...p,amount:e.target.value}))}
              placeholder="0.00"
              style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13, outline:'none', boxSizing:'border-box' }}
              onFocus={e=>e.target.style.borderColor='#1a56db'}
              onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:'#334155', display:'block', marginBottom:6 }}>Méthode de paiement</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
              {['Espèces','Virement','Chèque','Carte'].map(m=>(
                <button key={m} onClick={()=>setPayForm(p=>({...p,method:m}))}
                  style={{ padding:'10px', borderRadius:12, border:`2px solid ${payForm.method===m?'#1a56db':'#e2e8f0'}`, background:payForm.method===m?'rgba(26,86,219,0.06)':'#fff', fontSize:13, fontWeight:500, cursor:'pointer', color:payForm.method===m?'#1a56db':'#475569', transition:'all 0.15s' }}>
                  {m==='Espèces'?'💵':m==='Virement'?'🏦':m==='Chèque'?'📄':'💳'} {m}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:4 }}>
            <button onClick={()=>setShowPay(false)}
              style={{ padding:'9px 20px', borderRadius:12, border:'1px solid #e2e8f0', background:'#fff', color:'#475569', fontSize:13, cursor:'pointer' }}>
              Annuler
            </button>
            <button onClick={()=>setShowPay(false)}
              style={{ padding:'9px 20px', borderRadius:12, border:'none', background:'#1a56db', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              💳 Valider
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
