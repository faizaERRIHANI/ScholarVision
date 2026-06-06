import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]    = useState({ email:'admin@ecole.ma', password:'admin123' })
  const [loading, setLoad] = useState(false)
  const [showPwd, setPwd]  = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoad(true)
    await login(form.email, form.password)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'DM Sans',sans-serif" }}>
      {/* Gauche branding */}
      <div style={{ width:'45%', background:'linear-gradient(160deg,#0b1437 0%,#112060 50%,#1a3a8f 100%)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:48, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(26,86,219,0.3),transparent)' }}/>
        <div style={{ position:'absolute', bottom:-60, left:-60, width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.25),transparent)' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:12, position:'relative', zIndex:1 }}>
          <div style={{ width:44, height:44, borderRadius:14, background:'linear-gradient(135deg,#1a56db,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'#fff' }}>E</div>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'#fff' }}>ScholarVision</div>
            <div style={{ fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)' }}>Gestion Scolaire</div>
          </div>
        </div>
        <div style={{ position:'relative', zIndex:1 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:44, fontWeight:700, color:'#fff', lineHeight:1.15, marginBottom:20 }}>
            Gérez votre<br/><span style={{ color:'#f59e0b' }}>établissement</span><br/>avec intelligence
          </h2>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15, lineHeight:1.7 }}>
            Présences IA · Notes · Bulletins · Finances — tout en un. Propulsé par YOLOv8.
          </p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, position:'relative', zIndex:1 }}>
          {[{v:'317',l:'Élèves'},{v:'34',l:'Profs'},{v:'98%',l:'Précision IA'}].map(s => (
            <div key={s.l} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:'16px 12px', textAlign:'center' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:'#fff' }}>{s.v}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Droite formulaire */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:32, backgroundColor:'#f8fafc' }}>
        <div style={{ width:'100%', maxWidth:400 }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:700, color:'#0f172a', marginBottom:8 }}>Connexion</h1>
          <p style={{ fontSize:14, color:'#64748b', marginBottom:32 }}>Entrez vos identifiants pour accéder à votre espace</p>

          <div style={{ padding:'10px 14px', borderRadius:12, backgroundColor:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', color:'#059669', fontSize:12.5, fontWeight:500, marginBottom:20, textAlign:'center' }}>
            ✅ Mode démo actif — cliquez sur "Se connecter"
          </div>

          <div style={{ display:'flex', gap:8, marginBottom:24 }}>
            {[{label:'👑 Directeur',e:'admin@ecole.ma',p:'admin123'},{label:'👨‍🏫 Enseignant',e:'prof@ecole.ma',p:'prof123'}].map(d => (
              <button key={d.label} onClick={() => setForm({email:d.e,password:d.p})}
                style={{ flex:1, padding:'8px 12px', fontSize:12, fontWeight:500, borderRadius:12, border:'1px solid #e2e8f0', background:'#fff', color:'#475569', cursor:'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#1a56db'; e.currentTarget.style.color='#1a56db' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.color='#475569' }}>
                {d.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#334155', marginBottom:6 }}>Email</label>
              <input type="email" value={form.email}
                onChange={e => setForm(p=>({...p,email:e.target.value}))}
                style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:12, padding:'12px 16px', fontSize:13.5, outline:'none', boxSizing:'border-box' }}
                onFocus={e => e.target.style.borderColor='#1a56db'}
                onBlur={e => e.target.style.borderColor='#e2e8f0'}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#334155', marginBottom:6 }}>Mot de passe</label>
              <div style={{ position:'relative' }}>
                <input type={showPwd?'text':'password'} value={form.password}
                  onChange={e => setForm(p=>({...p,password:e.target.value}))}
                  style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:12, padding:'12px 48px 12px 16px', fontSize:13.5, outline:'none', boxSizing:'border-box' }}
                  onFocus={e => e.target.style.borderColor='#1a56db'}
                  onBlur={e => e.target.style.borderColor='#e2e8f0'}/>
                <button type="button" onClick={() => setPwd(p=>!p)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#94a3b8' }}>
                  {showPwd?'🙈':'👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ padding:'13px', borderRadius:12, border:'none', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', background:loading?'#94a3b8':'linear-gradient(135deg,#1a56db,#1d4ed8)', marginTop:4 }}>
              {loading ? '⏳ Connexion…' : 'Se connecter →'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:11.5, color:'#94a3b8', marginTop:32 }}>
            ScholarVision v1.0 · ENSET Média 2025/2026 · Faiza ERRIHANI
          </p>
        </div>
      </div>
    </div>
  )
}
