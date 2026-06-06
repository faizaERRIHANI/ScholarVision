import { useEffect, useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";

export function useAttendanceWebSocket() {
  const ws = useRef(null);
  const retryCount = useRef(0);
  const retryTimer = useRef(null);
  const maxRetries = 5;

  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);

  const connect = useCallback(() => {
    const token = localStorage.getItem("access_token");
    // Si pas de token ou service WS non dispo → mode démo
    if (!token) {
      setConnected(false);
      return;
    }
    try {
      const wsUrl = `ws://localhost:8000/ws/attendance?token=${token}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setConnected(true);
        setReconnecting(false);
        retryCount.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent(data);

          if (data.type === "attendance_recorded") {
            const { student_name, class_name, time } = data.payload || {};
            toast.success(`✅ ${student_name || "Élève"} — ${class_name || ""} — ${time || ""}`, { duration: 4000 });
            setAttendanceList((prev) => [data.payload, ...prev].slice(0, 20));
          } else if (data.type === "unknown_person") {
            toast("⚠️ Personne inconnue détectée", {
              icon: "🔶",
              style: { background: "#fff7ed", color: "#92400e" },
              duration: 5000,
            });
          } else if (data.type === "camera_status") {
            if (data.payload?.status === "offline") {
              toast.error("⚠️ Service IA indisponible");
            }
          }
        } catch (_) {}
      };

      ws.current.onclose = () => {
        setConnected(false);
        if (retryCount.current < maxRetries) {
          const delay = Math.pow(2, retryCount.current) * 1000;
          retryCount.current++;
          setReconnecting(true);
          retryTimer.current = setTimeout(connect, delay);
        } else {
          setReconnecting(false);
        }
      };

      ws.current.onerror = () => {
        ws.current?.close();
      };
    } catch (_) {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    const ping = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
    return () => {
      clearInterval(ping);
      clearTimeout(retryTimer.current);
      ws.current?.close();
    };
  }, [connect]);

  return { connected, reconnecting, lastEvent, attendanceList };
}
