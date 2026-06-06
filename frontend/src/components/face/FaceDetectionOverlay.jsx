import { useEffect, useRef } from "react";

export default function FaceDetectionOverlay({ detections = [], width, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((det) => {
      const bbox = det.bbox || [50, 50, 200, 200];
      const [x, y, w, h] = bbox;
      const conf = det.confidence || 0;

      // Couleur selon confiance
      let color = "#ef4444"; // rouge
      if (conf > 0.8) color = "#10b981"; // vert
      else if (conf > 0.5) color = "#f59e0b"; // orange

      // Rectangle
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.strokeRect(x, y, w, h);

      // Coins stylisés
      const cLen = 15;
      ctx.lineWidth = 3;
      // coin haut-gauche
      ctx.beginPath(); ctx.moveTo(x, y + cLen); ctx.lineTo(x, y); ctx.lineTo(x + cLen, y); ctx.stroke();
      // coin haut-droit
      ctx.beginPath(); ctx.moveTo(x + w - cLen, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cLen); ctx.stroke();
      // coin bas-gauche
      ctx.beginPath(); ctx.moveTo(x, y + h - cLen); ctx.lineTo(x, y + h); ctx.lineTo(x + cLen, y + h); ctx.stroke();
      // coin bas-droit
      ctx.beginPath(); ctx.moveTo(x + w - cLen, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cLen); ctx.stroke();

      // Label
      const label = det.found
        ? `${det.person_name || "Inconnu"} — ${(conf * 100).toFixed(1)}%`
        : `Inconnu — ${(conf * 100).toFixed(1)}%`;
      ctx.font = "bold 12px DM Sans, sans-serif";
      const textW = ctx.measureText(label).width;
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(x, y - 22, textW + 10, 20);
      ctx.fillStyle = color;
      ctx.fillText(label, x + 5, y - 7);
    });
  }, [detections]);

  return (
    <canvas
      ref={canvasRef}
      width={width || 640}
      height={height || 480}
      style={{
        position: "absolute",
        top: 0, left: 0,
        width: "100%", height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
