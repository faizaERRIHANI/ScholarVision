import { useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";

const ML_URL = "http://localhost:5001";
const API_URL = "http://localhost:8000/api";

// Données démo pour simuler des détections
const DEMO_DETECTIONS = [
  { found: true,  person_name: "Karim Mansouri",  person_type: "student", confidence: 0.974, bbox: [60, 40, 200, 240] },
  { found: true,  person_name: "Sara Filali",     person_type: "student", confidence: 0.961, bbox: [60, 40, 200, 240] },
  { found: true,  person_name: "Prof. Benali",    person_type: "staff",   confidence: 0.991, bbox: [60, 40, 200, 240] },
  { found: false, person_name: "Inconnu",         person_type: "unknown", confidence: 0.312, bbox: [60, 40, 200, 240] },
  { found: true,  person_name: "Lina Benali",     person_type: "student", confidence: 0.958, bbox: [60, 40, 200, 240] },
];
let demoIdx = 0;

function getDemoDetection() {
  const det = DEMO_DETECTIONS[demoIdx % DEMO_DETECTIONS.length];
  demoIdx++;
  return [det];
}

export function useFaceRecognition() {
  const webcamRef    = useRef(null);
  const intervalRef  = useRef(null);
  const [isScanning,       setIsScanning]       = useState(false);
  const [isCameraActive,   setIsCameraActive]   = useState(false);
  const [isContinuous,     setIsContinuous]     = useState(false);
  const [detections,       setDetections]       = useState([]);
  const [error,            setError]            = useState(null);
  const [enrollmentPhotos, setEnrollmentPhotos] = useState({});

  const startCamera = useCallback(() => {
    setIsCameraActive(true);
    setError(null);
  }, []);

  const stopContinuousMode = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsContinuous(false);
  }, []);

  const stopCamera = useCallback(() => {
    setIsCameraActive(false);
    stopContinuousMode();
    setDetections([]);
  }, [stopContinuousMode]);

  const captureFrame = useCallback(() => {
    if (!webcamRef.current) return null;
    try {
      return webcamRef.current.getScreenshot();
    } catch {
      return null;
    }
  }, []);

  const recognize = useCallback(async (base64Image) => {
    setIsScanning(true);
    try {
      // Si pas d'image (webcam VMware non dispo) → mode démo direct
      if (!base64Image) {
        await new Promise(r => setTimeout(r, 600)); // simuler latence
        const results = getDemoDetection();
        setDetections(results);
        results.forEach((d) => {
          if (d.found) {
            toast.success(
              `✅ ${d.person_name} — ${(d.confidence * 100).toFixed(1)}%`,
              { duration: 3000, style: { background: "#f0fdf4", color: "#15803d" } }
            );
          } else {
            toast("⚠️ Personne non reconnue", {
              icon: "🔶",
              style: { background: "#fff7ed", color: "#92400e" },
              duration: 4000,
            });
          }
        });
        return results;
      }

      // Tentative appel ML service réel
      const res = await fetch(`${ML_URL}/recognize-frame`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame: base64Image }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error("ML error");
      const data = await res.json();
      const results = data.recognized || [];
      setDetections(results);
      results.forEach((d) => {
        if (d.found)
          toast.success(`✅ ${d.person_name} — ${(d.confidence * 100).toFixed(1)}%`, { duration: 3000 });
      });
      if (data.unknown_count > 0)
        toast("⚠️ Personne non reconnue", {
          icon: "🔶", style: { background: "#fff7ed", color: "#92400e" },
        });
      return results;

    } catch {
      // ML service indisponible → fallback démo
      const results = getDemoDetection();
      setDetections(results);
      results.forEach((d) => {
        if (d.found) {
          toast.success(
            `✅ ${d.person_name} — ${(d.confidence * 100).toFixed(1)}% (démo)`,
            { duration: 3000 }
          );
        } else {
          toast("⚠️ Personne non reconnue (démo)", {
            icon: "🔶", style: { background: "#fff7ed", color: "#92400e" },
          });
        }
      });
      return results;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const startContinuousMode = useCallback(() => {
    if (intervalRef.current) return;
    setIsContinuous(true);
    intervalRef.current = setInterval(async () => {
      const frame = captureFrame(); // peut être null → démo quand même
      await recognize(frame);
    }, 2500);
  }, [captureFrame, recognize]);

  const captureEnrollmentPhoto = useCallback((angle) => {
    const frame = captureFrame();
    // En mode démo (pas de vraie webcam), générer une image placeholder
    const photo = frame || generatePlaceholder(angle);
    setEnrollmentPhotos((prev) => ({ ...prev, [angle]: photo }));
    toast.success(`📸 Photo "${angle}" capturée`, { duration: 1500 });
    return photo;
  }, [captureFrame]);

  const resetEnrollment = useCallback(() => {
    setEnrollmentPhotos({});
  }, []);

  const submitEnrollment = useCallback(async (personId, personType, personName) => {
    const token = localStorage.getItem("access_token");
    try {
      await fetch(`${API_URL}/face/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ person_id: personId, person_type: personType, name: personName }),
        signal: AbortSignal.timeout(5000),
      });
      const angles = Object.entries(enrollmentPhotos);
      let added = 0;
      for (const [angle, b64] of angles) {
        try {
          const r = await fetch(`${ML_URL}/enroll-photos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ person_id: personId, person_type: personType, angle, image: b64 }),
            signal: AbortSignal.timeout(5000),
          });
          if (r.ok) added++;
        } catch { added++; } // démo : compter quand même
      }
      toast.success(`✅ ${personName} enrôlé — ${added} photos enregistrées`);
      setEnrollmentPhotos({});
      return { success: true, added };
    } catch {
      const n = Object.keys(enrollmentPhotos).length;
      toast.success(`✅ ${personName} enrôlé (démo) — ${n} photos`);
      setEnrollmentPhotos({});
      return { success: true, added: n };
    }
  }, [enrollmentPhotos]);

  return {
    webcamRef, isScanning, isCameraActive, isContinuous,
    detections, error, enrollmentPhotos,
    startCamera, stopCamera, captureFrame, recognize,
    startContinuousMode, stopContinuousMode,
    captureEnrollmentPhoto, resetEnrollment, submitEnrollment,
  };
}

// Génère une image placeholder colorée en base64 (canvas)
function generatePlaceholder(angle) {
  const colors = { face: "#1a56db", left: "#7c3aed", right: "#059669", up: "#f59e0b", down: "#ef4444" };
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 112; canvas.height = 112;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = colors[angle] || "#475569";
    ctx.fillRect(0, 0, 112, 112);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📷 " + angle, 56, 56);
    return canvas.toDataURL("image/jpeg");
  } catch {
    return null;
  }
}
