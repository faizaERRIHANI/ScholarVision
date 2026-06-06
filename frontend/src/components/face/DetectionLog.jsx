import { useState } from "react";

const DEMO_LOGS = [
  { time: "07:28:14", name: "Karim Mansouri", role: "3ème B", confidence: 98.4, result: "Reconnu", type: "student" },
  { time: "07:29:02", name: "Sara Filali", role: "CE2 A", confidence: 97.1, result: "Reconnu", type: "student" },
  { time: "07:31:55", name: "Inconnu", role: "—", confidence: 34.2, result: "Non reconnu", type: "unknown" },
  { time: "07:33:10", name: "Prof. Benali", role: "Enseignant", confidence: 99.1, result: "Reconnu", type: "staff" },
  { time: "07:35:44", name: "Lina Benali", role: "1ère Tech", confidence: 95.8, result: "Reconnu", type: "student" },
  { time: "07:38:21", name: "Inconnu", role: "—", confidence: 41.3, result: "Non reconnu", type: "unknown" },
  { time: "07:41:22", name: "Mehdi Berrada", role: "Term. S", confidence: 96.7, result: "Reconnu", type: "student" },
];

export default function DetectionLog() {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = filter === "all" ? DEMO_LOGS : DEMO_LOGS.filter((l) => l.type === filter);
  const total = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const exportCSV = () => {
    const header = "Heure,Personne,Classe/Rôle,Confiance,Résultat\n";
    const rows = DEMO_LOGS.map((l) =>
      `${l.time},${l.name},${l.role},${l.confidence}%,${l.result}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "detection_log.csv"; a.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Filtres + Export */}
      <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { key: "all", label: "Tous" },
            { key: "student", label: "Élèves" },
            { key: "staff", label: "Personnel" },
            { key: "unknown", label: "Inconnus" },
          ].map((f) => (
            <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }} style={{
              padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
              border: "none", cursor: "pointer",
              background: filter === f.key ? "#1a56db" : "#f1f5f9",
              color: filter === f.key ? "#fff" : "#64748b",
            }}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={exportCSV} style={{
          padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
          background: "#f1f5f9", color: "#475569", border: "none", cursor: "pointer",
        }}>
          📥 CSV
        </button>
      </div>

      {/* Tableau */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Heure", "Personne", "Classe/Rôle", "Confiance", "Résultat"].map((h) => (
                <th key={h} style={{
                  padding: "8px 10px", textAlign: "left",
                  fontSize: 11, fontWeight: 700, color: "#64748b",
                  borderBottom: "1px solid #e2e8f0",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((log, i) => (
              <tr key={i} style={{
                background: log.type === "unknown" ? "#fff7ed" : "#fff",
                borderBottom: "1px solid #f1f5f9",
              }}>
                <td style={{ padding: "8px 10px", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#64748b" }}>
                  {log.time}
                </td>
                <td style={{ padding: "8px 10px", fontWeight: 600, color: log.type === "unknown" ? "#c2410c" : "#0f172a" }}>
                  {log.name}
                </td>
                <td style={{ padding: "8px 10px", color: "#475569" }}>{log.role}</td>
                <td style={{ padding: "8px 10px" }}>
                  <span style={{
                    fontWeight: 700,
                    color: log.confidence > 80 ? "#059669" : log.confidence > 50 ? "#d97706" : "#dc2626",
                    fontFamily: "JetBrains Mono, monospace",
                  }}>
                    {log.confidence}%
                  </span>
                </td>
                <td style={{ padding: "8px 10px" }}>
                  <span style={{
                    padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                    background: log.type === "unknown" ? "#ffedd5" : "#dcfce7",
                    color: log.type === "unknown" ? "#c2410c" : "#16a34a",
                  }}>
                    {log.type === "unknown" ? "⚠️ " : "✅ "}{log.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {Array.from({ length: total }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{
              width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer",
              background: page === i + 1 ? "#1a56db" : "#f1f5f9",
              color: page === i + 1 ? "#fff" : "#64748b",
              fontWeight: 700, fontSize: 12,
            }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
