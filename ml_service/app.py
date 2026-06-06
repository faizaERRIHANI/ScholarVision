import os, sys, logging
from datetime import datetime, timezone
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)])
logger = logging.getLogger("ScholarVision.ml")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173", "http://localhost:8000",
    "http://127.0.0.1:5173", "http://127.0.0.1:8000"
], "methods": ["GET","POST","PUT","DELETE","OPTIONS"],
   "allow_headers": ["Content-Type","Authorization","X-ML-API-Key"]}})

app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024

def init_models():
    logger.info("=" * 50)
    logger.info("  ScholarVision ML Service — Démarrage")
    logger.info("=" * 50)
    try:
        from services.recognition_service import RecognitionService
        service = RecognitionService()
        app.config["RECOGNITION_SERVICE"] = service
        app.config["MODELS_LOADED"] = True
        logger.info("✅ RecognitionService initialisé")
    except Exception as e:
        logger.error(f"❌ Erreur modèles : {e}")
        app.config["RECOGNITION_SERVICE"] = None
        app.config["MODELS_LOADED"] = False
    app.config["START_TIME"] = datetime.now(timezone.utc).isoformat()

def register_blueprints():
    try:
        from routes.recognition import recognition_bp
        app.register_blueprint(recognition_bp)
        logger.info("✅ Blueprint recognition")
    except Exception as e:
        logger.error(f"❌ Blueprint recognition : {e}")
    try:
        from routes.stream import stream_bp
        app.register_blueprint(stream_bp)
        logger.info("✅ Blueprint stream")
    except Exception as e:
        logger.error(f"❌ Blueprint stream : {e}")

@app.route("/", methods=["GET"])
def index():
    service = app.config.get("RECOGNITION_SERVICE")
    return jsonify({
        "service": "ScholarVision ML Service", "version": "1.0.0", "status": "running",
        "models_loaded": app.config.get("MODELS_LOADED", False),
        "models": service.get_status() if service else {},
        "started_at": app.config.get("START_TIME")
    })

@app.route("/health", methods=["GET"])
def health():
    from utils.db_utils import test_connection
    db_ok = test_connection()
    service = app.config.get("RECOGNITION_SERVICE")
    yolo_ok = service.detector.model_loaded if service else False
    arcface_ok = service.embedder.model_loaded if service else False
    status = "healthy" if (db_ok and yolo_ok and arcface_ok) else "degraded"
    return jsonify({"status": status,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "checks": {"database": "ok" if db_ok else "error",
                               "yolo": "ok" if yolo_ok else "not_loaded",
                               "arcface": "ok" if arcface_ok else "not_loaded"}}), \
           200 if status == "healthy" else 503

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Route introuvable"}), 404

@app.errorhandler(500)
def internal_error(e):
    logger.error(f"Erreur 500 : {e}")
    return jsonify({"error": "Erreur interne du serveur"}), 500

if __name__ == "__main__":
    init_models()
    register_blueprints()
    port = int(os.getenv("FLASK_PORT", 5001))
    logger.info(f"🚀 Démarrage sur http://localhost:{port}")
    app.run(host="0.0.0.0", port=port,
            debug=os.getenv("FLASK_DEBUG","1")=="1",
            threaded=True, use_reloader=False)
