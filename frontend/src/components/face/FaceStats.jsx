import { useState } from "react";

export default function FaceStats() {
  const [threshold, setThreshold] = useState(75);
  const [autoRecord, setAutoRecord] = useState(true);
  const [alertUnknown, setAlertUnknown] = useState(true);

  const stats = {
    enrolled: 42,
    photos: 198,
    accuracy: 97.3,
    recognitionRate: 94.1,
  };

  const kpis = [
    { label: "Personnes enrôlées", value: stats.enrolled, icon: "👤", color: "#1a56db" },
    { label: "Photos en base", value: stats.photos, icon: "🖼️", color: "#7c3aed" },
    { label: "Précision moyenne", value: `${stats.accuracy}%`, icon: "🎯", color: "#10b981" },
    { label: "Taux reconnaissance", value: `${stats.recognitionRate}%`, icon: "✅", color: "#f59e0b" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{
            background: "#f8fafc", borderRadius: 10, padding: "12px 14px",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{ fontSize: 22 }}>{k.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color, fontFamily: "JetBrains Mono, monospace" }}>
              {k.value}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Répartition */}
      <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14, border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 10 }}>
          RÉPARTITION
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Élèves", value: 35, total: 42, color: "#1a56db" },
            { label: "Personnel", value: 7, total: 42, color: "#7c3aed" },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "#475569", fontWeight: 600 }}>{item.label}</span>
                <span style={{ color: item.color, fontWeight: 700 }}>{item.value}</span>
              </div>
              <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3 }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  width: `${(item.value / item.total) * 100}%`,
                  background: item.color,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paramètres IA */}
      <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14, border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 12 }}>
          ⚙️ PARAMÈTRES IA
        </div>

        {/* Slider seuil */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
            <span style={{ color: "#475569", fontWeight: 600 }}>Seuil de confiance</span>
            <span style={{ color: "#1a56db", fontWeight: 700 }}>{threshold}%</span>
          </div>
          <input
            type="range" min={50} max={99} value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#1a56db" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8" }}>
            <span>50% (permissif)</span><span>99% (strict)</span>
          </div>
        </div>

        {/* Toggles */}
        {[
          { label: "Enregistrement auto présences", value: autoRecord, set: setAutoRecord },
          { label: "Alertes personnes inconnues", value: alertUnknown, set: setAlertUnknown },
        ].map((item) => (
          <div key={item.label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 10,
          }}>
            <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>{item.label}</span>
            <div
              onClick={() => item.set(!item.value)}
              style={{
                width: 40, height: 22, borderRadius: 11, cursor: "pointer",
                background: item.value ? "#1a56db" : "#cbd5e1",
                position: "relative", transition: "background .2s",
              }}
            >
              <div style={{
                position: "absolute", top: 3,
                left: item.value ? 20 : 3,
                width: 16, height: 16, borderRadius: "50%",
                background: "#fff", transition: "left .2s",
                boxShadow: "0 1px 3px rgba(0,0,0,.2)",
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Status modèles */}
      <div style={{ background: "#f0fdf4", borderRadius: 10, padding: 12, border: "1px solid #bbf7d0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>
          STATUS MODÈLES IA
        </div>
        {[
          { name: "YOLOv8n-face", status: "En ligne" },
          { name: "ArcFace (buffalo_l)", status: "En ligne" },
          { name: "pgvector 512-dim", status: "Connecté" },
        ].map((m) => (
          <div key={m.name} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 6, fontSize: 12,
          }}>
            <span style={{ color: "#475569", fontWeight: 600 }}>{m.name}</span>
            <span style={{
              background: "#dcfce7", color: "#16a34a",
              padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700,
            }}>✅ {m.status}</span>
          </div>
        ))}
      </div>

      <button style={{
        background: "#0b1437", color: "#fff", border: "none",
        borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700,
        cursor: "pointer", width: "100%",
      }}>
        🔧 Recalibrer le modèle
      </button>
    </div>
  );
}
