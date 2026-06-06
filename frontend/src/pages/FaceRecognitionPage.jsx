import { useState } from "react";
import FaceCameraPanel from "../components/face/FaceCameraPanel";
import LiveDetectionList from "../components/face/LiveDetectionList";
import EnrollmentPanel from "../components/face/EnrollmentPanel";
import FaceStats from "../components/face/FaceStats";
import DetectionLog from "../components/face/DetectionLog";
import { useFaceRecognition } from "../hooks/useFaceRecognition";
import { useAttendanceWebSocket } from "../hooks/useAttendanceWebSocket";

const TABS = [
  { key: "live", label: "🔴 Live", title: "Détections en direct" },
  { key: "enroll", label: "➕ Enrôlement", title: "Enrôler une personne" },
  { key: "stats", label: "📊 Statistiques IA", title: "Tableau de bord IA" },
  { key: "log", label: "📋 Journal", title: "Journal des détections" },
];

export default function FaceRecognitionPage() {
  const [activeTab, setActiveTab] = useState("live");

  const {
    webcamRef, isScanning, isCameraActive, isContinuous,
    detections, error, enrollmentPhotos,
    startCamera, stopCamera, captureFrame, recognize,
    startContinuousMode, stopContinuousMode,
    captureEnrollmentPhoto, resetEnrollment, submitEnrollment,
  } = useFaceRecognition();

  const { connected, attendanceList } = useAttendanceWebSocket();

  const handleCapture = async () => { // frame peut être null → démo
    const frame = captureFrame();
    if (frame) await recognize(frame);
  };

  // KPIs dynamiques
  const kpis = [
    {
      label: "Reconnus aujourd'hui",
      value: attendanceList.length + detections.filter((d) => d.found).length,
      icon: "✅", color: "#10b981",
    },
    { label: "Précision moyenne", value: "97.3%", icon: "🎯", color: "#1a56db" },
    { label: "Photos en base", value: "198", icon: "🖼️", color: "#7c3aed" },
    {
      label: "Alertes inconnus",
      value: detections.filter((d) => !d.found).length,
      icon: "⚠️", color: "#f59e0b",
    },
  ];

  return (
    <div style={{ padding: "24px 28px", fontFamily: "DM Sans, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0, fontFamily: "Playfair Display, serif" }}>
            Reconnaissance Faciale
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
            YOLOv8 + ArcFace + pgvector 512-dim
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: connected ? "#f0fdf4" : "#fff7ed",
            color: connected ? "#16a34a" : "#d97706",
            border: `1px solid ${connected ? "#bbf7d0" : "#fde68a"}`,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: connected ? "#10b981" : "#f59e0b",
              animation: connected ? "pulse 2s infinite" : "none",
              display: "inline-block",
            }} />
            {connected ? "WebSocket connecté" : "Mode démo"}
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{
            background: "#fff", borderRadius: 12, padding: "16px 18px",
            border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,.06)",
          }}>
            <div style={{ fontSize: 24 }}>{k.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color, fontFamily: "JetBrains Mono, monospace" }}>
              {k.value}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Layout principal 60/40 */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20, alignItems: "start" }}>
        {/* Panneau caméra */}
        <div style={{ minHeight: 520 }}>
          <FaceCameraPanel
            webcamRef={webcamRef}
            isCameraActive={isCameraActive}
            isScanning={isScanning}
            isContinuous={isContinuous}
            detections={detections}
            error={error}
            onStart={startCamera}
            onStop={stopCamera}
            onCapture={handleCapture}
            onDemoCapture={() => recognize(null)}
            onStartContinuous={startContinuousMode}
            onStopContinuous={stopContinuousMode}
          />
        </div>

        {/* Panneau droit avec onglets */}
        <div style={{
          background: "#fff", borderRadius: 16,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 4px rgba(0,0,0,.06)",
          overflow: "hidden",
        }}>
          {/* Onglets */}
          <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", overflowX: "auto" }}>
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: "12px 14px", fontSize: 12, fontWeight: 700,
                border: "none", cursor: "pointer", whiteSpace: "nowrap",
                background: activeTab === tab.key ? "#fff" : "#f8fafc",
                color: activeTab === tab.key ? "#1a56db" : "#64748b",
                borderBottom: activeTab === tab.key ? "2px solid #1a56db" : "2px solid transparent",
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenu de l'onglet */}
          <div style={{ padding: 18, minHeight: 420 }}>
            {activeTab === "live" && (
              <LiveDetectionList detections={detections} attendanceList={attendanceList} />
            )}
            {activeTab === "enroll" && (
              <EnrollmentPanel
                enrollmentPhotos={enrollmentPhotos}
                onCapture={captureEnrollmentPhoto}
                onReset={resetEnrollment}
                onSubmit={submitEnrollment}
              />
            )}
            {activeTab === "stats" && <FaceStats />}
            {activeTab === "log" && <DetectionLog />}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
