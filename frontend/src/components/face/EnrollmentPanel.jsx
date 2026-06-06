import { useState } from "react";

const ANGLES = [
  { key: "face", label: "Face", icon: "😐", hint: "Regardez directement la caméra" },
  { key: "left", label: "Gauche 45°", icon: "👈", hint: "Tournez légèrement à gauche" },
  { key: "right", label: "Droite 45°", icon: "👉", hint: "Tournez légèrement à droite" },
  { key: "up", label: "Haut", icon: "☝️", hint: "Levez légèrement la tête" },
  { key: "down", label: "Bas", icon: "👇", hint: "Baissez légèrement la tête" },
];

export default function EnrollmentPanel({ enrollmentPhotos, onCapture, onReset, onSubmit }) {
  const [step, setStep] = useState(1);
  const [personType, setPersonType] = useState("student");
  const [personName, setPersonName] = useState("");
  const [personId, setPersonId] = useState("");
  const [currentAngle, setCurrentAngle] = useState("face");
  const [submitting, setSubmitting] = useState(false);

  const capturedCount = Object.keys(enrollmentPhotos).length;
  const allCaptured = capturedCount === 5;

  const handleCapture = () => {
    onCapture(currentAngle);
    const nextIdx = ANGLES.findIndex((a) => a.key === currentAngle) + 1;
    if (nextIdx < ANGLES.length) setCurrentAngle(ANGLES[nextIdx].key);
  };

  const handleSubmit = async () => {
    if (!personId || !personName) return;
    setSubmitting(true);
    await onSubmit(personId, personType, personName);
    setSubmitting(false);
    setStep(1);
    setPersonName("");
    setPersonId("");
    setCurrentAngle("face");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stepper */}
      <div style={{ display: "flex", gap: 0 }}>
        {["Personne", "Photos", "Valider"].map((label, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", margin: "0 auto 4px",
              background: step > i + 1 ? "#10b981" : step === i + 1 ? "#1a56db" : "#e2e8f0",
              color: step >= i + 1 ? "#fff" : "#94a3b8",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
            }}>
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <div style={{ fontSize: 11, color: step === i + 1 ? "#1a56db" : "#94a3b8", fontWeight: 600 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["student", "staff"].map((type) => (
              <button key={type} onClick={() => setPersonType(type)} style={{
                flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: personType === type ? "#1a56db" : "#f1f5f9",
                color: personType === type ? "#fff" : "#64748b",
                border: "none",
              }}>
                {type === "student" ? "🎓 Élève" : "👨‍🏫 Personnel"}
              </button>
            ))}
          </div>
          <input
            placeholder="Identifiant (ex: EL-2024-0042)"
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Nom complet"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            style={inputStyle}
          />
          <button
            onClick={() => setStep(2)}
            disabled={!personId || !personName}
            style={{
              ...btnPrimary,
              opacity: (!personId || !personName) ? 0.5 : 1,
            }}
          >
            Continuer →
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
            {personName} — <span style={{ color: "#1a56db" }}>{capturedCount}/5 photos</span>
          </div>

          {/* Barre de progression */}
          <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              width: `${(capturedCount / 5) * 100}%`,
              background: "#10b981", transition: "width .3s",
            }} />
          </div>

          {/* Grille des angles */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ANGLES.map((angle) => {
              const captured = !!enrollmentPhotos[angle.key];
              const active = currentAngle === angle.key;
              return (
                <div
                  key={angle.key}
                  onClick={() => setCurrentAngle(angle.key)}
                  style={{
                    padding: 10, borderRadius: 10, cursor: "pointer",
                    border: `2px solid ${active ? "#1a56db" : captured ? "#10b981" : "#e2e8f0"}`,
                    background: captured ? "#f0fdf4" : active ? "#eff6ff" : "#f8fafc",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  }}
                >
                  {captured && enrollmentPhotos[angle.key] ? (
                    <img
                      src={enrollmentPhotos[angle.key]}
                      style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover" }}
                      alt={angle.label}
                    />
                  ) : (
                    <span style={{ fontSize: 28 }}>{angle.icon}</span>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 700, color: captured ? "#059669" : active ? "#1a56db" : "#64748b" }}>
                    {captured ? "✅" : "⏳"} {angle.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hint de l'angle courant */}
          <div style={{
            background: "#eff6ff", borderRadius: 8, padding: "8px 12px",
            fontSize: 12, color: "#1a56db", fontWeight: 600, textAlign: "center",
          }}>
            {ANGLES.find((a) => a.key === currentAngle)?.hint}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleCapture} style={{ ...btnPrimary, flex: 2 }}>
              📸 Capturer — {ANGLES.find((a) => a.key === currentAngle)?.label}
            </button>
            <button onClick={() => { onReset(); setCurrentAngle("face"); }} style={{ ...btnSecondary, flex: 1 }}>
              🔄 Reset
            </button>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep(1)} style={{ ...btnSecondary, flex: 1 }}>← Retour</button>
            <button
              onClick={() => setStep(3)}
              disabled={!allCaptured}
              style={{ ...btnPrimary, flex: 2, opacity: allCaptured ? 1 : 0.5 }}
            >
              Valider ({capturedCount}/5) →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
            Confirmer l'enrôlement
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 12, fontSize: 13 }}>
            <div><strong>Nom :</strong> {personName}</div>
            <div><strong>ID :</strong> {personId}</div>
            <div><strong>Type :</strong> {personType === "student" ? "Élève" : "Personnel"}</div>
            <div><strong>Photos :</strong> {capturedCount}/5 ✅</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {ANGLES.map((angle) => (
              <img
                key={angle.key}
                src={enrollmentPhotos[angle.key]}
                style={{ width: "100%", aspectRatio: "1", borderRadius: 6, objectFit: "cover" }}
                alt={angle.label}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep(2)} style={{ ...btnSecondary, flex: 1 }}>← Modifier</button>
            <button onClick={handleSubmit} disabled={submitting} style={{ ...btnPrimary, flex: 2 }}>
              {submitting ? "⏳ Enrôlement…" : "✅ Valider l'enrôlement"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none",
  boxSizing: "border-box",
};
const btnPrimary = {
  background: "#1a56db", color: "#fff", border: "none",
  borderRadius: 8, padding: "10px 16px", fontSize: 13,
  fontWeight: 700, cursor: "pointer", width: "100%",
};
const btnSecondary = {
  background: "#f1f5f9", color: "#475569", border: "none",
  borderRadius: 8, padding: "10px 16px", fontSize: 13,
  fontWeight: 700, cursor: "pointer", width: "100%",
};
