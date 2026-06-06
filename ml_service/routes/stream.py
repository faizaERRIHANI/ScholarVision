import os, time, threading, requests
import numpy as np
from datetime import datetime, timezone
from flask import Blueprint, jsonify, current_app
from utils.image_utils import encode_image_base64

stream_bp = Blueprint("stream", __name__)

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

_stream_state = {"is_streaming": False, "thread": None, "fps": 0.0,
                 "last_frame_b64": None, "camera_index": 0}
_stream_lock = threading.Lock()

def _check_camera():
    if not CV2_AVAILABLE: return False
    try:
        cap = cv2.VideoCapture(0)
        ok = cap.isOpened(); cap.release(); return ok
    except: return False

@stream_bp.route("/stream/status", methods=["GET"])
def stream_status():
    return jsonify({"camera_available": _check_camera(),
                    "is_streaming": _stream_state["is_streaming"],
                    "fps": _stream_state["fps"],
                    "cv2_available": CV2_AVAILABLE})

@stream_bp.route("/stream/start", methods=["POST"])
def stream_start():
    with _stream_lock:
        if _stream_state["is_streaming"]:
            return jsonify({"success": True, "message": "Streaming déjà actif"})
        if not CV2_AVAILABLE:
            return jsonify({"error": "OpenCV non disponible"}), 503
        if not _check_camera():
            return jsonify({"error": "Webcam non détectée — VMware: VM > Removable Devices > Webcam > Connect"}), 503
        _stream_state["is_streaming"] = True
        _stream_state["thread"] = threading.Thread(
            target=_stream_worker, args=(current_app._get_current_object(),), daemon=True)
        _stream_state["thread"].start()
    return jsonify({"success": True, "message": "Streaming démarré", "interval_seconds": 2})

@stream_bp.route("/stream/stop", methods=["POST"])
def stream_stop():
    with _stream_lock:
        _stream_state["is_streaming"] = False
    return jsonify({"success": True, "message": "Streaming arrêté"})

@stream_bp.route("/stream/snapshot", methods=["GET"])
def stream_snapshot():
    if not CV2_AVAILABLE:
        return jsonify({"error": "OpenCV non disponible"}), 503
    try:
        cap = cv2.VideoCapture(_stream_state["camera_index"])
        if not cap.isOpened():
            return jsonify({"error": "Webcam inaccessible"}), 503
        ret, frame = cap.read(); cap.release()
        if not ret: return jsonify({"error": "Capture échouée"}), 500
        return jsonify({"success": True, "frame": encode_image_base64(frame),
                        "timestamp": datetime.now(timezone.utc).isoformat()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def _stream_worker(app):
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
    api_key = os.getenv("BACKEND_API_KEY", "")
    with app.app_context():
        service = app.config.get("RECOGNITION_SERVICE")
        cap = cv2.VideoCapture(_stream_state["camera_index"])
        if not cap.isOpened():
            _stream_state["is_streaming"] = False; return
        frame_count, start_time = 0, time.time()
        try:
            while _stream_state["is_streaming"]:
                t0 = time.time()
                ret, frame = cap.read()
                if not ret: time.sleep(0.5); continue
                _stream_state["last_frame_b64"] = encode_image_base64(frame)
                if service:
                    try:
                        for r in service.process_camera_frame(frame):
                            if r.get("found") and r.get("person_id"):
                                try:
                                    requests.post(f"{backend_url}/api/attendance/facial",
                                        json={"person_id": r["person_id"], "person_type": r["person_type"],
                                              "confidence_score": r["confidence"], "detection_method": "facial"},
                                        headers={"X-ML-API-Key": api_key}, timeout=3)
                                except: pass
                    except Exception as e:
                        print(f"[Stream] Erreur reconnaissance : {e}")
                frame_count += 1
                elapsed = time.time() - start_time
                if elapsed > 0: _stream_state["fps"] = round(frame_count / elapsed, 1)
                time.sleep(max(0, 2.0 - (time.time() - t0)))
        finally:
            cap.release()
            _stream_state["is_streaming"] = False
            _stream_state["fps"] = 0.0
            print("[Stream] Thread arrêté")
