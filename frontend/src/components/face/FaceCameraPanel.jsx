import { useRef } from "react";
import Webcam from "react-webcam";
import FaceDetectionOverlay from "./FaceDetectionOverlay";

const STATUS = {
  IDLE:     { label: "Caméra prête",     color: "#64748b" },
  SCANNING: { label: "Analyse en cours…", color: "#f59e0b" },
  DETECTED: { label: "Visage détecté ✓", color: "#10b981" },
  ERROR:    { label: "Mode démo",         color: "#7c3aed" },
};

export default function FaceCameraPanel({
  webcamRef, isCameraActive, isScanning, isContinuous,
  detections, error, onStart, onStop, onCapture,
  onStartContinuous, onStopContinuous, onDemoCapture,
}) {
  const status = error ? "ERROR" : isScanning ? "SCANNING" : detections.length > 0 ? "DETECTED" : "IDLE";
  const cfg    = STATUS[status];

  return (
    <div style={{
      background: "#0b1437", borderRadius: 16, padding: 20,
      display: "flex", flexDirection: "column", gap: 14, minHeight: 480,
    }}>
      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 10, height: 10, borderRadius: "50%", display: "inline-block",
            background: isCameraActive ? "#10b981" : "#475569",
            boxShadow: isCameraActive ? "0 0 8px #10b981" : "none",
            animation: isCameraActive ? "pulse 2s infinite" : "none",
          }} />
          <span style={{ color: "rgba(255,255,255,.85)", fontSize: 13, fontWeight: 700 }}>
            Caméra d'entrée — Temps réel
          </span>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
          background: "rgba(255,255,255,.08)", color: cfg.color,
        }}>
          {cfg.label}
        </span>
      </div>

      {/* Zone vidéo */}
      <div style={{
        position: "relative", flex: 1, borderRadius: 10, overflow: "hidden",
        background: "#050b1e", border: "2px solid rgba(26,86,219,.25)", minHeight: 280,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isCameraActive ? (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15 } }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onUserMediaError={() => {}}
            />
            <FaceDetectionOverlay detections={detections} />
            {isContinuous && (
              <div style={{
                position: "absolute", top: 10, right: 10,
                background: "rgba(16,185,129,.15)", border: "1px solid #10b981",
                borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#10b981", fontWeight: 800,
              }}>
                ● MODE CONTINU
              </div>
            )}
            {/* Overlay détections dessinées */}
            {detections.length > 0 && (
              <div style={{
                position: "absolute", bottom: 10, left: 10,
                background: "rgba(16,185,129,.15)", border: "1px solid #10b981",
                borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#10b981", fontWeight: 800,
              }}>
                ✓ {detections.filter(d => d.found).length} détecté(s)
              </div>
            )}
          </>
        ) : (
          /* Écran vide — pas de caméra */
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, #0a0f1e, #0d1a3a)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ textAlign: "center", color: "rgba(255,255,255,.4)" }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🎥</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>YOLOv8 + ArcFace</div>
              <div style={{ fontSize: 11, marginTop: 6, color: "rgba(255,255,255,.25)" }}>
                Démarrez la caméra ou utilisez le mode démo
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contrôles principaux */}
      <div style={{ display: "flex", gap: 8 }}>
        {!isCameraActive ? (
          <button onClick={onStart} style={{ ...btn("#1a56db"), flex: 1 }}>
            ▶ Démarrer la caméra
          </button>
        ) : (
          <>
            <button onClick={onStop}    style={{ ...btn("#ef4444"), flex: 1 }}>⏹ Arrêter</button>
            <button onClick={onCapture} disabled={isScanning} style={{ ...btn("#7c3aed"), flex: 1 }}>
              {isScanning ? "⏳…" : "📸 Capturer"}
            </button>
            {!isContinuous
              ? <button onClick={onStartContinuous} style={{ ...btn("#059669"), flex: 1 }}>🔁 Continu</button>
              : <button onClick={onStopContinuous}  style={{ ...btn("#d97706", "#000"), flex: 1 }}>⏸ Pause</button>
            }
          </>
        )}
      </div>

      {/* ── Bouton démo toujours visible ── */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,.08)",
        paddingTop: 12,
        display: "flex", gap: 8, alignItems: "center",
      }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)", flexShrink: 0 }}>
          MODE DÉMO :
        </span>
        <button
          onClick={onDemoCapture}
          disabled={isScanning}
          style={{
            flex: 1, background: isScanning ? "#334155" : "rgba(124,58,237,.25)",
            color: isScanning ? "#64748b" : "#a78bfa",
            border: "1px solid rgba(124,58,237,.4)",
            borderRadius: 8, padding: "8px 0",
            fontSize: 12, fontWeight: 800, cursor: isScanning ? "not-allowed" : "pointer",
            transition: "all .2s",
          }}
        >
          {isScanning ? "⏳ Analyse en cours…" : "🎭 Simuler une détection"}
        </button>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
    </div>
  );
}

function btn(bg, color = "#fff") {
  return {
    background: bg, color, border: "none", borderRadius: 8,
    padding: "9px 10px", fontSize: 12, fontWeight: 800, cursor: "pointer",
  };
}
