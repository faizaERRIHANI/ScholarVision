import { useNavigate } from 'react-router-dom'

const ICONS = {
  StudentsPage:'🎓', StudentDetailPage:'👤', StudentFormPage:'📝',
  StaffPage:'👨‍🏫', AttendancePage:'✅', GradesPage:'📊',
  SchedulePage:'📅', FinancePage:'💳', FaceRecognitionPage:'🤖',
  NotificationsPage:'🔔', SettingsPage:'⚙️', ProfilePage:'👤', NotFoundPage:'404'
}

export default function StudentDetailPage() {
  const navigate = useNavigate()
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ textAlign:'center', background:'#fff', borderRadius:24, padding:'48px 64px', border:'1px solid #e2e8f0', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>{ICONS['StudentDetailPage']||'🚧'}</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:'#0f172a', marginBottom:8 }}>StudentDetailPage</h2>
        <p style={{ color:'#64748b', fontSize:14, marginBottom:24 }}>Page en cours de développement — Parties suivantes</p>
        <button onClick={() => navigate('/dashboard')}
          style={{ padding:'10px 24px', borderRadius:12, border:'none', background:'#1a56db', color:'#fff', fontSize:13.5, fontWeight:600, cursor:'pointer' }}>
          ← Retour au Dashboard
        </button>
      </div>
    </div>
  )
}
