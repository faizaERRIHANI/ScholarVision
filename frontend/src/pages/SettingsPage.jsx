import { useState } from 'react'
import { Card } from '../components/ui'

function Toggle({ checked, onChange, label, description }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #f8fafc' }}>
      <div>
        <div style={{ fontSize:13.5, fontWeight:500, color:'#0f172a' }}>{label}</div>
        {description && <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{description}</div>}
      </div>
      <div onClick={() => onChange(!checked)}
        style={{ position:'relative', width:44, height:24, borderRadius:99, backgroundColor:checked?'#1a56db':'#cbd5e1', transition:'background-color 0.2s', flexShrink:0, cursor:'pointer' }}>
        <span style={{ position:'absolute', top:2, left:checked?22:2, width:20, height:20, borderRadius:'50%', backgroundColor:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'left 0.2s' }}/>
      </div>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <Card>
      <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, margin:'0 0 4px', display:'flex', alignItems:'center', gap:8 }}>
        <span>{icon}</span>{title}
      </h3>
      <div>{children}</div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
        <button style={{ padding:'8px 20px', borderRadius:12, border:'none', background:'#1a56db', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          Sauvegarder
        </button>
      </div>
    </Card>
  )
}

export default function SettingsPage() {
  const [s, setS] = useState({
    school_name: 'École Privée Al Amal', school_address: 'Fès, Maroc', academic_year: '2024-2025',
    ai_enabled: true, ai_auto_attendance: true, ai_unknown_alerts: true, ai_threshold: 75,
    email_notifs: true, sms_notifs: false, absence_alert: true, payment_alert: true,
    two_factor: false, session_timeout: 8,
  })
  const set = (k, v) => setS(p => ({...p, [k]: v}))

  return (
    <div style={{ maxWidth:640, display:'flex', flexDirection:'column', gap:20 }}>

      <Section title="Établissement" icon="🏫">
        {[{k:'school_name',l:'Nom'},{k:'school_address',l:'Adresse'}].map(f => (
          <div key={f.k} style={{ marginBottom:12 }}>
            <label style={{ fontSize:13, fontWeight:600, color:'#334155', display:'block', marginBottom:5 }}>{f.l}</label>
            <input value={s[f.k]} onChange={e => set(f.k, e.target.value)}
              style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13.5, outline:'none', boxSizing:'border-box' }}
              onFocus={e=>e.target.style.borderColor='#1a56db'}
              onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
          </div>
        ))}
        <div>
          <label style={{ fontSize:13, fontWeight:600, color:'#334155', display:'block', marginBottom:5 }}>Année scolaire</label>
          <select value={s.academic_year} onChange={e=>set('academic_year',e.target.value)}
            style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13, outline:'none', backgroundColor:'#fff' }}>
            <option value="2024-2025">2024–2025</option>
            <option value="2025-2026">2025–2026</option>
          </select>
        </div>
      </Section>

      <Section title="Reconnaissance faciale IA" icon="🤖">
        <Toggle checked={s.ai_enabled}          onChange={v=>set('ai_enabled',v)}          label="Activer l'IA faciale"           description="YOLOv8 + ArcFace"/>
        <Toggle checked={s.ai_auto_attendance}  onChange={v=>set('ai_auto_attendance',v)}  label="Enregistrement auto des présences" description="Pointe automatiquement à la détection"/>
        <Toggle checked={s.ai_unknown_alerts}   onChange={v=>set('ai_unknown_alerts',v)}   label="Alertes personnes inconnues"    description="Notifie le directeur immédiatement"/>
        <div style={{ marginTop:12 }}>
          <label style={{ fontSize:13, fontWeight:600, color:'#334155', display:'block', marginBottom:8 }}>
            Seuil de confiance : <strong style={{ color:'#1a56db' }}>{s.ai_threshold}%</strong>
          </label>
          <input type="range" min={50} max={99} value={s.ai_threshold} onChange={e=>set('ai_threshold',Number(e.target.value))}
            style={{ width:'100%', accentColor:'#1a56db' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#94a3b8', marginTop:4 }}>
            <span>50% (permissif)</span><span>99% (strict)</span>
          </div>
        </div>
      </Section>

      <Section title="Notifications" icon="🔔">
        <Toggle checked={s.email_notifs}   onChange={v=>set('email_notifs',v)}   label="Notifications par email"/>
        <Toggle checked={s.sms_notifs}     onChange={v=>set('sms_notifs',v)}     label="Notifications par SMS"/>
        <Toggle checked={s.absence_alert}  onChange={v=>set('absence_alert',v)}  label="Alertes absences répétées"  description="Après 3 absences consécutives"/>
        <Toggle checked={s.payment_alert}  onChange={v=>set('payment_alert',v)}  label="Rappels paiements en retard" description="Envoi automatique aux familles"/>
      </Section>

      <Section title="Sécurité" icon="🔐">
        <Toggle checked={s.two_factor} onChange={v=>set('two_factor',v)} label="Authentification à deux facteurs" description="Recommandé pour le directeur"/>
        <div style={{ marginTop:12 }}>
          <label style={{ fontSize:13, fontWeight:600, color:'#334155', display:'block', marginBottom:5 }}>Durée de session (heures)</label>
          <input type="number" min={1} max={24} value={s.session_timeout} onChange={e=>set('session_timeout',Number(e.target.value))}
            style={{ width:120, border:'1px solid #e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13, outline:'none', boxSizing:'border-box' }}/>
        </div>
      </Section>
    </div>
  )
}
