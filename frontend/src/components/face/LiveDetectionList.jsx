import { useEffect, useRef } from "react";

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const COLORS = [
  "linear-gradient(135deg,#1a56db,#7c3aed)",
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#7c3aed,#a855f7)",
  "linear-gradient(135deg,#06b6d4,#0891b2)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
];

function hashColor(name = "") {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % COLORS.length;
  return COLORS[h];
}

export default function LiveDetectionList({ detections = [], attendanceList = [] }) {
  const listRef = useRef(null);

  // Combiner les deux sources
  const items = [
    ...detections.map((d) => ({
      name: d.found ? d.person_name : "Inconnu",
      role: d.person_type === "staff" ? "Personnel" : "Élève",
      confidence: d.confidence,
      found: d.found,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    })),
    ...attendanceList.map((a) => ({
      name: a.student_name || "Élève",
      role: "Élève",
      confidence: a.confidence || 0.95,
      found: true,
      time: a.time || "",
    })),
  ].slice(0, 20);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        color: "#94a3b8", gap: 8,
      }}>
        <span style={{ fontSize: 36 }}>👁️</span>
        <span style={{ fontSize: 13 }}>En attente de détections…</span>
      </div>
    );
  }

  return (
    <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", maxHeight: 400 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 12px",
          background: item.found ? "#f8fafc" : "#fff7ed",
          borderRadius: 10,
          border: `1px solid ${item.found ? "#e2e8f0" : "rgba(249,115,22,.3)"}`,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: item.found ? hashColor(item.name) : "linear-gradient(135deg,#f97316,#ef4444)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0,
          }}>
            {item.found ? getInitials(item.name) : "?"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: item.found ? "#0f172a" : "#c2410c", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10,
                background: item.role === "Personnel" ? "#ede9fe" : "#eff6ff",
                color: item.role === "Personnel" ? "#7c3aed" : "#1a56db",
              }}>
                {item.role}
              </span>
              <span style={{ fontSize: 11, color: "#64748b" }}>{item.time}</span>
            </div>
            {/* Barre confiance */}
            <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: "#e2e8f0", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2,
                width: `${(item.confidence * 100).toFixed(0)}%`,
                background: item.confidence > 0.8 ? "#10b981" : item.confidence > 0.5 ? "#f59e0b" : "#ef4444",
                transition: "width .5s",
              }} />
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: item.found ? "#10b981" : "#f97316" }}>
            {item.found ? `${(item.confidence * 100).toFixed(1)}%` : "⚠️"}
          </div>
        </div>
      ))}
    </div>
  );
}
