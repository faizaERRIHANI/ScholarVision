import { useState } from 'react'
import { Card, Modal } from '../components/ui'

const DAYS   = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
const SLOTS  = ['08:00–09:00','09:00–10:00','10:00–11:00','11:00–12:00','13:00–14:00','14:00–15:00','15:00–16:00','16:00–17:00']
const CLASSES = ['3ème B','CE2 A','Term. S','5ème A','CM2 B','4ème A']

const SUBJECT_COLORS = {
  'Mathématiques':  { bg:'rgba(26,86,219,0.12)',  border:'#1a56db', text:'#1a56db' },
  'Français':       { bg:'rgba(124,58,237,0.12)', border:'#7c3aed', text:'#7c3aed' },
  'Sciences':       { bg:'rgba(16,185,129,0.12)', border:'#10b981', text:'#10b981' },
  'Histoire-Géo':   { bg:'rgba(245,158,11,0.12)', border:'#f59e0b', text:'#b45309' },
  'Anglais':        { bg:'rgba(249,115,22,0.12)', border:'#f97316', text:'#c2410c' },
  'Physique':       { bg:'rgba(59,130,246,0.12)', border:'#3b82f6', text:'#2563eb' },
  'SVT':            { bg:'rgba(5,150,105,0.12)',  border:'#059669', text:'#047857' },
  'EPS':            { bg:'rgba(244,63,94,0.12)',  border:'#f43f5e', text:'#f43f5e' },
}

const SCHEDULE_DATA = {
  '3ème B': {
    '0-0': { subject:'Mathématiques', teacher:'M. El Amrani',  room:'A201' },
    '0-1': { subject:'Français',      teacher:'Mme. Fassi',    room:'A201' },
    '0-2': { subject:'Sciences',      teacher:'M. Tahiri',     room:'Lab1' },
    '1-0': { subject:'Histoire-Géo',  teacher:'Mme. Benali',   room:'A201' },
    '1-1': { subject:'Mathématiques', teacher:'M. El Amrani',  room:'A201' },
    '1-4': { subject:'Anglais',       teacher:'M. Cherkaoui',  room:'A203' },
    '2-0': { subject:'Français',      teacher:'Mme. Fassi',    room:'A201' },
    '2-2': { subject:'Physique',      teacher:'Mme. Alaoui',   room:'Lab2' },
    '3-0': { subject:'SVT',           teacher:'Mme. Lahlou',   room:'Lab1' },
    '3-3': { subject:'Mathématiques', teacher:'M. El Amrani',  room:'A201' },
    '4-4': { subject:'EPS',           teacher:'M. Boujloud',   room:'Gymn' },
    '4-5': { subject:'Anglais',       teacher:'M. Cherkaoui',  room:'A203' },
    '5-0': { subject:'Histoire-Géo',  teacher:'Mme. Benali',   room:'A201' },
    '5-1': { subject:'Français',      teacher:'Mme. Fassi',    room:'A201' },
  }
}

