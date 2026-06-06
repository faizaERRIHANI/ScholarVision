import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";

export function useAttendanceWebSocket(token) {
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const wsRef = useRef(null);
  const retryRef = useRef(0);
  const pingRef = useRef(null);
  const MAX_RETRIES = 5;

  const connect = useCallback(() => {
    if (!token) return;
    try {
      wsRef.current = new WebSocket(`ws://localhost:8000/ws/attendance?token=${token}`);

      wsRef.current.onopen = () => {
        setConnected(true);
        setReconnecting(false);
        retryRef.current = 0;
        pingRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN)
            wsRef.current.send(JSON.stringify({ type: "ping" }));
        }, 30000);
      };

      wsRef.current.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setLastEvent(data);
          if (data.type === "attendance_recorded") {
            const { student_name, class_name, timestamp } = data.data;
            const t = new Date(timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
            toast.success(`✅ ${student_name} — ${class_name} — ${t}`, { duration: 4000, position: "bottom-right" });
            setAttendanceList(prev => [data.data, ...prev].slice(0, 50));
          } else if (data.type === "unknown_person_detected") {
            toast.error("⚠️ Personne inconnue détectée !", { duration: 8000, position: "top-center" });
          } else if (data.type === "camera_status") {
            if (data.data.status === "offline") toast.error("📷 Service IA hors ligne");
            else if (data.data.status === "online") toast.success("📷 Service IA reconnecté");
          }
        } catch {}
      };

      wsRef.current.onclose = (e) => {
        setConnected(false);
        clearInterval(pingRef.current);
        if (retryRef.current < MAX_RETRIES && e.code !== 4001 && e.code !== 4003) {
          setReconnecting(true);
          const delay = Math.pow(2, retryRef.current) * 1000;
          retryRef.current += 1;
          setTimeout(connect, delay);
        } else {
          setReconnecting(false);
        }
      };
    } catch (err) {
      console.error("WS error:", err);
    }
  }, [token]);

  useEffect(() => {
    connect();
    return () => { clearInterval(pingRef.current); wsRef.current?.close(1000); };
  }, [connect]);

  return { connected, reconnecting, lastEvent, attendanceList };
}

export function useNotificationsWebSocket(token, onNewNotification) {
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef(null);
  const retryRef = useRef(0);

  const connect = useCallback(() => {
    if (!token) return;
    wsRef.current = new WebSocket(`ws://localhost:8000/ws/notifications?token=${token}`);
    wsRef.current.onopen = () => { setConnected(true); retryRef.current = 0; };
    wsRef.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "new_notification") {
          setUnreadCount(c => c + 1);
          const { title, message, priority } = data.data;
          if (priority === "urgent") toast.error(`🔔 ${title}: ${message}`, { duration: 8000 });
          else toast(`🔔 ${title}: ${message}`, { duration: 5000 });
          if (onNewNotification) onNewNotification(data.data);
        }
      } catch {}
    };
    wsRef.current.onclose = (e) => {
      setConnected(false);
      if (retryRef.current < 5 && e.code !== 4001) {
        setTimeout(connect, Math.pow(2, retryRef.current++) * 1000);
      }
    };
  }, [token, onNewNotification]);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close(1000);
  }, [connect]);

  return { connected, unreadCount, resetUnreadCount: () => setUnreadCount(0) };
}
