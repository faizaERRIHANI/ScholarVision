import { useState } from 'react'
import { Card, Avatar } from '../components/ui'

export default function ProfilePage() {
  const [form, setForm] = useState({ first_name:'Faiza', last_name:'ERRIHANI', email:'admin@ecole.ma', phone:'06 61 23 45 67', role:'directeur' })
  const [pwd, setPwd]   = useState({ old:'', new:'', confirm:'' })
  const [saved, setSaved] = useState(false)

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2000) }

  return (
    <div style={{ maxWidth:640, display:'flex', flexDirection:'column', gap:20 }}>

      {/* Avatar */}
      <Card>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <Avatar name={`${form.first_name} ${form.last_name}`} size={64}/>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700 }}>{form.first_name} {form.last_name}</div>
            <div style={{ fontSize:13, color:'#64748b', marginTop:2 }}>{form.email}</div>
            <div style={{ display:'inline-flex', marginTop:6, padding:'3px 12px', borderRadius:99, fontSize:12, fontWeight:600, backgroundColor:'rgba(26,86,219,0.1)', color:'#1a56db', textTransform:'capitalize' }}>{form.role}</div>
          </div>
          <button style={{ padding:'8px 16px', borderRadius:12, border:'1px solid #e2e8f0', background:'#fff', color:'#475569', fontSize:13, cursor:'pointer' }}>
            📷 Changer photo
          </button>
        </div>
      </Card>

      {/* Infos personnelles */}
      <Card>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, margin:'0 0 16px' }}>Informations personnelles</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
          {[{k:'first_name',l:'Prénom'},{k:'last_name',l:'Nom'}].map(f => (
            <div key={f.k}>
              <label style={{ fontSize:13, fontWeight:600, color:'#334155', display:'block', marginBottom:5 }}>{f.l}</label>
              <input value={form[f.k]} onChange={e => setForm(p=>({...p,[f.k]:e.target.value}))}
                style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13.5, outline:'none', boxSizing:'border-box' }}
                onFocus={e=>e.target.style.borderColor='#1a56db'}
                onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
            </div>
          ))}
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:'#334155', display:'block', marginBottom:5 }}>Email</label>
            <input value={form.email} disabled
              style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13.5, outline:'none', boxSizing:'border-box', backgroundColor:'#f8fafc', color:'#94a3b8' }}/>
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:'#334155', display:'block', marginBottom:5 }}>Téléphone</label>
            <input value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))}
              style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13.5, outline:'none', boxSizing:'border-box' }}
              onFocus={e=>e.target.style.borderColor='#1a56db'}
              onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
          <button onClick={save}
            style={{ padding:'9px 24px', borderRadius:12, border:'none', background: saved?'#10b981':'#1a56db', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>
            {saved ? '✅ Sauvegardé !' : 'Sauvegarder'}
          </button>
        </div>
      </Card>

      {/* Changer mot de passe */}
      <Card>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, margin:'0 0 16px' }}>Changer le mot de passe</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[
            {k:'old',     l:'Mot de passe actuel',         h:''},
            {k:'new',     l:'Nouveau mot de passe',         h:'Min. 8 caractères, 1 majuscule, 1 chiffre'},
            {k:'confirm', l:'Confirmer le nouveau mot de passe', h:''},
          ].map(f => (
            <div key={f.k}>
              <label style={{ fontSize:13, fontWeight:600, color:'#334155', display:'block', marginBottom:5 }}>{f.l}</label>
              <input type="password" value={pwd[f.k]} onChange={e => setPwd(p=>({...p,[f.k]:e.target.value}))}
                style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13.5, outline:'none', boxSizing:'border-box' }}
                onFocus={e=>e.target.style.borderColor='#1a56db'}
                onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
              {f.h && <p style={{ fontSize:11.5, color:'#94a3b8', margin:'4px 0 0' }}>{f.h}</p>}
            </div>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
          <button style={{ padding:'9px 24px', borderRadius:12, border:'none', background:'#1a56db', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            🔒 Changer le mot de passe
          </button>
        </div>
      </Card>
    </div>
  )
}