export default function SchedulePage() {
  const [selectedClass, setSelectedClass] = useState('3ème B')
  const [showAddModal, setShowAddModal]   = useState(false)
  const [selectedSlot, setSelectedSlot]   = useState(null)
  const [newCourse, setNewCourse]         = useState({ subject:'', teacher:'', room:'' })

  const data = SCHEDULE_DATA[selectedClass] || {}

  const handleSlotClick = (di, si) => {
    if (!data[`${di}-${si}`]) {
      setSelectedSlot({ day: di, slot: si })
      setShowAddModal(true)
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Toolbar */}
      <Card>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:13, fontWeight:600, color:'#334155' }}>Classe :</span>
            <div style={{ display:'flex', gap:6 }}>
              {CLASSES.map(c => (
                <button key={c} onClick={() => setSelectedClass(c)}
                  style={{ padding:'7px 14px', borderRadius:10, border:'none', fontSize:12.5, fontWeight:500, cursor:'pointer', transition:'all 0.15s',
                    backgroundColor: selectedClass===c ? '#1a56db' : '#f1f5f9',
                    color: selectedClass===c ? '#fff' : '#64748b' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button style={{ padding:'8px 14px', borderRadius:12, border:'1px solid #e2e8f0', background:'#fff', color:'#475569', fontSize:13, cursor:'pointer' }}>
              📤 Exporter PDF
            </button>
            <button onClick={() => { setSelectedSlot(null); setShowAddModal(true) }}
              style={{ padding:'8px 16px', borderRadius:12, border:'none', background:'#1a56db', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              ➕ Ajouter créneau
            </button>
          </div>
        </div>
      </Card>

      {/* Grille */}
      <Card padding={false} style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:900 }}>
          <thead>
            <tr style={{ borderBottom:'2px solid #f1f5f9' }}>
              <th style={{ width:120, padding:'14px 16px', fontSize:11.5, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', textAlign:'left' }}>Horaire</th>
              {DAYS.map(day => (
                <th key={day} style={{ padding:'14px 8px', fontSize:12, fontWeight:700, color:'#334155', textTransform:'uppercase', letterSpacing:'0.05em', textAlign:'center' }}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot, si) => (
              <tr key={si} style={{ borderBottom:'1px solid #f8fafc' }}>
                <td style={{ padding:'8px 16px', fontSize:11.5, fontFamily:"'JetBrains Mono',monospace", color:'#94a3b8', whiteSpace:'nowrap', verticalAlign:'middle' }}>
                  {slot}
                </td>
                {DAYS.map((_, di) => {
                  const course = data[`${di}-${si}`]
                  const colors = course ? SUBJECT_COLORS[course.subject] : null
                  return (
                    <td key={di} style={{ padding:'4px 6px', verticalAlign:'top', height:72 }}>
                      {course ? (
                        <div style={{
                          height:'100%', minHeight:64, borderRadius:10, padding:'8px 10px',
                          backgroundColor: colors?.bg || '#f8fafc',
                          borderLeft: `3px solid ${colors?.border || '#e2e8f0'}`,
                          cursor:'pointer', transition:'all 0.15s'
                        }}
                          onMouseEnter={e => e.currentTarget.style.opacity='0.8'}
                          onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                          <div style={{ fontSize:12, fontWeight:700, color: colors?.text || '#475569', lineHeight:1.3 }}>{course.subject}</div>
                          <div style={{ fontSize:10.5, color:'#64748b', marginTop:3 }}>{course.teacher}</div>
                          <div style={{ fontSize:10, color:'#94a3b8', marginTop:1 }}>🚪 {course.room}</div>
                        </div>
                      ) : (
                        <div onClick={() => handleSlotClick(di, si)}
                          style={{ height:'100%', minHeight:64, borderRadius:10, border:'2px dashed #f1f5f9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor='#c7d2fe'; e.currentTarget.style.backgroundColor='rgba(26,86,219,0.03)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor='#f1f5f9'; e.currentTarget.style.backgroundColor='' }}>
                          <span style={{ color:'#e2e8f0', fontSize:18 }}>+</span>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Légende */}
        <div style={{ padding:'12px 20px', borderTop:'1px solid #f1f5f9', display:'flex', flexWrap:'wrap', gap:12 }}>
          {Object.entries(SUBJECT_COLORS).map(([name, c]) => (
            <div key={name} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:10, height:10, borderRadius:3, backgroundColor: c.border }}/>
              <span style={{ fontSize:11.5, color:'#64748b' }}>{name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal ajout */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter un créneau" size="sm">
        <div style={{ padding:24, display:'flex', flexDirection:'column', gap:14 }}>
          {selectedSlot && (
            <div style={{ padding:'10px 14px', borderRadius:10, backgroundColor:'#f8fafc', fontSize:13, color:'#475569' }}>
              📅 <strong>{DAYS[selectedSlot.day]}</strong> · {SLOTS[selectedSlot.slot]}
            </div>
          )}
          {[
            { label:'Matière', key:'subject', placeholder:'ex: Mathématiques' },
            { label:'Professeur', key:'teacher', placeholder:'ex: M. El Amrani' },
            { label:'Salle', key:'room', placeholder:'ex: A201' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize:13, fontWeight:600, color:'#334155', display:'block', marginBottom:5 }}>{f.label}</label>
              <input value={newCourse[f.key]} onChange={e => setNewCourse(p => ({...p, [f.key]: e.target.value}))}
                placeholder={f.placeholder}
                style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:12, padding:'10px 14px', fontSize:13, outline:'none', boxSizing:'border-box' }}
                onFocus={e => e.target.style.borderColor='#1a56db'}
                onBlur={e => e.target.style.borderColor='#e2e8f0'}/>
            </div>
          ))}
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:4 }}>
            <button onClick={() => setShowAddModal(false)}
              style={{ padding:'9px 20px', borderRadius:12, border:'1px solid #e2e8f0', background:'#fff', color:'#475569', fontSize:13, cursor:'pointer' }}>
              Annuler
            </button>
            <button onClick={() => setShowAddModal(false)}
              style={{ padding:'9px 20px', borderRadius:12, border:'none', background:'#1a56db', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              ✅ Enregistrer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
